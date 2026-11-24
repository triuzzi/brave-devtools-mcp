/**
 * @license
 * Copyright 2026 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import assert from 'node:assert';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {afterEach, describe, it} from 'node:test';

import {
  linuxBraveExecutableCandidates,
  resolveBraveExecutablePath,
  resolveBraveUserDataDirectory,
} from '../src/BrowserManager.js';
import {createTempDir} from './utils.js';

const originalBravePath = process.env['BRAVE_PATH'];
const originalPath = process.env['PATH'];
const originalXdgConfigHome = process.env['XDG_CONFIG_HOME'];

afterEach(() => {
  if (originalBravePath === undefined) {
    delete process.env['BRAVE_PATH'];
  } else {
    process.env['BRAVE_PATH'] = originalBravePath;
  }
  if (originalPath === undefined) {
    delete process.env['PATH'];
  } else {
    process.env['PATH'] = originalPath;
  }
  if (originalXdgConfigHome === undefined) {
    delete process.env['XDG_CONFIG_HOME'];
  } else {
    process.env['XDG_CONFIG_HOME'] = originalXdgConfigHome;
  }
});

describe(
  'Linux Brave Origin discovery',
  {skip: os.platform() !== 'linux'},
  () => {
    it('includes the Manjaro brave-origin-bin executable locations', () => {
      assert.deepStrictEqual(linuxBraveExecutableCandidates('release'), [
        'brave-browser',
        'brave-browser-stable',
        'brave-origin',
        '/opt/brave-origin-bin/brave',
      ]);
    });

    it('finds the brave-origin executable on PATH', () => {
      using binDirectory = createTempDir('brave-origin-');
      const executable = path.join(binDirectory.path, 'brave-origin');
      fs.writeFileSync(executable, '#!/bin/sh\n');
      fs.chmodSync(executable, 0o755);
      delete process.env['BRAVE_PATH'];
      process.env['PATH'] = binDirectory.path;

      assert.strictEqual(resolveBraveExecutablePath('release'), executable);
    });

    it('uses the Brave-Origin profile when it is the installed release profile', () => {
      using configDirectory = createTempDir('brave-origin-');
      const originProfile = path.join(
        configDirectory.path,
        'BraveSoftware',
        'Brave-Origin',
      );
      fs.mkdirSync(originProfile, {recursive: true});
      process.env['XDG_CONFIG_HOME'] = configDirectory.path;

      assert.strictEqual(
        resolveBraveUserDataDirectory('release'),
        originProfile,
      );
    });

    it('prefers the release profile with an active debugging port', () => {
      using configDirectory = createTempDir('brave-origin-');
      const standardProfile = path.join(
        configDirectory.path,
        'BraveSoftware',
        'Brave-Browser',
      );
      const originProfile = path.join(
        configDirectory.path,
        'BraveSoftware',
        'Brave-Origin',
      );
      fs.mkdirSync(standardProfile, {recursive: true});
      fs.mkdirSync(originProfile, {recursive: true});
      fs.writeFileSync(
        path.join(originProfile, 'DevToolsActivePort'),
        '9222\n',
      );
      process.env['XDG_CONFIG_HOME'] = configDirectory.path;

      assert.strictEqual(
        resolveBraveUserDataDirectory('release'),
        originProfile,
      );
    });
  },
);
