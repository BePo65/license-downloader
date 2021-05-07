/* eslint-disable security/detect-non-literal-fs-filename */
import fs from 'fs';
import path from 'path';
import stream from 'stream';
import { promisify } from 'util';
import got from 'got';
import debug from 'debug';

import { licenseFileName } from './util.js';

const debugForApp = debug('license-downloader');

/**
 * Gets the options for 'got' requests to npmjs
 * @param {number} maxAttempts - maximum number of retries for 'got' request
 * @param {string} name - name of the requested package
 * @returns {object} object with the options for 'got' request
 */
function gotNpmjsOptions(maxAttempts, name) {
  return {
    responseType: 'json',
    retry: maxAttempts,
    hooks: {
      beforeRetry: [
        // eslint-disable-next-line no-unused-vars
        (options, error, retryCount) => {
          debugForApp(`http request to npm for package "${name}" failed, retrying again soon...`);
        }
      ],
      beforeError: [
        error => {
          debugForApp(error);
          return error;
        }
      ]
    }
  };
}

/**
 * Gets the options for 'got' requests to github to download license files
 * @param {number} maxAttempts - maximum number of retries for 'got' request
 * @param {string} url - github url of the requested file
 * @returns {object} object with the options for 'got' request
 */
function gotGithubOptions(maxAttempts, url) {
  return {
    retry: maxAttempts,
    hooks: {
      beforeRetry: [
        // eslint-disable-next-line no-unused-vars
        (options, error, retryCount) => {
          debugForApp(`http request to github for license file at "${url}" failed, retrying again soon...`);
        }
      ],
      beforeError: [
        error => {
          debugForApp(error);
          return error;
        }
      ]
    }
  };
}

/**
 * Gets the full package name from the link property in the license-report object,
 * when link is a git uri
 * @param {string} link - link property in the license-report object
 * @returns {string} full package name
 */
function getPackageNameFromLinkGit(link) {
  let packageName = '';
  const results = link.match(/.+github\.com\/(.+\/.+)\.git/i);
  if ((results !== null) && (results.length === 2)) {
    packageName = results[1];
  }
  return packageName;
}

/**
 * Gets the full package name from the link property in the license-report object,
 * when link is a http(s) uri
 * @param {string} link - link property in the license-report object
 * @returns {string} full package name
 */
function getPackageNameFromLinkHttp(link) {
  let packageName = '';
  const results = link.match(/.+github\.com\/(.+\/.+)/i);
  if ((results !== null) && (results.length === 2)) {
    packageName = results[1];
  }
  return packageName;
}

/**
 *Gets the full package name from the link property in the license-report object
 * @param {string} link - link property in the license-report object
 * @returns {string} full package name
 */
function getPackageNameFromLink(link) {
  let githubPackageName = '';
  if ((link !== undefined) && (link.length > 0)) {
    switch (true) {
    case (link.startsWith('git')):
      githubPackageName = getPackageNameFromLinkGit(link);
      break;
    case (link.startsWith('http')):
      githubPackageName = getPackageNameFromLinkHttp(link);
      break;
    default:
      console.error(`Did not find the package in '${link}'`);
      break;
    }
  }

  return githubPackageName;
}

/**
 * Adds path to license file to objec array
 * @param {*} packagesInfos - array of objects generated from the license-report generated json file
 * @param {object} httpRetryOptions - options for 'got' requests
 */
export async function addLicenseFilePath(packagesInfos, httpRetryOptions) {
  if ((packagesInfos !== undefined) && Array.isArray(packagesInfos) && (packagesInfos.length > 0)) {
    await Promise.all(packagesInfos.map(async element => {
      element.licenseFileLink = '';
      if (element.link !== undefined) {
        const githubPackageName = getPackageNameFromLink(element.link);
        if (githubPackageName.length !== 0) {
          const licenseInfoAdr = `https://api.github.com/repos/${githubPackageName}/license`;
          try {
            const options = gotNpmjsOptions(httpRetryOptions.maxAttempts, githubPackageName);
            const result = await got(licenseInfoAdr, options);
            const licenseInfo = result.body;
            if ((licenseInfo.download_url !== undefined) && (licenseInfo.download_url.length > 0)) {
              element.licenseFileLink = licenseInfo.download_url;
            }
          } catch (error) {
            const message = `the project on github '${licenseInfoAdr}' does not contain a license file ('${error.message}')`;
            debugForApp(message);
          }
        }
      }
    }));
  } else {
    console.error('No entries in license-report file found');
  }
}

/**
 * Download all license files to target directory
 * @param {*} packagesInfos - array of objects with package infos including path to license file
 * @param {string} targetDirectory - path of directory for downloaded license files
 */
export async function downloadLicenseFiles(packagesInfos, targetDirectory) {
  const pipeline = promisify(stream.pipeline);
  fs.mkdirSync(targetDirectory, {recursive: true});

  // Download files
  for (const packageInfos of packagesInfos) {
    if (packageInfos.licenseFileLink.length > 0) {
      const { scope, packageName } = licenseFileName(packageInfos.name, packageInfos.installedVersion);

      // scoped packages are written in subdirectory named after scope
      let filePath = targetDirectory;
      if (scope.length > 0) {
        filePath = path.join(filePath, scope);
        fs.mkdirSync(filePath);
      }
      const fileName = path.join(filePath, `${packageName}-LICENSE`);
      const fileWriterStream = fs.createWriteStream(fileName);
      fileWriterStream
        .on('error', error => {
          debugForApp(`Could not write license file to disk: ${error.message}`);
        });

      await pipeline(
        got.stream(packageInfos.licenseFileLink, gotGithubOptions),
        fileWriterStream
      );
    }
  }
}
