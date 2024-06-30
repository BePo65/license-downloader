# license-downloader - an add-on to license-report tool
![Version](https://img.shields.io/badge/version-1.0.12-blue.svg?cacheSeconds=2592000)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](#)

> Download the license files of the dependencies of a project based on the json report from the package 'license-report'.

## Install

```sh
npm install license-downloader
```

## Usage

'license-downloader' uses the github REST API to find the location of the license files of the project (dev-) dependencies. The license file location does not depend on the package version. Details about how the license file is detected can be found in [licensee/licensee > What we look at](https://github.com/licensee/licensee/blob/master/docs/what-we-look-at.md) and [licensee/licensee > README](https://github.com/licensee/licensee/tree/master/docs).

Optionally it downloads these files to a given directory.

### Usage with downloading the license files:
```sh
cd your/project/
npx license-report > ./license-report.json
npx license-downloader --source ./license-report.json --licDir ./license-files --download
```

A copy of the 'license-report.json' file with properties 'licenseFileLink' added is saved to the './license-files' directory (defined in option `--licDir`). The downloaded licenses are save in a subdirectory named 'licenses' in the directory defined in `--licDir`.

If option `--licDir` is missing, the modified 'license-report.json' file and the 'licenses' subdirectory are written to the path of the source file.

### Usage without downloading the license files:
```sh
cd your/project/
npx license-report > ./license-report.json
npx license-downloader --source ./license-report.json
```

The copy of the 'license-report.json' file with properties 'licenseFileLink' added is saved to the directory of the source file.

## Authorization in GitHub

License-downloader uses the github api to collect information about the license file of a project. If the rate limit for anonymous access to this api is exceeded (60 accesses per hour) you will get warnings like this:
```
kessler/node-tableify: License query failed. Rate limit of 60 requests per hour exceeded. please wait 1534 seconds before trying again.
caolan/async: License query failed. Rate limit of 60 requests per hour exceeded. please wait 1534 seconds before trying again.
```

To avoid this problem you can use a github personal access token to use the higher limits of your personal github plan.

There are 2 possibilities:

**use a file (recommended)**

write the github token, generated in your github developer settings, to a file.

The full path to this file is written to an environment variable and the name of this environment variable is set in the config parameter 'githubToken.tokenFileEnvVar':
```sh
export GITHUB_TOKEN_FILE=/run/secrets/github_pat.txt
cd your/project/
npx license-report > ./license-report.json
npx license-downloader --source ./license-report.json --licDir ./license-files --githubToken.tokenFileEnvVar GITHUB_TOKEN_FILE --download
```
This is the most secure variant, as access rights can be and should be set for this file to prevent unauthorized access.

**use an environment variable**

write the github token, generated in your github developer settings, to an environment variable and use the name of this environment variable in the config parameter 'githubToken.tokenEnvVar':
```sh
export GITHUB_TOKEN=yourgithubtoken
cd your/project/
npx license-report > ./license-report.json
npx license-downloader --source ./license-report.json --licDir ./license-files --githubToken.tokenEnvVar GITHUB_TOKEN --download
```

## Show debug log

Use in linux shell
```sh
export DEBUG=license-downloader
```
or in windows command line
```sh
SET DEBUG=license-downloader
```

## Development

This repo uses standard-changelog to create the CHANGELOG. To ensure that the commit messages follow the standard-changelog rules, husky is used for git hooks.

To initialize the git hooks after checking out the repo, run `npx husky install`.

Allowed types for commit messages are:
+ build
+ ci
+ docs
+ feat
+ fix
+ perf
+ refactor
+ release
+ revert
+ style
+ test

Allowed scopes are:
+ app
+ hacks
+ tools
