import meow from "meow";
import { createChangesets, createChangesetsOptions } from "./pr-to-changesets";
import { parseConfig } from "./config-parse";
import path from "path";
import * as fs from "fs";

export const cli = meow(
    `
    Usage
      $ pr-to-changesets
 
    Options
      --owner             [Required] Owner name for repository: **owner**/repo
      --repo              [Required] Repo name for repository: owner/**repo**
      --token             [Required] GitHub Token. you can use als GITHUB_TOKEN env
      --pullRequestNumber [Required] GitHub Pull Request Number
      --majorLabels major [Required] labels split by comma. Default: "Semver: major"
      --minorLabels minor [Required] labels split by comma. Default: "Semver: minor"
      --patchLabels patch [Required] labels split by comma. Default: "Semver: patch"
      --rootDir           monorepo root dir. Default: current working dir
      --output            Path to output. Default: stdout
      --baseUrl           GitHub API base Url.
      --config            Path to config file
 
    Examples
      $ pr-to-changesets
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

const splitByComma = (str: string) => {
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
