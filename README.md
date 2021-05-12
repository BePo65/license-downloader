# license-downloader - an add-on to license-report tool
![Version](https://img.shields.io/badge/version-0.2.0-blue.svg?cacheSeconds=2592000)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](#)

> Download the license files of the dependencies of a project based on the json report from the package 'license-report'.

## Install

```sh
npm install license-downloader
```

## Usage

'license-downloader' uses the github REST API to find the location of the license files of the project (dev-) dependencies (the license file location does not depend on the package version). Optionally it downloads these files to a given directory.

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
the project 'kessler/node-tableify' does not contain a license file on github
the project 'caolan/async' does not contain a license file on github
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
This is the most secure variant, as access rights can be and should be set for this file to prevent unauthorized acess.

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
