// During the test the env variable is set to test
process.env.NODE_ENV = 'test';

import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { afterEach, beforeEach, describe, it } from 'node:test';
import url from 'node:url';
import temp from 'temp';

import config from '../lib/config.js';
import WebService from '../lib/web-service.js';

temp.track();

describe('web-service', () => {
  describe('licenseFileName', () => {
    it('should return filename', () => {
      const fileNameComponents = WebService.licenseFileName('package');

      assert.equal(fileNameComponents.scope, '');
      assert.equal(fileNameComponents.packageName, 'package');
    });

    it('should return scope and filename', () => {
      const fileNameComponents =
        WebService.licenseFileName('@test/package-test');

      assert.equal(fileNameComponents.scope, '@test');
      assert.equal(fileNameComponents.packageName, 'package-test');
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
      const result = WebService.tokenFromConfigObject({
        tokenEnvVar: 'GITHUB_TOKEN_TEST',
      });

      assert.equal(result, dummyToken);
    });

    it('should read github token from file defined in environment variable', () => {
      const __dirname = path.dirname(url.fileURLToPath(import.meta.url));
      const dummyTokenPath = path.join(
        __dirname,
        'test-data/dummy-github-token.txt',
      );
      process.env.GITHUB_TOKEN_TESTFILE = dummyTokenPath;
      const result = WebService.tokenFromConfigObject({
        tokenFileEnvVar: 'GITHUB_TOKEN_TESTFILE',
      });

      assert.equal(result, 'abcdefghijklmnopqrstuvw');
    });

    it('should read github token with precedence of file over environment variable', () => {
      const dummyToken = '1234567890';
      process.env.GITHUB_TOKEN_TEST = dummyToken;
      const __dirname = path.dirname(url.fileURLToPath(import.meta.url));
      const dummyTokenPath = path.join(
        __dirname,
        'test-data/dummy-github-token.txt',
      );
      process.env.GITHUB_TOKEN_TESTFILE = dummyTokenPath;
      const result = WebService.tokenFromConfigObject({
        tokenEnvVar: 'GITHUB_TOKEN_TEST',
        tokenFileEnvVar: 'GITHUB_TOKEN_TESTFILE',
      });

      assert.equal(result, 'abcdefghijklmnopqrstuvw');
    });

    it('should return undefined if environment variable does not exist', () => {
      const result = WebService.tokenFromConfigObject({
        tokenEnvVar: 'GITHUB_TOKEN_TEST',
      });

      assert.ok(result === undefined);
    });

    it('should return undefined if environment variable for file does not exist', () => {
      const result = WebService.tokenFromConfigObject({
        tokenFileEnvVar: 'GITHUB_TOKEN_TESTFILE',
      });

      assert.ok(result === undefined);
    });

    it('should return undefined if no config is given', () => {
      const result = WebService.tokenFromConfigObject({});

      assert.ok(result === undefined);
    });
  });

  describe('getPackageNameFromLink', () => {
    const testCase = (link, expectedName) => {
      const res = WebService.getPackageNameFromLink(link);
      assert.equal(res, expectedName);
    };

    it('git+https://github.com/foo/bar.git', () => {
      testCase('git+https://github.com/foo/bar.git', 'foo/bar');
    });

    it('git+https://github.com/foo/bar.git/', () => {
      testCase('git+https://github.com/foo/bar.git/', 'foo/bar');
    });

    it('git+https://github.com/foo/bar.git/tree', () => {
      testCase('git+https://github.com/foo/bar.git/tree', 'foo/bar');
    });

    it('https://github.com/foo/bar', () => {
      testCase('https://github.com/foo/bar', 'foo/bar');
    });

    it('https://github.com/foo/bar/tree', () => {
      testCase('https://github.com/foo/bar/tree', 'foo/bar');
    });

    it('https://github.com/foo/bar.baz', () => {
      testCase('https://github.com/foo/bar.baz', 'foo/bar.baz');
    });

    it('https://github.com/foo/bar.baz/blob', () => {
      testCase('https://github.com/foo/bar.baz/blob', 'foo/bar.baz');
    });

    it('https://other.com/foo/bar', () => {
      testCase('https://other.com/foo/bar', '');
    });

    it('git+https://other.com/foo/bar', () => {
      testCase('git+https://other.com/foo/bar', '');
    });

    it('git+https://github.com/grpc/grpc-node.git#master', () => {
      testCase(
        'git+https://github.com/grpc/grpc-node.git#master',
        'grpc/grpc-node',
      );
    });
  });

  describe('addLicenseFilePath', () => {
    it('should add link to license file for git uri', async () => {
      const packagesInfos = [
        {
          name: 'debug',
          link: 'git://github.com/visionmedia/debug.git',
          type: 'git',
        },
      ];
      const httpRetryOptions = { maxAttempts: 2 };
      const githubToken = config.githubToken;
      await WebService.addLicenseFilePath(
        packagesInfos,
        httpRetryOptions,
        githubToken,
      );

      assert.ok(Array.isArray(packagesInfos));
      assert.equal(
        packagesInfos.length,
        1,
        `number of entries must be 1, but has ${packagesInfos.length}`,
      );
      const licenseFileLink = packagesInfos[0].licenseFileLink;
      assert.ok(
        licenseFileLink.length > 0,
        'licenseFileLink should not be empty',
      );
      assert.ok(
        licenseFileLink.includes('/master/LICENSE'),
        'licenseFileLink should end with "/master/LICENSE"',
      );
    });

    it('should add link to license file for https uri', async () => {
      const packagesInfos = [
        {
          name: 'visit-values',
          link: 'https://github.com/kessler/node-visit-values',
          type: 'https',
        },
      ];
      const httpRetryOptions = { maxAttempts: 2 };
      await WebService.addLicenseFilePath(packagesInfos, httpRetryOptions);

      assert.ok(Array.isArray(packagesInfos));
      assert.equal(
        packagesInfos.length,
        1,
        `number of entries must be 1, but has ${packagesInfos.length}`,
      );
      const licenseFileLink = packagesInfos[0].licenseFileLink;
      assert.ok(
        licenseFileLink.length > 0,
        'licenseFileLink should not be empty',
      );
      assert.ok(
        licenseFileLink.includes('/master/LICENSE'),
        'licenseFileLink should end with "/master/LICENSE"',
      );
    });

    it('should add link to license file for git+https uri', async () => {
      const packagesInfos = [
        {
          name: 'eol',
          link: 'git+https://github.com/ryanve/eol.git',
          type: 'git+https',
        },
      ];
      const httpRetryOptions = { maxAttempts: 2 };
      await WebService.addLicenseFilePath(packagesInfos, httpRetryOptions);

      assert.ok(Array.isArray(packagesInfos));
      assert.equal(
        packagesInfos.length,
        1,
        `number of entries must be 1, but has ${packagesInfos.length}`,
      );
      const licenseFileLink = packagesInfos[0].licenseFileLink;
      assert.ok(
        licenseFileLink.length > 0,
        'licenseFileLink should not be empty',
      );
      assert.ok(
        licenseFileLink.includes('/master/LICENSE'),
        'licenseFileLink should end with "/master/LICENSE"',
      );
    });

    it('should add empty link to license file for object without license file', async () => {
      const packagesInfos = [
        {
          name: '@kessler/tableify',
          link: 'git+https://github.com/kessler/node-tableify.git',
          type: 'no license file',
        },
      ];
      const httpRetryOptions = { maxAttempts: 2 };
      await WebService.addLicenseFilePath(packagesInfos, httpRetryOptions);

      assert.ok(Array.isArray(packagesInfos));
      assert.equal(
        packagesInfos.length,
        1,
        `number of entries must be 1, but has ${packagesInfos.length}`,
      );
      const licenseFileLink = packagesInfos[0].licenseFileLink;
      assert.equal(
        licenseFileLink.length,
        0,
        'licenseFileLink should be empty',
      );
    });
  });

  describe('downloadLicenseFiles', () => {
    let tempDirName;
    const httpRetryOptions = { maxAttempts: 3 };
    const authorizationOptions = { tokenEnvVar: 'GITHUB_TOKEN' };

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
          licenseFileLink:
            'https://raw.githubusercontent.com/visionmedia/debug/master/LICENSE',
        },
      ];

      await WebService.downloadLicenseFiles(
        packagesInfos,
        tempDirName,
        httpRetryOptions,
        authorizationOptions,
      );

      const fileDownloaded = fs.existsSync(
        path.join(tempDirName, 'debug.LICENSE.txt'),
      );
      assert.ok(fileDownloaded, 'license for package downloaded');
    });

    it('should download license for scoped package', async () => {
      const packagesInfos = [
        {
          name: '@bepo65/mat-tristate-checkbox',
          installedVersion: '3.0.0',
          link: 'git://github.com/BePo65/mat-tristate-checkbox.git',
          licenseFileLink:
            'https://raw.githubusercontent.com/bepo65/mat-tristate-checkbox/master/LICENSE',
        },
      ];

      await WebService.downloadLicenseFiles(
        packagesInfos,
        tempDirName,
        httpRetryOptions,
        authorizationOptions,
      );

      const fileDownloaded = fs.existsSync(
        path.join(tempDirName, '@bepo65', 'mat-tristate-checkbox.LICENSE.txt'),
      );
      assert.ok(fileDownloaded, 'license for scoped package downloaded');
    });
  });
});
