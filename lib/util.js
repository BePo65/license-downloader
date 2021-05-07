import fs from 'fs';
import path from 'path';

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
 * @param {string} installedVersion - installed version as semver string
 * @returns {object} with properties scope and packageName as strings
 */
export function licenseFileName(fullPackageName, installedVersion) {
  let scope = '';
  let packageName = fullPackageName;
  if (fullPackageName.startsWith('@')) {
    const indexOfScopeSeparator = fullPackageName.indexOf('/');
    scope = fullPackageName.substring(0, indexOfScopeSeparator);
    packageName = packageName.substring(indexOfScopeSeparator + 1);
  }

  packageName = `${packageName}@${installedVersion}`;
  return {scope, packageName};
}

/**
 * Create directory for given file if not exist
 * @param {string} fullFilename - full path to a file
 */
export function createDirFromFilename(fullFilename) {
  const targetPath = path.dirname(fullFilename);
  fs.mkdirSync(targetPath);
}