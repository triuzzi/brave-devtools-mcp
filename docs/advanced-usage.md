# Advanced usage

## Concurrent sessions

Most MCP clients start one Brave DevTools MCP server per conversation.
By default, the server runs with `--pageIdRouting` enabled, making `pageId` a
required parameter on page-scoped tools (such as `click`, `fill`, `navigate_page`,
`take_snapshot`, etc.) so multiple agents or subagents sharing a server instance can
route tool calls directly to the specific tab they are working with.

For `evaluate_script`, `pageId` is required by default for targeting pages, but
becomes optional when `--categoryExtensions` is enabled so that `serviceWorkerId`
can be specified instead to evaluate inside an extension background service worker.

To disable this behavior and default to the currently selected page, pass
`--no-page-id-routing`.

```json
{
  "mcpServers": {
    "brave-devtools": {
      "command": "npx",
      "args": ["-y", "brave-mcp@latest"]
    }
  }
}
```

If you run multiple independent MCP client sessions and want each session to
launch its own temporary Brave profile, also pass `--isolated`. This avoids
sharing the default Brave DevTools MCP user data directory between those
server instances.

## User data directory

By default, `brave-mcp` starts the Brave release channel using the following user
data directory:

- Linux / macOS: `$HOME/.cache/brave-devtools-mcp/brave-profile`
- Windows: `%USERPROFILE%\.cache\brave-devtools-mcp\brave-profile`

For non-release channels, the channel name is appended to the directory name, for example
`brave-profile-nightly`.

The user data directory is not cleared between runs and is reused for subsequent
runs with the same channel. Only one browser can use it at a time. Set the `isolated`
option to `true` to use a temporary user data directory instead which will be cleared
automatically after the browser is closed.

## Custom browser executable

By default, `brave-mcp` launches Brave installed in the standard location for
the selected channel. To launch a Brave-based browser installed in a custom or
non-standard location, pass its executable path with `--executablePath` (or
`-e`):

```json
{
  "mcpServers": {
    "brave-devtools": {
      "command": "npx",
      "args": ["brave-mcp@latest", "--executablePath=/path/to/brave"]
    }
  }
}
```

