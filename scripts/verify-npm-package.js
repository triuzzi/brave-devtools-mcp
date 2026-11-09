/**
 * @license
 * Copyright 2026 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import {execSync} from 'node:child_process';
import {readFileSync} from 'node:fs';

// Checks that the select build files are present using `npm pack --dry-run`.
function verifyPackageContents() {
  try {
    const output = execSync('npm pack --dry-run --json --silent', {
      encoding: 'utf8',
    });
    // skip non-JSON output from prepare.
    const jsonStart = output.search(/[{[]/);
    const rawResult = JSON.parse(output.substring(jsonStart));
    const packageMetadata = JSON.parse(readFileSync('package.json', 'utf8'));
    const packResult = Array.isArray(rawResult)
      ? rawResult[0]
      : (rawResult[packageMetadata.name] ?? rawResult);
    if (
      packResult?.name !== packageMetadata.name ||
      !Array.isArray(packResult.files)
    ) {
      throw new Error('Unexpected npm pack --dry-run output');
    }
    const files = packResult.files.map(packagedFile => packagedFile.path);
    // Check some important files.
    const requiredPaths = [
      'out/Default/gen/src/index.js',
      'out/Default/gen/src/bin/brave-devtools-mcp.js',
      'out/Default/gen/src/bin/brave-devtools.js',
      'out/Default/gen/src/third_party/index.js',
      'out/Default/gen/src/third_party/cli.js',
      'out/Default/gen/src/third_party/devtools-formatter-worker.js',
      'out/Default/gen/src/third_party/devtools-heap-snapshot-worker.js',
      'out/Default/gen/src/third_party/lighthouse-devtools-mcp-bundle.js',
      'out/Default/gen/src/third_party/THIRD_PARTY_NOTICES',
      'out/Default/gen/src/third_party/issue-descriptions/',
    ];
    for (const requiredPath of requiredPaths) {
      const hasBuildFolder = files.some(path => path.startsWith(requiredPath));
      if (!hasBuildFolder) {
        console.error(
          `Assertion Failed: "${requiredPath}" not found in tarball.`,
        );
        process.exit(1);
      }
    }
    const forbiddenSuffixes = [
      '.d.ts',
      '.js.map',
      '.tsbuildinfo',
      '-tsconfig.json',
      '-tsconfig.ref.json',
      '.stamp',
    ];
    for (const file of files) {
      if (forbiddenSuffixes.some(suffix => file.endsWith(suffix))) {
        console.error(
          `Assertion Failed: build artifact "${file}" should not be in tarball.`,
        );
        process.exit(1);
      }
    }
    console.log(`npm pack --dry-run contained ${JSON.stringify(requiredPaths)}`);
  } catch (err) {
    console.error('failed to parse npm pack output', err);
    process.exit(1);
  }
}

verifyPackageContents();
