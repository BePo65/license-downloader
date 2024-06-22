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
export const sourceToTargetFilename = (sourceFilename, targetDirectory) => {
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
export const licenseFilesTargetFolder = (licenseDirectory, sourceDirectory) => {
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

export default {
  sourceToTargetFilename,
  licenseFilesTargetFolder
};