`--executablePath` only applies when the MCP server launches the browser. It
cannot be combined with `--channel`, `--autoConnect`, `--browserUrl` or
`--wsEndpoint`. To use a browser that is already running, see
[Connecting to a running Brave instance](#connecting-to-a-running-brave-instance).

## Connecting to a running Brave instance

By default, the Brave DevTools MCP server will start a new Brave instance with a dedicated profile. This might not be ideal in all situations:

- If you would like to maintain the same application state when alternating between manual site testing and agent-driven testing.
- When the MCP needs to sign into a website. Some accounts may prevent sign-in when the browser is controlled via WebDriver (the default launch mechanism for the Brave DevTools MCP server).
- If you're running your LLM inside a sandboxed environment, but you would like to connect to a Brave instance that runs outside the sandbox.

In these cases, start Brave first and let the Brave DevTools MCP server connect to it. There are two ways to do so:

- **Automatic connection**: best for sharing state between manual and agent-driven testing.
- **Manual connection via remote debugging port**: best when running inside a sandboxed environment.

### Connecting to a Brave you start with a debugging port (recommended)

Start Brave yourself with a loopback debugging port and a dedicated profile, then
point the server at that endpoint. The agent can attach to every ordinary tab in
that instance and does not ask for permission on each connection. Fully quit any
Brave windows using the same profile first.

**macOS**

```bash
"/Applications/Brave Browser.app/Contents/MacOS/Brave Browser" \
  --user-data-dir="$HOME/.brave-agent" \
  --remote-debugging-address=127.0.0.1 \
  --remote-debugging-port=9222
```

**Linux**

```bash
brave-browser \
  --user-data-dir="$HOME/.brave-agent" \
  --remote-debugging-address=127.0.0.1 \
  --remote-debugging-port=9222
```

**Windows**

```bash
"C:\Program Files\BraveSoftware\Brave-Browser\Application\brave.exe" ^
  --user-data-dir="%TEMP%\brave-agent" ^
  --remote-debugging-address=127.0.0.1 ^
  --remote-debugging-port=9222
```

Use `--browserUrl` to attach to it:

```json
{
  "mcpServers": {
    "brave-devtools": {
      "command": "npx",
      "args": ["brave-mcp@latest", "--browserUrl=http://127.0.0.1:9222"]
    }
  }
}
```

Check the endpoint before an agent attaches:

```bash
curl -fsS http://127.0.0.1:9222/json/version >/dev/null && echo brave-cdp-ready
```

> [!WARNING]
> Keep the debugging port on loopback. Any local process that can reach it can
> control the browser, so do not browse sensitive sites in that profile and do
> not expose the port on a network interface.

### Connecting with --autoConnect and brave://inspect (alternative)

If you would rather enable remote debugging from the browser UI, keep using
`--autoConnect`; Brave then asks for approval on each connection.

**Step 1:** In Brave, open `brave://inspect/#remote-debugging` and enable
remote debugging, then follow the dialog.

**Step 2:** Start the server with `--autoConnect` (Brave profile discovery) or
`--browserUrl=http://127.0.0.1:<port>` (an explicit endpoint):

```json
{
  "mcpServers": {
    "brave-devtools": {
      "command": "npx",
      "args": ["brave-mcp@latest", "--autoConnect"]
    }
  }
}
```

**Step 3:** Test your setup

Make sure Brave is running, then run the following prompt in your MCP client:

```none
Check the performance of https://developers.chrome.com
```

> [!NOTE]
> The <code>autoConnect</code> option requires the user to start Brave. If the user has multiple active profiles, the MCP server connects to Brave's default profile and can access all open windows for that profile. On Linux it also discovers the `Brave-Origin` profile used by Manjaro's `brave-origin-bin` package, preferring the profile with an active debugging port.

The server asks Brave for permission. Clicking **Allow** lets it open
[developers.chrome.com](http://developers.chrome.com) and take a performance
trace.

> [!TIP]
> If the debug port is open but `http://127.0.0.1:<port>/json/version` answers
> **404**, Brave is waiting for that approval and `brave-mcp` says so in the
> attach error. Approve the dialog, or switch to the debugging-port setup above.

### Manual connection using port forwarding

You can connect to a running Brave instance by using the `--browser-url` option. This is useful if you are running the MCP server in a sandboxed environment that does not allow starting a new Brave instance.

Here is a step-by-step guide on how to connect to a running Brave instance:

**Step 1: Configure the MCP client**

Add the `--browser-url` option to your MCP client configuration. The value of this option should be the URL of the running Brave instance. `http://127.0.0.1:9222` is a common default.

```json
{
  "mcpServers": {
    "brave-devtools": {
      "command": "npx",
      "args": ["brave-mcp@latest", "--browser-url=http://127.0.0.1:9222"]
    }
  }
}
```

**Step 2: Start the Brave browser**

> [!WARNING]
> Enabling the remote debugging port opens up a debugging port on the running browser instance. Any application on your machine can connect to this port and control the browser. Make sure that you are not browsing any sensitive websites while the debugging port is open.

Start the Brave browser with the remote debugging port enabled. Make sure to close any running Brave instances before starting a new one with the debugging port enabled. The port number you choose must be the same as the one you specified in the `--browser-url` option in your MCP client configuration.

Use a dedicated user data directory when enabling the remote debugging port so your regular browsing profile and data are not exposed to the debugging session.

**macOS**

```bash
/Applications/Brave\ Browser.app/Contents/MacOS/Brave\ Browser \
  --remote-debugging-address=127.0.0.1 \
  --remote-debugging-port=9222 \
  --user-data-dir=/tmp/brave-profile-release
```

**Linux**

```bash
/usr/bin/brave-browser \
  --remote-debugging-address=127.0.0.1 \
  --remote-debugging-port=9222 \
  --user-data-dir=/tmp/brave-profile-release
```

**Windows**

```bash
"C:\Program Files\BraveSoftware\Brave-Browser\Application\brave.exe" ^
  --remote-debugging-address=127.0.0.1 ^
  --remote-debugging-port=9222 ^
  --user-data-dir="%TEMP%\brave-profile-release"
```

**Step 3: Test your setup**

After configuring the MCP client and starting the Brave browser, you can test your setup by running a simple prompt in your MCP client:

```
Check the performance of https://developers.chrome.com
```

Your MCP client should connect to the running Brave instance and receive a performance report.

If you hit VM-to-host port forwarding issues, see the “Remote debugging between virtual machine (VM) and host fails” section in [`docs/troubleshooting.md`](./troubleshooting.md#remote-debugging-between-virtual-machine-vm-and-host-fails).

For more details on remote debugging, see the [Chromium DevTools documentation](https://developer.chrome.com/docs/devtools/remote-debugging/).

## Debugging Chrome on Android

Please consult [these instructions](./debugging-android.md).
