# license-downloader - an add-on to license-report tool
![Version](https://img.shields.io/badge/version-0.1.0-blue.svg?cacheSeconds=2592000)
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

The downloaded licenses and a copy of the 'license-report.json' file with properties 'licenseFileLink' added are saved to the './license-files' directory (option `--licDir`).

### Usage without downloading the license files:
```sh
cd your/project/
npx license-report > ./license-report.json
npx license-downloader --source ./license-report.json
```

The copy of the 'license-report.json' file with properties 'licenseFileLink' added is saved to the directory of the source file.

## debug

```sh
export DEBUG=license-downloader*
```
