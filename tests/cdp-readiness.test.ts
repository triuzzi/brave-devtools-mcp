/**
 * @license
 * Copyright 2026 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import assert from 'node:assert';
import {describe, it} from 'node:test';

import {
  consentGatedAttachHint,
  httpBaseFromWsEndpoint,
  isLoopbackHostname,
  probeLoopbackCdpHttp,
} from '../src/cdpReadiness.js';

describe('cdpReadiness', () => {
  it('derives an HTTP origin from a WebSocket endpoint', () => {
    assert.strictEqual(
      httpBaseFromWsEndpoint('ws://127.0.0.1:9222/devtools/browser/abc-123'),
      'http://127.0.0.1:9222',
    );
    assert.strictEqual(
      httpBaseFromWsEndpoint('wss://localhost:9223/devtools/browser/abc-123'),
      'https://localhost:9223',
    );
    assert.strictEqual(httpBaseFromWsEndpoint('not-a-url'), undefined);
  });

  it('recognizes loopback hostnames', () => {
    for (const hostname of ['127.0.0.1', 'localhost', '[::1]', '::1']) {
      assert.strictEqual(isLoopbackHostname(hostname), true);
    }
    assert.strictEqual(isLoopbackHostname('192.168.1.10'), false);
  });

  it('reports a consent-gated endpoint when /json/version answers 404', async () => {
    const fetchImpl = (async () =>
      new Response('', {status: 404})) as typeof fetch;

    assert.strictEqual(
      await probeLoopbackCdpHttp('http://127.0.0.1:9222', fetchImpl),
      'consent-gated',
    );
  });

  it('reports a ready endpoint when /json/version succeeds', async () => {
    const fetchImpl = (async () =>
      new Response('{"Browser":"Chrome"}', {status: 200})) as typeof fetch;

    assert.strictEqual(
      await probeLoopbackCdpHttp('http://127.0.0.1:9222', fetchImpl),
      'ready',
    );
  });

  it('reports unknown when the probe fails', async () => {
    const fetchImpl = (async () => {
      throw new TypeError('fetch failed');
    }) as typeof fetch;

    assert.strictEqual(
      await probeLoopbackCdpHttp('http://127.0.0.1:9222', fetchImpl),
      'unknown',
    );
  });

  it('skips the probe for non-loopback hosts', async () => {
    let called = false;
    const fetchImpl = (async () => {
      called = true;
      return new Response('', {status: 404});
    }) as typeof fetch;

    assert.strictEqual(
      await probeLoopbackCdpHttp('http://192.168.1.10:9222', fetchImpl),
      'unknown',
    );
    assert.strictEqual(called, false);
  });

  it('explains a consent-gated endpoint only when the probe saw a 404', () => {
    const hint = consentGatedAttachHint(
      'consent-gated',
      'http://127.0.0.1:9222',
    );
    assert.match(hint, /\/json\/version with 404/);
    assert.match(hint, /Allow remote debugging\?/);
    assert.match(hint, /--remote-debugging-port=9222/);
    assert.strictEqual(
      consentGatedAttachHint('ready', 'http://127.0.0.1:9222'),
      '',
    );
    assert.strictEqual(
      consentGatedAttachHint('unknown', 'http://127.0.0.1:9222'),
      '',
    );
  });
});
