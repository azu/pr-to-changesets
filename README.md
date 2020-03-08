# pr-to-changesets

Create changesets content from Pull Request.

## Install

Install with [npm](https://www.npmjs.com/):

    npm install pr-to-changesets

## Usage


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

## config file

Config file is partial object of pr-to-changesets.

`pr-to-changesets.json`:

```json
{
  "majorLabels": ["Semver: major", "BREAKING CHANGE"],
  "minorLabels": ["Semver: minor", "feature"],
  "patchLabels": ["Semver: patch", "bug"]
}
```

## Changelog

See [Releases page](https://github.com/azu/pr-to-changesets/releases).

## Running tests

Install devDependencies and Run `npm test`:

    npm test

## Contributing

Pull requests and stars are always welcome.

For bugs and feature requests, [please create an issue](https://github.com/azu/pr-to-changesets/issues).

1. Fork it!
2. Create your feature branch: `git checkout -b my-new-feature`
3. Commit your changes: `git commit -am 'Add some feature'`
4. Push to the branch: `git push origin my-new-feature`
5. Submit a pull request :D

## Author

- [github/azu](https://github.com/azu)
- [twitter/azu_re](https://twitter.com/azu_re)

## License

MIT © azu
