// During the test the env variable is set to test
process.env.NODE_ENV = 'test';

import fs from 'fs';
import path from 'path';
import url from 'url';
import temp from 'temp';

import { expect } from 'chai';

import WebService from '../lib/web-service.js';

temp.track();

describe('web-service', () => {

  describe('licenseFileName', () => {
    it('should return filename', () => {
      const fileNameComponents = WebService.licenseFileName('package');

      expect(fileNameComponents.scope).to.equal('');
      expect(fileNameComponents.packageName).to.equal('package');
    });

    it('should return scope and filename', () => {
      const fileNameComponents = WebService.licenseFileName('@test/package-test');

      expect(fileNameComponents.scope).to.equal('@test');
      expect(fileNameComponents.packageName).to.equal('package-test');
    });
  });

  describe('tokenFromConfigObject', () => {
    afterEach(() => {
      delete process.env.GITHUB_TOKEN_TEST;
      delete process.env.GITHUB_TOKEN_TESTFILE;
    });

    it('should read github token from environment variable', () => {
      const dummyToken = '1234567890';
      process.env.GITHUB_TOKEN_TEST = dummyToken;
      const result = WebService.tokenFromConfigObject({tokenEnvVar: 'GITHUB_TOKEN_TEST'});

      expect(result).to.equal(dummyToken);
    });

    it('should read github token from file defined in environment variable', () => {
      const __dirname = path.dirname(url.fileURLToPath(import.meta.url));
      const dummyTokenPath = path.join(__dirname, 'test-data/dummy-github-token.txt');
      process.env.GITHUB_TOKEN_TESTFILE = dummyTokenPath;
      const result = WebService.tokenFromConfigObject({tokenFileEnvVar: 'GITHUB_TOKEN_TESTFILE'});

      expect(result).to.equal('abcdefghijklmnopqrstuvw');
    });

    it('should read github token with precedence of file over environment variable', () => {
      const dummyToken = '1234567890';
      process.env.GITHUB_TOKEN_TEST = dummyToken;
      const __dirname = path.dirname(url.fileURLToPath(import.meta.url));
      const dummyTokenPath = path.join(__dirname, 'test-data/dummy-github-token.txt');
      process.env.GITHUB_TOKEN_TESTFILE = dummyTokenPath;
      const result = WebService.tokenFromConfigObject({tokenEnvVar: 'GITHUB_TOKEN_TEST', tokenFileEnvVar: 'GITHUB_TOKEN_TESTFILE'});

      expect(result).to.equal('abcdefghijklmnopqrstuvw');
    });

    it('should return undefined if environment variable does not exist', () => {
      const result = WebService.tokenFromConfigObject({tokenEnvVar: 'GITHUB_TOKEN_TEST'});

      expect(result).to.be.undefined;
    });

    it('should return undefined if environment variable for file does not exist', () => {
      const result = WebService.tokenFromConfigObject({tokenFileEnvVar: 'GITHUB_TOKEN_TESTFILE'});

      expect(result).to.be.undefined;
    });

    it('should return undefined if no config is given', () => {
      const result = WebService.tokenFromConfigObject({});

      expect(result).to.be.undefined;
    });
  });

  describe('addLicenseFilePath', function() {
    this.slow(2000);

    it('should add link to license file for git uri', async () => {
      const packagesInfos = [
        {
          name: 'debug',
          link: 'git://github.com/visionmedia/debug.git',
          type: 'git'
        }
      ];
      const httpRetryOptions = { maxAttempts: 2 };
      await WebService.addLicenseFilePath(packagesInfos, httpRetryOptions);

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
      await WebService.addLicenseFilePath(packagesInfos, httpRetryOptions);

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
      await WebService.addLicenseFilePath(packagesInfos, httpRetryOptions);

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
      await WebService.addLicenseFilePath(packagesInfos, httpRetryOptions);

      expect(packagesInfos).to.be.an('array');
      expect(packagesInfos.length).to.equal(1, `number of entries must be 1, but has ${packagesInfos.length}`);
      const licenseFileLink = packagesInfos[0].licenseFileLink;
      expect(licenseFileLink.length).to.equal(0, 'licenseFileLink should be empty');
    });
  });

  describe('downloadLicenseFiles', function() {
    let tempDirName;
    this.slow(800);

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

      await WebService.downloadLicenseFiles(packagesInfos, tempDirName);

      const fileDownloaded = fs.existsSync(path.join(tempDirName, 'debug.LICENSE.txt'));
      expect(fileDownloaded, 'license for package downloaded').to.be.true;
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

      await WebService.downloadLicenseFiles(packagesInfos, tempDirName);

      const fileDownloaded = fs.existsSync(path.join(tempDirName, '@bepo65', 'mat-tristate-checkbox.LICENSE.txt'));
      expect(fileDownloaded, 'license for scoped package downloaded').to.be.true;
    });
  });
});
