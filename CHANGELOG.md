# Changelog

All notable changes to this project will be documented in this file. See [commit-and-tag-version](https://github.com/absolute-version/commit-and-tag-version) for commit guidelines.

## [1.3.3](https://github.com/BePo65/license-downloader/compare/v1.3.2...v1.3.3) (2025-10-24)

### Bug Fixes

- update packages to remove security warnings ([ed33513](https://github.com/BePo65/license-downloader/commit/ed335136b83d817e8ebeb2ecd6a5baadba8e5757))
- use "node:" in imports ([dc35d48](https://github.com/BePo65/license-downloader/commit/dc35d480f30f4508ceeae9de7c83f5a5f26c09b9))

## [1.3.2](https://github.com/BePo65/license-downloader/compare/v1.3.1...v1.3.2) (2025-05-02)

## [1.3.1](https://github.com/BePo65/license-downloader/compare/v1.3.0...v1.3.1) (2024-12-10)

### Bug Fixes

- update packages to fix github dependabot security warnings ([91ff3d9](https://github.com/BePo65/license-downloader/commit/91ff3d99861db72264b7230f64cf3c7fce9461e3))
- update packages to fix github dependabot security warnings ([f7e3ec2](https://github.com/BePo65/license-downloader/commit/f7e3ec202e0790ff79ca2088ec92d9490873a7ef))

## [1.3.0](https://github.com/BePo65/license-downloader/compare/v1.2.0...v1.3.0) (2024-09-17)

## [1.2.0](https://github.com/BePo65/license-downloader/compare/v1.1.0...v1.2.0) (2024-09-12)

### Features

- support GITHUB_TOKEN env variable by default ([258f8e0](https://github.com/BePo65/license-downloader/commit/258f8e02c39e61cd4c3b5e85df68f068b85bea84))

## [1.1.0](https://github.com/BePo65/license-downloader/compare/v1.0.12...v1.1.0) (2024-06-30)

### Features

- add --help flag for cli to show short documentation ([cb02040](https://github.com/BePo65/license-downloader/commit/cb020408288e857f8dab5802fbbe7d192e0e0477))

### Bug Fixes

- fix handling of authorization
- fix handling of packages with long package path or not ending with '.git'

## [1.0.12](https://github.com/BePo65/license-downloader/compare/v1.0.11...v1.0.12) (2024-06-22)

## [1.0.11](https://github.com/BePo65/license-downloader/compare/v1.0.10...v1.0.11) (2024-06-22)

## [1.0.10](https://github.com/BePo65/license-downloader/compare/v1.0.9...v1.0.10) (2024-06-05)

## [1.0.9](https://github.com/BePo65/license-downloader/compare/v1.0.8...v1.0.9) (2024-03-02)

### [1.0.8](https://github.com/BePo65/license-downloader/compare/v1.0.7...v1.0.8) (2023-04-23)

### [1.0.7](https://github.com/BePo65/license-downloader/compare/v1.0.6...v1.0.7) (2022-05-01)

### [1.0.6](https://github.com/BePo65/license-downloader/compare/v1.0.5...v1.0.6) (2022-04-01)

### [1.0.5](https://github.com/BePo65/license-downloader/compare/v1.0.4...v1.0.5) (2022-02-16)

### [1.0.4](https://github.com/BePo65/license-downloader/compare/v1.0.3...v1.0.4) (2022-02-11)

### [1.0.3](https://github.com/BePo65/license-downloader/compare/v1.0.2...v1.0.3) (2021-05-13)

### [1.0.2](https://github.com/BePo65/license-downloader/compare/v1.0.1...v1.0.2) (2021-05-12)

### Bug Fixes

- index.js needs shebang for use with npx ([415b986](https://github.com/BePo65/license-downloader/commit/415b98621c2ddb50f5d07cc3586dedf816e2c810))

### [1.0.1](https://github.com/BePo65/license-downloader/compare/v1.0.0...v1.0.1) (2021-05-12)

### Bug Fixes

- add bin property to run program with npx ([43443f7](https://github.com/BePo65/license-downloader/commit/43443f7c83e2b76d9f2f8c41c43f475ff35ddb79))

## [1.0.0](https://github.com/BePo65/license-downloader/compare/v0.3.1...v1.0.0) (2021-05-12)

### [0.3.1](https://github.com/BePo65/license-downloader/compare/v0.3.0...v0.3.1) (2021-05-12)

### Bug Fixes

- convert readme-updater to commonjs file ([4a5d1dd](https://github.com/BePo65/license-downloader/commit/4a5d1dd8abd89ea8b8d52372f529cdb60fa1ac61))

## 0.3.0 (2021-05-12)

### Features

- add authorization for github accesses ([e022c52](https://github.com/BePo65/license-downloader/commit/e022c52a9de32287cd4c974384a3d5ca141de972))
- add default export to modules ([e05aa5a](https://github.com/BePo65/license-downloader/commit/e05aa5a9eabca7ec74c75e57de2a0b08bdb8f4c4))
- add license file ([9da79f5](https://github.com/BePo65/license-downloader/commit/9da79f5c6b9b3253ca0f0b48f35a06ef64034ec8))
- get license files and export extended list fo file ([0a818bc](https://github.com/BePo65/license-downloader/commit/0a818bc2797e14219f9f1050fdec9013b2c052f1))
- rename license files to '<packageName>.LICENSE.txt ([2029f4a](https://github.com/BePo65/license-downloader/commit/2029f4a5694f39a96bd145167f6b9ed18da91590))

### Bug Fixes

- log to stderr improved when no license file found ([c1a4534](https://github.com/BePo65/license-downloader/commit/c1a45346e2aeb3fdb7812bb104d2bb83f2b19f74))
- no error when directory already exists on mkdir ([5736c2f](https://github.com/BePo65/license-downloader/commit/5736c2f302e030e43ede3c436edd2b861617d023))
- overwrite output json file when already exists ([ee89151](https://github.com/BePo65/license-downloader/commit/ee8915128cc261743e94189a81a5e439a8602e91))
- update readme file ([6fbe174](https://github.com/BePo65/license-downloader/commit/6fbe174635c8a72c14e38f8d0fd410be797ff929))
