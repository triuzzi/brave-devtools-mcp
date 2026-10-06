/**
 * @license
 * Copyright 2026 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * What a loopback DevTools HTTP endpoint said about itself.
 *
 * `consent-gated` means the port accepts connections but answers `/json/*`
 * with 404: Brave enables remote debugging from its UI only after each
 * connection is approved, and serves 404 until then. It is a diagnostic, never
 * a reason to refuse a connection, because approving the dialog is a supported
 * way to attach.
 */
export type CdpHttpReadiness = 'ready' | 'consent-gated' | 'unknown';

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
 * Asks a loopback DevTools HTTP endpoint for `/json/version` so a failed attach
 * can say why. Non-loopback endpoints are not probed: the browser may not be
 * reachable from here, and the answer would not be trustworthy.
 */
export async function probeLoopbackCdpHttp(
  httpBase: string,
  fetchImpl: typeof fetch = globalThis.fetch.bind(globalThis),
): Promise<CdpHttpReadiness> {
  let parsed: URL;
  try {
    parsed = new URL(httpBase);
  } catch {
    return 'unknown';
  }
  if (!isLoopbackHostname(parsed.hostname)) {
    return 'unknown';
  }

  const versionUrl = new URL('/json/version', parsed).href;
  let response: Response;
  try {
    response = await fetchImpl(versionUrl, {
      signal: AbortSignal.timeout(1_000),
    });
  } catch {
    return 'unknown';
  }

  return response.status === 404 ? 'consent-gated' : 'ready';
}

/** Appends the 404 explanation to a connect failure, when it applies. */
export function consentGatedAttachHint(
  readiness: CdpHttpReadiness,
  httpBase: string,
): string {
  if (readiness !== 'consent-gated') {
    return '';
  }
  return (
    ` ${httpBase} answers /json/version with 404, so Brave is either waiting for` +
    ' the "Allow remote debugging?" approval or was started without' +
    ' --remote-debugging-port. Approve the connection in Brave, or relaunch it' +
    ` with --remote-debugging-address=127.0.0.1 --remote-debugging-port=9222 and connect with --browserUrl=${httpBase}.`
  );
}
