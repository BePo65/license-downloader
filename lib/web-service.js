import fs from 'fs';
import path from 'path';
import stream from 'stream';
import { promisify } from 'util';
import got from 'got';
import debug from 'debug';

import FsService from './filesystem-service.js';

const debugForApp = debug('license-downloader');

/**
 * Gets optional scope and filename for license file
 * @param {string} fullPackageName - name property from packageInfo
 * @returns {object} with properties scope and packageName as strings
 */
const licenseFileName = (fullPackageName) => {
  let scope = '';
  let packageName = fullPackageName;
  if (fullPackageName.startsWith('@')) {
    const indexOfScopeSeparator = fullPackageName.indexOf('/');
    scope = fullPackageName.substring(0, indexOfScopeSeparator);
    packageName = packageName.substring(indexOfScopeSeparator + 1);
  }

  return {scope, packageName};
}

/**
 * Gets github authorization token from file; the full filename is defined in the
 * environment variable whose name is defined in tokenFileEnvVar.
 * If tokenFileEnvVar is empty the token is taken from the environment variable
 * whose name is defined in tokenEnvVar.
 * @param {object} githubTokenConfig - object with authorization data {tokenEnvVar, tokenFileEnvVar}
 * @returns {string} github authorization token or undefined
 */
const tokenFromConfigObject = (githubTokenConfig) => {
  let token;
  const tokenFileEnvVar = githubTokenConfig.tokenFileEnvVar;
  if ((tokenFileEnvVar !== undefined) && (typeof tokenFileEnvVar === 'string') && (tokenFileEnvVar.length > 0)) {
    // eslint-disable-next-line security/detect-object-injection
    const tokenFile = process.env[tokenFileEnvVar];
    if ((tokenFile !== undefined)	&& (tokenFile.length > 0)) {
      if (fs.existsSync(tokenFile)) {
        const tempToken = fs.readFileSync(tokenFile, {encoding: 'utf8'});
        if (tempToken.length > 0) {
          token = tempToken;
        }
      } else {
        debug(`Get github token: File defined in environment variable '${tokenFileEnvVar}' ('${tokenFile}') does not exist`);
      }
    }
  } else {
    const tokenEnvVar = githubTokenConfig.tokenEnvVar;
    if ((tokenEnvVar !== undefined) && (typeof tokenEnvVar === 'string') && (tokenEnvVar.length > 0)) {
      // eslint-disable-next-line security/detect-object-injection
      const tempToken = process.env[tokenEnvVar];
      if ((tempToken !== undefined)	&& (tempToken.trim().length > 0)) {
        token = tempToken;
      }
    }
  }

  return token?.replace(/^Bearer +/u, '');
}

/**
 * Gets the options for 'got' requests to github api for json data
 * @param {number} maxAttempts - maximum number of retries for 'got' request
 * @param {string} name - name of the requested package
 * @param {object} githubTokenConfig - object with authorization data {tokenEnvVar, tokenFileEnvVar}
 * @returns {object} object with the options for 'got' request
 */
const gotGithubJsonOptions = (maxAttempts, name, githubTokenConfig = {}) => {
  const gotOptions = {
    responseType: 'json',
    retry: {limit: maxAttempts},
    hooks: {
      beforeRetry: [
        // eslint-disable-next-line no-unused-vars
        (error, retryCount) => {
          debugForApp(`http request to github api for package "${name}" license info failed, retrying again soon...`);
        }
      ]
    }
  };

  const token = tokenFromConfigObject(githubTokenConfig);
  // no idea how to prevent timing attacks for the download operations
  // eslint-disable-next-line security/detect-possible-timing-attacks
  if (token !== undefined) {
    gotOptions.headers = {
      Authorization: `Bearer ${token}`
    };
  }

  return gotOptions;
}

/**
 * Gets the options for 'got' requests to github to download license files
 * @param {number} maxAttempts - maximum number of retries for 'got' request
 * @param {string} url - github url of the requested file
 * @param {object} githubTokenConfig - object with authorization data {tokenEnvVar, tokenFileEnvVar}
 * @returns {object} object with the options for 'got' request
 */
