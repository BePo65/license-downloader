import path from 'path';

import config from './lib/config.js';
import FsService from './lib/filesystem-service.js';
import WebService from './lib/web-service.js';
import util from './lib/util.js';

(async () => {
  try {
    const sourceFilename = config.source;
    const json = await FsService.readJson(sourceFilename);
    await WebService.addLicenseFilePath(json, config.httpRetryOptions);
    const targetFilename = util.sourceToTargetFilename(sourceFilename, config.licDir);
    FsService.createDirFromFilename(targetFilename);
    await FsService.writeJson(json, targetFilename);
    if (config.download) {
      const sourceDirectory = path.dirname(sourceFilename);
      const targetDirectory = util.licenseFilesTargetFolder(config.licDir, sourceDirectory);
      await WebService.downloadLicenseFiles(json, targetDirectory);
    }
  } catch (e) {
    console.error(e.message);
    process.exit(1);  // eslint-disable-line no-process-exit
  }
})();
