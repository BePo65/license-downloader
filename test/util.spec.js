// During the test the env variable is set to test
process.env.NODE_ENV = 'test';

import path from 'path';
import url from 'url';
/* eslint-disable node/no-unpublished-import, no-unused-vars */
import chai from 'chai';
import { expect } from 'chai';
/* eslint-enable node/no-unpublished-import */

import util from '../lib/util.js';

describe('util', () => {
  describe('sourceToTargetFilename with root as sourceDirectory', () => {
    it('should generate target filename from absolute path', () => {
      const target = util.sourceToTargetFilename('/sourceToTargetFilename.json', '/absolute/path/to');
      const expectedTarget = path.join('/absolute/path/to/sourceToTargetFilename.ext.json');

      expect(target).to.equal(expectedTarget);
    });

    it('should generate target filename from relative path', () => {
      const target = util.sourceToTargetFilename('/sourceToTargetFilename.json', 'relative/path/to');
      const expectedTarget = path.join('relative/path/to/sourceToTargetFilename.ext.json');

      expect(target).to.equal(expectedTarget);
    });

    it('should throw generating target filename from empty string', () => {
      const generateFilenameFromEMptyString = () => { util.sourceToTargetFilename('', 'relative/path/to'); };

      expect(generateFilenameFromEMptyString, 'Generating target filename with empty sorce filename should throw').to.throw();
    });
  });

  describe('sourceToTargetFilename without targetDirectory', () => {
    it('should generate target filename from absolute path', () => {
      const target = util.sourceToTargetFilename('/absolute/path/to/sourceToTargetFilename.json');
      const expectedTarget = path.join('/absolute/path/to/sourceToTargetFilename.ext.json');

      expect(target).to.equal(expectedTarget);
    });

    it('should generate target filename from relative path', () => {
      const target = util.sourceToTargetFilename('relative/path/to/sourceToTargetFilename.json');
      const expectedTarget = path.join('relative/path/to/sourceToTargetFilename.ext.json');

      expect(target).to.equal(expectedTarget);
    });

    it('should throw generating target filename from empty string', () => {
      const generateFilenameFromEMptyString = () => { util.sourceToTargetFilename(''); };

      expect(generateFilenameFromEMptyString, 'Generating target filename from empty string should throw').to.throw();
    });
  });

  describe('sourceToTargetFilename with sourceDirectory and targetDirectory', () => {
    it('should generate target filename from absolute path', () => {
      const target = util.sourceToTargetFilename('/absolute/path/to/sourceToTargetFilename.json', '/target/path');
      const expectedTarget = path.join('/target/path', 'sourceToTargetFilename.ext.json');

      expect(target).to.equal(expectedTarget);
    });

    it('should generate target filename from relative path', () => {
      const target = util.sourceToTargetFilename('relative/path/to/sourceToTargetFilename.json', 'target/path');
      const expectedTarget = path.join('target/path', 'sourceToTargetFilename.ext.json');

      expect(target).to.equal(expectedTarget);
    });

    it('should throw generating target filename from empty string', () => {
      const generateFilenameFromEMptyString = () => { util.sourceToTargetFilename('', ''); };

      expect(generateFilenameFromEMptyString, 'Generating target filename from empty strings should throw').to.throw();
    });
  });

  describe('licenseFilesTargetFolder', () => {
    it('should return entered licenseDirectory', () => {
      const licenseDirectory = '/tmp/downloadDir';
      const sourceDir = undefined;
      const dir = util.licenseFilesTargetFolder(licenseDirectory, sourceDir);

      expect(dir).to.equal(licenseDirectory);
    });

    it('should return folder in sourceDirectory if licenseDirectory is undefined', () => {
      const licenseDirectory = undefined;
      const sourceDir = '/path/of/source/json';
      const dir = util.licenseFilesTargetFolder(licenseDirectory, sourceDir);

      expect(dir).to.equal(path.join(sourceDir, 'licenses'));
    });

    it('should return folder "licenses" if no parameters are given', () => {
      const licenseDirectory = undefined;
      const sourceDir = undefined;
      const dir = util.licenseFilesTargetFolder(licenseDirectory, sourceDir);

      expect(dir).to.equal('licenses');
    });
  });

  describe('licenseFileName', () => {
    it('should return filename', () => {
      const fileNameComponents = util.licenseFileName('package');

      expect(fileNameComponents.scope).to.equal('');
      expect(fileNameComponents.packageName).to.equal('package');
    });

    it('should return scope and filename', () => {
      const fileNameComponents = util.licenseFileName('@test/package-test');

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
      const result = util.tokenFromConfigObject({tokenEnvVar: 'GITHUB_TOKEN_TEST'});

      expect(result).to.equal(dummyToken);
    });

    it('should read github token from file defined in environment variable', () => {
      const __dirname = path.dirname(url.fileURLToPath(import.meta.url));
      const dummyTokenPath = path.join(__dirname, 'test-data/dummy-github-token.txt');
      process.env.GITHUB_TOKEN_TESTFILE = dummyTokenPath;
      const result = util.tokenFromConfigObject({tokenFileEnvVar: 'GITHUB_TOKEN_TESTFILE'});

      expect(result).to.equal('abcdefghijklmnopqrstuvw');
    });

    it('should read github token with precedence of file over environment variable', () => {
      const dummyToken = '1234567890';
      process.env.GITHUB_TOKEN_TEST = dummyToken;
      const __dirname = path.dirname(url.fileURLToPath(import.meta.url));
      const dummyTokenPath = path.join(__dirname, 'test-data/dummy-github-token.txt');
      process.env.GITHUB_TOKEN_TESTFILE = dummyTokenPath;
      const result = util.tokenFromConfigObject({tokenEnvVar: 'GITHUB_TOKEN_TEST', tokenFileEnvVar: 'GITHUB_TOKEN_TESTFILE'});

      expect(result).to.equal('abcdefghijklmnopqrstuvw');
    });

    it('should return undefined if environment variable does not exist', () => {
      const result = util.tokenFromConfigObject({tokenEnvVar: 'GITHUB_TOKEN_TEST'});

      expect(result).to.be.undefined;
    });

    it('should return undefined if environment variable for file does not exist', () => {
      const result = util.tokenFromConfigObject({tokenFileEnvVar: 'GITHUB_TOKEN_TESTFILE'});

      expect(result).to.be.undefined;
    });

    it('should return undefined if no config is given', () => {
      const result = util.tokenFromConfigObject({});

      expect(result).to.be.undefined;
    });
  });
});
