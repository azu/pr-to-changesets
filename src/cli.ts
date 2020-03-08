import meow from "meow";
import { createChangesets, createChangesetsOptions, SemverType } from "./pr-to-changesets";
import { parseConfig } from "./config-parse";
import path from "path";
import * as fs from "fs";

export const cli = meow(
    `
    Usage
      $ pr-to-changesets [options]
 
    Options
      --owner             [Required] Owner name for repository: **owner**/repo
      --repo              [Required] Repo name for repository: owner/**repo**
      --token             [Required] GitHub Token. you can use als GITHUB_TOKEN env
      --pullRequestNumber [Required] GitHub Pull Request Number
      --majorLabels       [Required] labels split by comma. Default: "Semver: major"
      --minorLabels       [Required] labels split by comma. Default: "Semver: minor"
      --patchLabels       [Required] labels split by comma. Default: "Semver: patch"
      --defaultSemVer     Default Semver when no match any labels. Default: patch
      --rootDir           monorepo root dir. Default: current working dir
      --output            Path to output. Default: stdout
      --baseUrl           GitHub API base Url.
      --config            Path to config file
 
    Examples
      # Get https://github.com/secretlint/secretlint/pull/78 and output changesets content in secretlint project dir
      $ GITHUB_TOKEN=xxx pr-to-changesets --owner secretlint --repo secretlint --pullRequestNumber 78
`,
    {
        flags: {
            owner: {
                type: "string"
            },
            repo: {
                type: "string"
            },
            token: {
                type: "string"
            },
            majorLabels: {
                type: "string"
            },
            minorLabels: {
                type: "string"
            },
            patchLabels: {
                type: "string"
            },
            defaultSemVer: {
                type: "string"
            },
            rootDir: {
                type: "string"
            },
            pullRequestNumber: {
                type: "number"
            },
            output: {
                type: "string"
            },
            baseUrl: {
                type: "string"
            },
            dryRun: {
                type: "boolean",
                default: false
            },
            config: {
                type: "string"
            }
        },
        autoHelp: true,
        autoVersion: true
    }
);

const splitByComma = (str?: string) => {
    if (!str) {
        return [];
    }
    return str.split(",");
};

export const run = (_input = cli.input, flags = cli.flags) => {
    const config: Partial<createChangesetsOptions> = flags.config
        ? parseConfig(path.resolve(process.cwd(), flags.config))
        : {};
    // Prefer command line flags than config file
    return createChangesets({
        rootDir: flags.rootDir ?? process.cwd(),
        owner: flags.owner ?? config.owner,
        repo: flags.repo ?? config.repo,
        majorLabels: splitByComma(flags.majorLabels) ?? config.majorLabels,
        minorLabels: splitByComma(flags.minorLabels) ?? config.minorLabels,
        patchLabels: splitByComma(flags.patchLabels) ?? config.patchLabels,
        defaultSemVer: (flags.defaultSemVer ?? config.defaultSemVer) as SemverType | undefined,
        pullRequestNumber: flags.pullRequestNumber,
        baseUrl: flags.baseUrl ?? config.baseUrl,
        token: flags.token ?? config.token ?? process.env.GITHUB_TOKEN
    })
        .then(output => {
            if (flags.output) {
                fs.writeFileSync(flags.output, output, "utf-8");
                return { exitStatus: 0, stderr: null, stdout: "" };
            } else {
                return { exitStatus: 0, stderr: null, stdout: output };
            }
        })
        .catch(error => {
            return { exitStatus: 1, stderr: error, stdout: null };
        });
};
