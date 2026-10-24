/**
 * @license
 * Copyright 2026 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import assert from 'node:assert';
import {describe, it} from 'node:test';

import {
  ConsentGatedCdpError,
  DEVTOOLS_ACCEPT_DEBUGGING_CONNECTIONS,
  assertLoopbackCdpHttpReady,
  httpBaseFromWsEndpoint,
  withDisabledDevToolsAcceptDebugging,
} from '../src/cdpReadiness.js';

describe('cdpReadiness', () => {
  it('derives an HTTP origin from a WebSocket endpoint', () => {
    assert.strictEqual(
      httpBaseFromWsEndpoint('ws://127.0.0.1:9222/devtools/browser/abc-123'),
      'http://127.0.0.1:9222',
    );
  });

  it('merges DevToolsAcceptDebuggingConnections into --disable-features', () => {
    assert.deepStrictEqual(withDisabledDevToolsAcceptDebugging(['--foo']), [
      '--foo',
      `--disable-features=${DEVTOOLS_ACCEPT_DEBUGGING_CONNECTIONS}`,
    ]);
    assert.deepStrictEqual(
      withDisabledDevToolsAcceptDebugging([
        '--disable-features=FooBar',
        '--baz',
      ]),
      [
        `--disable-features=FooBar,${DEVTOOLS_ACCEPT_DEBUGGING_CONNECTIONS}`,
        '--baz',
      ],
    );
    assert.deepStrictEqual(
      withDisabledDevToolsAcceptDebugging([
        `--disable-features=${DEVTOOLS_ACCEPT_DEBUGGING_CONNECTIONS}`,
      ]),
      [`--disable-features=${DEVTOOLS_ACCEPT_DEBUGGING_CONNECTIONS}`],
    );
  });

  it('refuses loopback CDP when /json/version is consent-gated (HTTP 404)', async () => {
    const fetchImpl = (async () =>
      new Response('', {status: 404})) as typeof fetch;

    await assert.rejects(
      () => assertLoopbackCdpHttpReady('http://127.0.0.1:9222', fetchImpl),
      (error: unknown) => {
        assert.ok(error instanceof ConsentGatedCdpError);
        assert.match(String(error), /consent-gated/);
        assert.match(String(error), /DevToolsAcceptDebuggingConnections/);
        return true;
      },
    );
  });

  it('allows loopback CDP when /json/version succeeds', async () => {
    const fetchImpl = (async () =>
      new Response('{"Browser":"Chrome"}', {status: 200})) as typeof fetch;

    await assertLoopbackCdpHttpReady('http://127.0.0.1:9222', fetchImpl);
  });

  it('skips the readiness probe for non-loopback hosts', async () => {
    let called = false;
    const fetchImpl = (async () => {
      called = true;
      return new Response('', {status: 404});
    }) as typeof fetch;

    await assertLoopbackCdpHttpReady('http://192.168.1.10:9222', fetchImpl);
    assert.strictEqual(called, false);
  });
});
