/**
 * @license
 * Copyright 2026 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import assert from 'node:assert/strict';
import process from 'node:process';

import {Client} from '@modelcontextprotocol/sdk/client/index.js';
import {StdioClientTransport} from '@modelcontextprotocol/sdk/client/stdio.js';

const browserUrl = process.env.BRAVE_BROWSER_URL ?? 'http://127.0.0.1:9222';
const syntheticPageMarker = `brave-parity-${process.pid}`;
const syntheticPageUrl = `data:text/html,<title>${syntheticPageMarker}</title><h1>Brave parity verification</h1>`;

const transport = new StdioClientTransport({
  command: process.execPath,
  args: [
    'build/src/bin/brave-devtools-mcp.js',
    '--browserUrl',
    browserUrl,
    '--experimentalStructuredContent',
    '--memoryDebugging',
    '--no-performance-crux',
  ],
  env: {
    ...process.env,
    BRAVE_DEVTOOLS_MCP_NO_UPDATE_CHECKS: 'true',
    BRAVE_DEVTOOLS_MCP_NO_USAGE_STATISTICS: 'true',
  },
  stderr: 'pipe',
});
transport.stderr?.resume();
const client = new Client(
  {name: 'brave-live-parity-verification', version: '1.0.0'},
  {capabilities: {}},
);

function textFromToolResult(toolResult) {
  const textContent = toolResult.content.find(
    content => content.type === 'text',
  );
  assert.ok(textContent, 'Tool result did not contain text');
  return textContent.text;
}

await client.connect(transport);
let syntheticPageIds = [];
try {
  const {tools} = await client.listTools();
  const expectedAttachModeTools = [
    'click',
    'close_heapsnapshot',
    'close_page',
    'compare_heapsnapshots',
    'drag',
    'emulate',
    'evaluate_script',
    'fill',
    'fill_form',
    'get_console_message',
    'get_heapsnapshot_class_nodes',
    'get_heapsnapshot_details',
    'get_heapsnapshot_dominators',
    'get_heapsnapshot_duplicate_strings',
    'get_heapsnapshot_edges',
    'get_heapsnapshot_object_details',
    'get_heapsnapshot_retainers',
    'get_heapsnapshot_retaining_paths',
    'get_heapsnapshot_summary',
    'get_network_request',
    'handle_dialog',
    'hover',
    'lighthouse_audit',
    'list_console_messages',
    'list_network_requests',
    'list_pages',
    'navigate_page',
    'new_page',
    'performance_analyze_insight',
    'performance_start_trace',
    'performance_stop_trace',
    'press_key',
    'resize_page',
    'select_page',
    'take_heapsnapshot',
    'take_screenshot',
    'take_snapshot',
    'type_text',
    'upload_file',
    'wait_for',
  ];
  const toolsByName = new Map(tools.map(tool => [tool.name, tool]));
  assert.deepEqual([...toolsByName.keys()].sort(), expectedAttachModeTools);
  const requiredTools = [
    'evaluate_script',
    'get_heapsnapshot_object_details',
    'list_console_messages',
    'upload_file',
  ];
  for (const requiredTool of requiredTools) {
    assert.ok(toolsByName.has(requiredTool), `Missing tool ${requiredTool}`);
  }
  const pipeOnlyPwaTools = [
    'get_os_app_state',
    'install_pwa',
    'launch_pwa',
    'uninstall_pwa',
  ];
  for (const pipeOnlyPwaTool of pipeOnlyPwaTools) {
    assert.equal(
      toolsByName.has(pipeOnlyPwaTool),
      false,
      `${pipeOnlyPwaTool} must not be exposed in attach mode`,
    );
  }

  const uploadFileSchema = toolsByName.get('upload_file').inputSchema;
  assert.ok(uploadFileSchema.properties.filePaths);
  assert.equal(uploadFileSchema.properties.filePath, undefined);
  assert.ok(
    toolsByName.get('list_console_messages').inputSchema.properties
      .includeStackTraces,
  );
  assert.ok(
    toolsByName.get('evaluate_script').inputSchema.properties.waitForStableDom,
  );

  const newPageResult = await client.callTool({
    name: 'new_page',
    arguments: {
      url: syntheticPageUrl,
    },
  });
  syntheticPageIds = newPageResult.structuredContent.pages
    .filter(page => page.url.includes(syntheticPageMarker))
    .map(page => page.id)
    .filter(pageId => Number.isInteger(pageId));
  const syntheticPage = newPageResult.structuredContent?.pages?.find(
    page => page.selected === true && page.url.includes(syntheticPageMarker),
  );
  assert.ok(syntheticPage, 'Could not identify the synthetic page');
  assert.ok(Number.isInteger(syntheticPage.id));

  const evaluationResult = await client.callTool({
    name: 'evaluate_script',
    arguments: {
      function: `() => {
        console.error('${syntheticPageMarker}');
        const browserIdentity = navigator.brave ? 'brave' : 'other';
        return browserIdentity + ':' + document.querySelector('h1')?.textContent;
      }`,
      waitForStableDom: false,
    },
  });
  assert.match(
    textFromToolResult(evaluationResult),
    /brave:Brave parity verification/,
    `Expected Brave at ${browserUrl}`,
  );

  const consoleResult = await client.callTool({
    name: 'list_console_messages',
    arguments: {includeStackTraces: true},
  });
  assert.match(
    textFromToolResult(consoleResult),
    new RegExp(syntheticPageMarker),
  );

  console.log(
    `Live Brave parity verified with ${tools.length} tools on an opaque synthetic page.`,
  );
} finally {
  for (const syntheticPageId of syntheticPageIds) {
    await client.callTool({
      name: 'close_page',
      arguments: {pageId: syntheticPageId},
    });
  }
  await client.close();
}
