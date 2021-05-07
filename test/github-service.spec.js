// During the test the env variable is set to test
process.env.NODE_ENV = 'test';

import fs from 'fs';
import path from 'path';
import temp from 'temp';

/* eslint-disable node/no-unpublished-import */
import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import { expect } from 'chai';
/* eslint-enable node/no-unpublished-import */

import { addLicenseFilePath, downloadLicenseFiles } from '../lib/github-service.js';

chai.use(chaiAsPromised);
temp.track();

describe('github-service', () => {
  describe('addLicenseFilePath', () => {
    it('should add link to license file for git uri', async () => {
      const packagesInfos = [
        {
          name: 'debug',
          link: 'git://github.com/visionmedia/debug.git',
          type: 'git'
        }
      ];
      const httpRetryOptions = { maxAttempts: 2 };
      await addLicenseFilePath(packagesInfos, httpRetryOptions);

      expect(packagesInfos).to.be.an('array');
      expect(packagesInfos.length).to.equal(1, `number of entries must be 1, but has ${packagesInfos.length}`);
      const licenseFileLink = packagesInfos[0].licenseFileLink;
      expect(licenseFileLink.length).to.be.above(0, 'licenseFileLink should not be empty');
      expect(licenseFileLink).to.include('/master/LICENSE', 'licenseFileLink should end with "/master/LICENSE"');
    });

    it('should add link to license file for https uri', async () => {
      const packagesInfos = [
        {
          name: 'visit-values',
          link: 'https://github.com/kessler/node-visit-values',
          type: 'https'
        }
      ];
      const httpRetryOptions = { maxAttempts: 2 };
      await addLicenseFilePath(packagesInfos, httpRetryOptions);

      expect(packagesInfos).to.be.an('array');
      expect(packagesInfos.length).to.equal(1, `number of entries must be 1, but has ${packagesInfos.length}`);
      const licenseFileLink = packagesInfos[0].licenseFileLink;
      expect(licenseFileLink.length).to.be.above(0, 'licenseFileLink should not be empty');
      expect(licenseFileLink).to.include('/master/LICENSE', 'licenseFileLink should end with "/master/LICENSE"');
    });

    it('should add link to license file for git+https uri', async () => {
      const packagesInfos = [
        {
          name: 'eol',
          link: 'git+https://github.com/ryanve/eol.git',
          type: 'git+https'
        }
      ];
      const httpRetryOptions = { maxAttempts: 2 };
      await addLicenseFilePath(packagesInfos, httpRetryOptions);

      expect(packagesInfos).to.be.an('array');
      expect(packagesInfos.length).to.equal(1, `number of entries must be 1, but has ${packagesInfos.length}`);
      const licenseFileLink = packagesInfos[0].licenseFileLink;
      expect(licenseFileLink.length).to.be.above(0, 'licenseFileLink should not be empty');
      expect(licenseFileLink).to.include('/master/LICENSE', 'licenseFileLink should end with "/master/LICENSE"');
    });

    it('should add empty link to license file for object without license file', async () => {
      const packagesInfos = [
        {
          name: '@kessler/tableify',
          link: 'git+https://github.com/kessler/node-tableify.git',
          type: 'no license file'
        }
      ];
      const httpRetryOptions = { maxAttempts: 2 };
      await addLicenseFilePath(packagesInfos, httpRetryOptions);

      expect(packagesInfos).to.be.an('array');
      expect(packagesInfos.length).to.equal(1, `number of entries must be 1, but has ${packagesInfos.length}`);
      const licenseFileLink = packagesInfos[0].licenseFileLink;
      expect(licenseFileLink.length).to.equal(0, 'licenseFileLink should be empty');
    });
  });

  describe('downloadLicenseFiles', () => {
    let tempDirName;
    beforeEach(() => {
      tempDirName = temp.mkdirSync();
    });

    afterEach(() => {
      temp.cleanupSync();
    });

    it('should download license for package', async () => {
      const packagesInfos = [
        {
          name: 'debug',
          installedVersion: '4.3.1',
          link: 'git://github.com/visionmedia/debug.git',
          licenseFileLink: 'https://raw.githubusercontent.com/visionmedia/debug/master/LICENSE'
        }
      ];

      await downloadLicenseFiles(packagesInfos, tempDirName);

      const fileDownloaded = fs.existsSync(path.join(tempDirName, 'debug@4.3.1-LICENSE'));0
      expect(fileDownloaded, 'license for package downloaded').to.be.true;  // eslint-disable-line no-unused-expressions
    });

    it('should download license for scoped package', async () => {
      const packagesInfos = [
        {
          name: '@bepo65/mat-tristate-checkbox',
          installedVersion: '3.0.0',
          link: 'git://github.com/BePo65/mat-tristate-checkbox.git',
          licenseFileLink: 'https://raw.githubusercontent.com/bepo65/mat-tristate-checkbox/master/LICENSE'
        }
      ];

      await downloadLicenseFiles(packagesInfos, tempDirName);

      const fileDownloaded = fs.existsSync(path.join(tempDirName, '@bepo65', 'mat-tristate-checkbox@3.0.0-LICENSE'));0
      expect(fileDownloaded, 'license for scoped package downloaded').to.be.true;  // eslint-disable-line no-unused-expressions
    });
  });
});
