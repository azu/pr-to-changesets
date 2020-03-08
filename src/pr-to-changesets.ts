import { Octokit } from "@octokit/rest";
import { getPackages } from "@monorepo-utils/package-utils";
import path from "path";
import conventionalCommitsParser from "conventional-commits-parser";

export type createChangesetsOptions = {
    /**
     * monorepo rootDir
     * Default: cwd
     */
    rootDir: string;
    /**
     * `owner`/repo
     */
    owner: string;
    /**
     * owner/`repo`
     */
    repo: string;
    /**
     * Pull Request number
     * it is based for generating
     */
    pullRequestNumber: number;
    /**
     * GitHub TOKEN
     */
    token: string;
    /**
     * GitHub API's base URL
     */
    baseUrl?: string;
    // Labels for semver
    majorLabels: string[];
    minorLabels: string[];
    patchLabels: string[];
    defaultSemVer?: SemverType;
};
const fetchPullRequest = async (options: createChangesetsOptions) => {
    const octokit = new Octokit({
        auth: options.token,
        baseUrl: options.baseUrl ?? "https://api.github.com"
    });
    return octokit.pulls.get({
        owner: options.owner,
        repo: options.repo,
        pull_number: options.pullRequestNumber
    });
};

export type SemverType = "patch" | "minor" | "major";
type ConvertOptions = {
    title: string;
    body: string;
    url: string;
    packageNames: string[];
    semver: SemverType;
    pullRequestNumber: number;
};
const convertToMarkdownWithYaml = ({ title, body, url, packageNames, semver, pullRequestNumber }: ConvertOptions) => {
    const titleAsConventionalCommit = conventionalCommitsParser.sync(title);

    const scope = titleAsConventionalCommit.scope ? `${titleAsConventionalCommit.scope}: ` : "";
    const subject = titleAsConventionalCommit.subject ?? title;
    return `---
${packageNames
    .map(name => {
        return `"${name}": ${semver}`;
    })
    .join("\n")}
---
    
${scope}${subject} [#${String(pullRequestNumber)}](${url})
    
${body}
`;
};
export type calculateSemverFromLabelsOptions = {
    labels: string[];
    defaultSemVer?: SemverType;
    majorLabels: string[];
    minorLabels: string[];
    patchLabels: string[];
};
export const calculateSemverFromLabels = (options: calculateSemverFromLabelsOptions) => {
    const defaultSemVer = options.defaultSemVer === undefined ? "patch" : options.defaultSemVer;
    const majorTypes = options.majorLabels ?? ["Semver: major"];
    const minorTypes = options.minorLabels ?? ["Semver: minor"];
    const patchTypes = options.patchLabels ?? ["Semver: patch"];
    if (options.labels.some(label => majorTypes.includes(label))) {
        return "major";
    } else if (options.labels.some(label => minorTypes.includes(label))) {
        return "minor";
    } else if (options.labels.some(label => patchTypes.includes(label))) {
        return "patch";
    }
    return defaultSemVer;
};
export const fetchChangedPackagesInPullRequests = async (options: createChangesetsOptions): Promise<Set<string>> => {
    const octokit = new Octokit({
        auth: options.token,
        baseUrl: options.baseUrl ?? "https://api.github.com"
    });
    const response = await octokit.pulls.listFiles({
        owner: options.owner,
        repo: options.repo,
        pull_number: options.pullRequestNumber
    });
    const files = response.data;
    // monorepo {dir, package}
    const packages = getPackages(options.rootDir).map(pkgInfo => {
        return {
            relativePath: path.relative(options.rootDir, pkgInfo.location),
            location: pkgInfo.location,
            packageJSON: pkgInfo.packageJSON
        };
    });
    const changedResultSet: Set<string> = new Set();
    files.forEach(file => {
        const foundPackage = packages.find(pkg => {
            return file.filename.startsWith(pkg.relativePath);
        });
        if (foundPackage && foundPackage.packageJSON.name) {
            changedResultSet.add(foundPackage.packageJSON.name);
        }
    });
    return changedResultSet;
};
export const createChangesets = async (options: createChangesetsOptions) => {
    const response = await fetchPullRequest(options);
    const changedPackageNames = await fetchChangedPackagesInPullRequests(options);
    return convertToMarkdownWithYaml({
        title: response.data.title,
        body: response.data.body,
        semver: calculateSemverFromLabels({
            majorLabels: options.majorLabels,
            minorLabels: options.minorLabels,
            patchLabels: options.patchLabels,
            defaultSemVer: options.defaultSemVer,
            labels: response.data.labels.map(label => label.name)
        }),
        url: response.data.html_url,
        pullRequestNumber: options.pullRequestNumber,
        packageNames: [...changedPackageNames]
    });
};