const gotGithubLicenseFileOptions = (maxAttempts, url, githubTokenConfig = {}) => {
  const gotOptions = {
    retry: {limit: maxAttempts},
    hooks: {
      beforeRetry: [
        // eslint-disable-next-line no-unused-vars
        (error, retryCount) => {
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

  const token = tokenFromConfigObject(githubTokenConfig);
  // no idea how to prevent timing attacks for the download operations
  // eslint-disable-next-line security/detect-possible-timing-attacks
  if (token !== undefined) {
    gotOptions.headers = {
      Authorization: `Bearer ${token}`
    };
  }

  return gotOptions;
}

/**
 * Gets the full package name from the link property in the license-report object,
 * when link is a git uri
 * @param {string} link - link property in the license-report object
 * @returns {string} full package name
 */
const getPackageNameFromLinkGit = (link) => {
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
const getPackageNameFromLinkHttp = (link) => {
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
 const getPackageNameFromLink = (link) => {
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
 * Adds path to license file to object array
 * @param {*} packagesInfos - array of objects generated from the license-report generated json file
 * @param {object} httpRetryOptions - http retry options for 'got' requests ({maxAttempts})
 * @param {object} authorizationOptions - authorization options for 'got' requests {tokenEnvVar, tokenFileEnvVar}
 */
export const addLicenseFilePath = async (packagesInfos, httpRetryOptions = {}, authorizationOptions = {}) => {
  if ((packagesInfos !== undefined) && Array.isArray(packagesInfos) && (packagesInfos.length > 0)) {
    await Promise.all(packagesInfos.map(async element => {
      element.licenseFileLink = '';
      if (element.link !== undefined) {
        const githubPackageName = getPackageNameFromLink(element.link);
        if (githubPackageName.length !== 0) {
          const licenseInfoAdr = `https://api.github.com/repos/${githubPackageName}/license`;
          try {
            const options = gotGithubJsonOptions(httpRetryOptions.maxAttempts, githubPackageName, authorizationOptions);
            const result = await got(licenseInfoAdr, options);
            const licenseInfo = result.body;
            if ((licenseInfo.download_url !== undefined) && (licenseInfo.download_url.length > 0)) {
              element.licenseFileLink = licenseInfo.download_url;
            }
          } catch (error) {
            console.error(`the project '${githubPackageName}' does not contain a license file on github`);
            debugForApp(`no license file on '${licenseInfoAdr}' ('${error.message}')`);
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
 * @param {object} httpRetryOptions - http retry options for 'got' requests ({maxAttempts})
 * @param {object} authorizationOptions - authorization options for 'got' requests {tokenEnvVar, tokenFileEnvVar}
 */
export const downloadLicenseFiles = async (packagesInfos, targetDirectory, httpRetryOptions = {}, authorizationOptions = {}) => {
  const pipeline = promisify(stream.pipeline);
  FsService.createDirIfNotExists(targetDirectory);

  // Download files
  for (const packageInfos of packagesInfos) {
    if (packageInfos.licenseFileLink.length > 0) {
      const { scope, packageName } = licenseFileName(packageInfos.name);

      // scoped packages are written in subdirectory named after scope
      let filePath = targetDirectory;
      if (scope.length > 0) {
        filePath = path.join(filePath, scope);
        FsService.createDirIfNotExists(filePath);
      }
      const fileName = path.join(filePath, `${packageName}.LICENSE.txt`);
      const fileWriterStream = fs.createWriteStream(fileName);
      fileWriterStream
        .on('error', error => {
          debugForApp(`Could not write license file to disk: ${error.message}`);
        });

      const url = packageInfos.licenseFileLink;
      await pipeline(
        got.stream(url, gotGithubLicenseFileOptions(httpRetryOptions.maxAttempts, url, authorizationOptions)),
        fileWriterStream
      );
    }
  }
}

export default {
  addLicenseFilePath,
  downloadLicenseFiles,
  licenseFileName,  // required to run tests on this internal function
  tokenFromConfigObject  // required to run tests on this internal function
};
