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
  resolveBraveUserDataDir,
} from '../src/browser.js';

const originalBravePath = process.env['BRAVE_PATH'];
const originalPath = process.env['PATH'];
const originalXdgConfigHome = process.env['XDG_CONFIG_HOME'];
const temporaryDirectories: string[] = [];

function temporaryDirectory(): string {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'brave-origin-'));
  temporaryDirectories.push(directory);
  return directory;
}

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
  for (const directory of temporaryDirectories.splice(0)) {
    fs.rmSync(directory, {recursive: true, force: true});
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
      const binDirectory = temporaryDirectory();
      const executable = path.join(binDirectory, 'brave-origin');
      fs.writeFileSync(executable, '#!/bin/sh\n');
      fs.chmodSync(executable, 0o755);
      delete process.env['BRAVE_PATH'];
      process.env['PATH'] = binDirectory;

      assert.strictEqual(resolveBraveExecutablePath('release'), executable);
    });

    it('skips executable directories that have a browser candidate name', () => {
      const binDirectory = temporaryDirectory();
      fs.mkdirSync(path.join(binDirectory, 'brave-browser'), {mode: 0o755});
      const executable = path.join(binDirectory, 'brave-origin');
      fs.writeFileSync(executable, '#!/bin/sh\n');
      fs.chmodSync(executable, 0o755);
      delete process.env['BRAVE_PATH'];
      process.env['PATH'] = binDirectory;

      assert.strictEqual(resolveBraveExecutablePath('release'), executable);
    });

    it('skips regular browser candidates without execute permission', () => {
      const binDirectory = temporaryDirectory();
      fs.writeFileSync(
        path.join(binDirectory, 'brave-browser'),
        '#!/bin/sh\n',
        {
          mode: 0o644,
        },
      );
      const executable = path.join(binDirectory, 'brave-origin');
      fs.writeFileSync(executable, '#!/bin/sh\n');
      fs.chmodSync(executable, 0o755);
      delete process.env['BRAVE_PATH'];
      process.env['PATH'] = binDirectory;

      assert.strictEqual(resolveBraveExecutablePath('release'), executable);
    });

    it('accepts an executable symlink whose target is a regular file', () => {
      const binDirectory = temporaryDirectory();
      const target = path.join(binDirectory, 'brave-origin-bin');
      const executable = path.join(binDirectory, 'brave-origin');
      fs.writeFileSync(target, '#!/bin/sh\n');
      fs.chmodSync(target, 0o755);
      fs.symlinkSync(target, executable);
      delete process.env['BRAVE_PATH'];
      process.env['PATH'] = binDirectory;

      assert.strictEqual(resolveBraveExecutablePath('release'), executable);
    });

    it('uses the Brave-Origin profile when it is the installed release profile', () => {
      const configDirectory = temporaryDirectory();
      const originProfile = path.join(
        configDirectory,
        'BraveSoftware',
        'Brave-Origin',
      );
      fs.mkdirSync(originProfile, {recursive: true});
      process.env['XDG_CONFIG_HOME'] = configDirectory;

      assert.strictEqual(resolveBraveUserDataDir('release'), originProfile);
    });

    it('prefers the release profile with a DevToolsActivePort marker', () => {
      const configDirectory = temporaryDirectory();
      const standardProfile = path.join(
        configDirectory,
        'BraveSoftware',
        'Brave-Browser',
      );
      const originProfile = path.join(
        configDirectory,
        'BraveSoftware',
        'Brave-Origin',
      );
      fs.mkdirSync(standardProfile, {recursive: true});
      fs.mkdirSync(originProfile, {recursive: true});
      fs.writeFileSync(
        path.join(originProfile, 'DevToolsActivePort'),
        '9222\n',
      );
      process.env['XDG_CONFIG_HOME'] = configDirectory;

      assert.strictEqual(resolveBraveUserDataDir('release'), originProfile);
    });
  },
);
