#!/usr/bin/env node

import path from 'node:path';

import config from './lib/config.js';
import FsService from './lib/filesystem-service.js';
import { helpText, licenseFilesTargetFolder, sourceToTargetFilename } from './lib/util.js';
import WebService from './lib/web-service.js';

(async () => {
  if (config.help) {
    console.log(helpText);
    return;
  }

  try {
    const sourceFilename = config.source;
    const json = await FsService.readJson(sourceFilename);
    await WebService.addLicenseFilePath(json, config.httpRetryOptions, config.githubToken);
    const targetFilename = sourceToTargetFilename(sourceFilename, config.licDir);
    FsService.createDirFromFilename(targetFilename);
    await FsService.writeJson(json, targetFilename);
    if (config.download) {
      const sourceDirectory = path.dirname(sourceFilename);
      const targetDirectory = licenseFilesTargetFolder(config.licDir, sourceDirectory);
      await WebService.downloadLicenseFiles(
        json,
        targetDirectory,
        config.httpRetryOptions,
        config.githubToken,
      );
    }
  } catch (e) {
    console.error(e.message);
    process.exit(1);
  }
})();
