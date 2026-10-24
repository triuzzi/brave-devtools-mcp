/**
 * @license
 * Copyright 2026 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

export const DEVTOOLS_ACCEPT_DEBUGGING_CONNECTIONS =
  'DevToolsAcceptDebuggingConnections';

export class ConsentGatedCdpError extends Error {
  constructor(httpBase: string) {
    super(
      `Brave DevTools at ${httpBase} is listening but HTTP CDP is consent-gated ` +
        `(/json/version returned 404). Connecting over WebSocket would raise Brave's ` +
        `"Allow remote debugging?" dialog and steal window focus. ` +
        `Fully quit Brave and relaunch with CLI-owned debugging, for example: ` +
        `--remote-debugging-address=127.0.0.1 --remote-debugging-port=9222 ` +
        `--disable-features=${DEVTOOLS_ACCEPT_DEBUGGING_CONNECTIONS}. ` +
        `Do not enable debugging only via brave://inspect/#remote-debugging.`,
    );
    this.name = 'ConsentGatedCdpError';
  }
}

export function isLoopbackHostname(hostname: string): boolean {
  return (
    hostname === '127.0.0.1' ||
    hostname === 'localhost' ||
    hostname === '[::1]' ||
    hostname === '::1'
  );
}

/** Derive `http://host:port` from a `ws(s)://host:port/...` endpoint. */
export function httpBaseFromWsEndpoint(wsEndpoint: string): string | undefined {
  try {
    const wsUrl = new URL(wsEndpoint);
    if (wsUrl.protocol !== 'ws:' && wsUrl.protocol !== 'wss:') {
      return undefined;
    }
    const httpUrl = new URL(wsEndpoint);
    httpUrl.protocol = wsUrl.protocol === 'wss:' ? 'https:' : 'http:';
    httpUrl.pathname = '/';
    httpUrl.search = '';
    httpUrl.hash = '';
    return httpUrl.origin;
  } catch {
    return undefined;
  }
}

/**
 * Ensure a loopback DevTools HTTP endpoint is actually usable before opening a
 * WebSocket. Brave/Chromium can leave the debug port listening after enabling
 * remote debugging in the UI while gating `/json/*` behind a per-connection
 * consent dialog; a WebSocket attach is what triggers that dialog.
 */
export async function assertLoopbackCdpHttpReady(
  httpBase: string,
  fetchImpl: typeof fetch = globalThis.fetch.bind(globalThis),
): Promise<void> {
  let parsed: URL;
  try {
    parsed = new URL(httpBase);
  } catch {
    return;
  }
  if (!isLoopbackHostname(parsed.hostname)) {
    return;
  }

  const versionUrl = new URL('/json/version', parsed).href;
  let response: Response;
  try {
    response = await fetchImpl(versionUrl, {
      signal: AbortSignal.timeout(1_000),
    });
  } catch {
    // Port may not answer HTTP yet; let puppeteer surface the connect error.
    return;
  }

  if (response.status === 404) {
    throw new ConsentGatedCdpError(parsed.origin);
  }
}

/** Merge DevToolsAcceptDebuggingConnections into Chromium --disable-features. */
export function withDisabledDevToolsAcceptDebugging(
  args: readonly string[],
): string[] {
  const flag = `--disable-features=${DEVTOOLS_ACCEPT_DEBUGGING_CONNECTIONS}`;
  const index = args.findIndex(arg => arg.startsWith('--disable-features='));
  if (index === -1) {
    return [...args, flag];
  }
  const current = args[index].slice('--disable-features='.length);
  const parts = current
    .split(',')
    .map(part => part.trim())
    .filter(Boolean);
  if (parts.includes(DEVTOOLS_ACCEPT_DEBUGGING_CONNECTIONS)) {
    return [...args];
  }
  const next = [...args];
  next[index] =
    `--disable-features=${[...parts, DEVTOOLS_ACCEPT_DEBUGGING_CONNECTIONS].join(',')}`;
  return next;
}
