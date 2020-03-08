import { createChangesets } from "../src/pr-to-changesets";
import path from "path";
import * as assert from "assert";

describe('createChangesets', function () {
    it("is example", async () => {
        // https://github.com/secretlint/secretlint/pull/78
        const changesets = await createChangesets({
            rootDir: path.join(__dirname, "fixtures/secretlint"),
            owner: "secretlint",
            repo: "secretlint",
            pullRequestNumber: 78,
            token: process.env.GITHUB_TOKEN!,
            majorLabels: ["Type: BREAKING CHANGE"],
            minorLabels: ["Type: Feature"],
            patchLabels: ["Type: Bug"]
        });
        console.log(changesets);
        assert.strictEqual(changesets, `---
"@secretlint/config-loader": minor
"@secretlint/node": minor
"@secretlint/profiler": minor
"secretlint": minor
---
    
cli: support --secretlintrcJSON flag [#78](https://github.com/secretlint/secretlint/pull/78)
    
It allow to pass JSON string instead of secretlintrc file path.
This feature is useful for in-memory linting like history scanner https://github.com/secretlint/secretlint/issues/34

\`\`\`
git filter-branch --tree-filter 'secretlint --secretlintrcJSON "$(cat .secretlintrc.json)" "**/*" --debug"' --all
\`\`\`
`)
    })
});
