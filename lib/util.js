import path from 'path';
import fs from 'fs';
import { debug } from 'console';

const defaultTargetSubdirectory = 'licenses';

/**
 * Creates full filepath for modified license-report from filepath of
 * original license-report file.
 * If targetDirectory is undefined, the directory of the source file is used.
 * @param {string} sourceFilename - filepath of original license-report file
 * @param {string} targetDirectory - output directory for generated filename
 * @returns {string} filepath for modified license-report file
 */
export function sourceToTargetFilename(sourceFilename, targetDirectory) {
  if ((typeof sourceFilename === 'string') && (sourceFilename.trim().length > 0)) {
    const extension = path.extname(sourceFilename);
    const fileBasename = path.basename(sourceFilename).slice(0, -1 * extension.length);
    let targetDir = targetDirectory;
    if ((targetDir === undefined) || (targetDir === null) || (targetDir.trim().length === 0)) {
      targetDir = path.dirname(sourceFilename);
    }
    const targetFilename = path.join(targetDir, `${fileBasename}.ext${extension}`);
    return targetFilename;
  } else {
    throw new Error('Source filename must not be empty to generate target filename');
  }
}

/**
 * Gets target directory for downloaded license files
 * @param {string} licenseDirectory - full path to download directory
 * @param {string} sourceDirectory - full path to the directory containing the source json file
 * @returns {string} full path to  download directory
 */
export function licenseFilesTargetFolder(licenseDirectory, sourceDirectory) {
  let targetFolder = '';
  if ((licenseDirectory !== undefined) && (licenseDirectory !== null) && (licenseDirectory.length > 0)) {
    targetFolder = licenseDirectory;
  } else {
    if ((sourceDirectory !== undefined) && (sourceDirectory !== null) && (sourceDirectory.length > 0)) {
      targetFolder = path.join(sourceDirectory, defaultTargetSubdirectory);
    } else {
      targetFolder = defaultTargetSubdirectory;
    }
  }
  return targetFolder;
}

/**
 * Gets optional scope and filename for license file
 * @param {string} fullPackageName - name property from packageInfo
 * @returns {object} with properties scope and packageName as strings
 */
export function licenseFileName(fullPackageName) {
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
 *
 * @param {object} githubTokenConfig - object with authorization data {tokenEnvVar, tokenFileEnvVar}
 * @returns {string} github authorization token or undefined
 */
export function tokenFromConfigObject(githubTokenConfig) {
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

  return token;
}

export default {
  sourceToTargetFilename,
  licenseFilesTargetFolder,
  licenseFileName,
  tokenFromConfigObject
};
