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

## Show debug log

```sh
export DEBUG=license-downloader*
```
