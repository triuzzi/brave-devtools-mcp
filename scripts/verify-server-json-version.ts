/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import {execSync} from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const serverJsonFilePath = path.join(process.cwd(), 'server.json');
const serverJson = JSON.parse(fs.readFileSync(serverJsonFilePath, 'utf-8'));
const packageJsonFilePath = path.join(process.cwd(), 'package.json');
const packageJson = JSON.parse(fs.readFileSync(packageJsonFilePath, 'utf-8'));

if (serverJson.name !== packageJson.mcpName) {
  throw new Error(
    `server.json name ${serverJson.name} does not match package.json mcpName ${packageJson.mcpName}`,
  );
}
if (serverJson.version !== packageJson.version) {
  throw new Error(
    `server.json version ${serverJson.version} does not match package.json version ${packageJson.version}`,
  );
}
if (serverJson.packages.length !== 1) {
  throw new Error('server.json must contain exactly one package');
}
if (serverJson.packages[0].identifier !== packageJson.name) {
  throw new Error(
    `server.json package ${serverJson.packages[0].identifier} does not match package.json name ${packageJson.name}`,
  );
}
if (serverJson.packages[0].version !== packageJson.version) {
  throw new Error(
    `server.json package version ${serverJson.packages[0].version} does not match package.json version ${packageJson.version}`,
  );
}

const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'mcp-verify-'));

try {
  const osName = os.platform();
  const arch = os.arch();
  let platform = '';
  if (osName === 'darwin') {
    platform = 'darwin';
  } else if (osName === 'linux') {
    platform = 'linux';
  }
  // mcp-publisher does not support windows
  else {
    throw new Error(`Unsupported platform: ${osName}`);
  }

  let archName = '';
  if (arch === 'x64') {
    archName = 'amd64';
  } else if (arch === 'arm64') {
    archName = 'arm64';
  } else {
    throw new Error(`Unsupported architecture: ${arch}`);
  }

  const osArch = `${platform}_${archName}`;
  const binName = 'mcp-publisher';
  const downloadUrl = `https://github.com/modelcontextprotocol/registry/releases/latest/download/${binName}_${osArch}.tar.gz`;

  console.log(`Downloading ${binName} from ${downloadUrl}`);
  const downloadCmd = `curl -L "${downloadUrl}" | tar xz -C "${tmpDir}" ${binName}`;
  execSync(downloadCmd, {stdio: 'inherit'});

  const publisherPath = path.join(tmpDir, binName);
  fs.chmodSync(publisherPath, 0o755);
  console.log(`Downloaded to ${publisherPath}`);

  // Create the new server.json in the temporary directory
  execSync(`${publisherPath} init`, {cwd: tmpDir, stdio: 'inherit'});

  const newServerJsonPath = path.join(tmpDir, 'server.json');
  const newServerJson = JSON.parse(fs.readFileSync(newServerJsonPath, 'utf-8'));

  const propertyToVerify = ['$schema'];
  const diffProps = [];

  for (const prop of propertyToVerify) {
    if (serverJson[prop] !== newServerJson[prop]) {
      diffProps.push(prop);
    }
  }

  if (diffProps.length) {
    throw new Error(
      `The following props in ${serverJsonFilePath} did not match the latest init value:\n${diffProps.map(
        prop =>
          `- "${prop}": expected "${newServerJson[prop]}", got "${serverJson[prop]}"`,
      )}`,
    );
  }
} finally {
  fs.rmSync(tmpDir, {recursive: true, force: true});
}
