import path from 'path';

import config from './lib/config.js';
import { readJson, writeJson } from './lib/filesystem-service.js';
import { addLicenseFilePath, downloadLicenseFiles } from './lib/github-service.js';
import { createDirFromFilename, licenseFilesTargetFolder, sourceToTargetFilename } from './lib/util.js';

(async () => {
  try {
    const sourceFilename = config.source;
    const json = await readJson(sourceFilename);
    await addLicenseFilePath(json, config.httpRetryOptions);
    const targetFilename = sourceToTargetFilename(sourceFilename, config.licDir);
    createDirFromFilename(targetFilename);
    await writeJson(json, targetFilename);
    if (config.download) {
      const sourceDirectory = path.dirname(sourceFilename);
      const targetDirectory = licenseFilesTargetFolder(config.licDir, sourceDirectory);
      await downloadLicenseFiles(json, targetDirectory);
    }
  } catch (e) {
    console.error(e.message);
    process.exit(1);  // eslint-disable-line no-process-exit
  }
})();
