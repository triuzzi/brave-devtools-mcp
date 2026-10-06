/**
 * @license
 * Copyright 2026 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import type {YargsOptions} from '../third_party/index.js';

export const browserOptions = {
  autoConnect: {
    type: 'boolean',
    description:
      'If specified, automatically connects to a Brave instance running locally from the user data directory identified by the channel parameter (default channel is release). Requires remote debugging to be enabled via brave://inspect/#remote-debugging.',
    default: false,
  },
  browserUrl: {
    type: 'string',
    description:
      'Connect to a running, debuggable Brave instance (e.g. `http://127.0.0.1:9222`). For more details see: https://github.com/triuzzi/brave-devtools-mcp/blob/main/docs/advanced-usage.md#connecting-to-a-running-brave-instance.',
    alias: 'u',
    coerce: (url: string | undefined) => {
      if (!url) {
        return;
      }
      try {
        new URL(url);
      } catch {
        throw new Error(`Provided browserUrl ${url} is not valid URL.`);
      }
      return url;
    },
  },
  wsEndpoint: {
    type: 'string',
    description:
      'WebSocket endpoint to connect to a running Brave instance (e.g., ws://127.0.0.1:9222/devtools/browser/<id>). Alternative to --browserUrl.',
    alias: 'w',
    coerce: (url: string | undefined) => {
      if (!url) {
        return;
      }
      try {
        const parsed = new URL(url);
        if (parsed.protocol !== 'ws:' && parsed.protocol !== 'wss:') {
          throw new Error(
            `Provided wsEndpoint ${url} must use ws:// or wss:// protocol.`,
          );
        }
        return url;
      } catch (error) {
        if ((error as Error).message.includes('ws://')) {
          throw error;
        }
        throw new Error(`Provided wsEndpoint ${url} is not valid URL.`);
      }
    },
  },
  wsHeaders: {
    type: 'string',
    description:
      'Custom headers for WebSocket connection in JSON format (e.g., \'{"Authorization":"Bearer token"}\'). Only works with --wsEndpoint.',
    coerce: (val: string | undefined) => {
      if (!val) {
        return;
      }
      try {
        const parsed = JSON.parse(val);
        if (typeof parsed !== 'object' || Array.isArray(parsed)) {
          throw new Error('Headers must be a JSON object');
        }
        return parsed as Record<string, string>;
      } catch (error) {
        throw new Error(
          `Invalid JSON for wsHeaders: ${(error as Error).message}`,
        );
      }
    },
  },
  headless: {
    type: 'boolean',
    description: 'Whether to run in headless (no UI) mode.',
    default: false,
  },
  executablePath: {
    type: 'string',
    description:
      'Path to a custom Brave executable. Can also be set via BRAVE_PATH.',
    alias: 'e',
  },
  isolated: {
    type: 'boolean',
    description:
      'If specified, creates a temporary user-data-dir that is automatically cleaned up after the browser is closed. Defaults to false.',
    default: false,
  },
  userDataDir: {
    type: 'string',
    description:
      'Path to the user data directory for Brave. Default is $HOME/.cache/brave-devtools-mcp/brave-profile$CHANNEL_SUFFIX_IF_NON_RELEASE',
  },
  channel: {
    type: 'string',
    description:
      'Specify a different Brave channel. The default is the release channel.',
    choices: ['release', 'beta', 'nightly'] as const,
    default: 'release' as const,
  },
  proxyServer: {
    type: 'string',
    description: `Proxy server configuration for Brave passed as --proxy-server when launching the browser. See https://www.chromium.org/developers/design-documents/network-settings/ for details.`,
  },
  braveArg: {
    type: 'array',
    string: true,
    describe:
      'Additional arguments for Brave. Only applies when Brave is launched by brave-devtools-mcp.',
  },
  ignoreDefaultBraveArg: {
    type: 'array',
    string: true,
    describe:
      'Explicitly disable default arguments for Brave. Only applies when Brave is launched by brave-devtools-mcp.',
  },
} satisfies Record<string, YargsOptions>;

export function getBrowserOptions(): typeof browserOptions {
  return browserOptions;
}
