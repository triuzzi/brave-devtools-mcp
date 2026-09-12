# MCP Client configuration

<!--
When adding a new client configuration, make sure to add it in alphabetical order.
-->

<details>
  <summary>Amp</summary>
  Follow https://ampcode.com/manual#mcp and use the config provided above. You can also install the Brave DevTools MCP server using the CLI:

```bash
amp mcp add brave-devtools -- npx brave-mcp@latest
```

</details>

<details>
  <summary>Antigravity</summary>

To use the Brave DevTools MCP server follow the instructions from <a href="https://antigravity.google/docs/mcp">Antigravity's docs</a> to install a custom MCP server. Add the following config to the MCP servers config:

```bash
{
  "mcpServers": {
    "brave-devtools": {
      "command": "npx",
      "args": [
        "-y",
        "brave-mcp@latest",
        "--browser-url=http://127.0.0.1:9222"
      ]
    }
  }
}
```

This will make the Brave DevTools MCP server automatically connect to the browser that Antigravity is using. If you are not using port 9222, make sure to adjust accordingly.

Brave DevTools MCP will not start the browser instance automatically using this approach because the Brave DevTools MCP server connects to Antigravity's built-in browser. If the browser is not already running, you have to start it first by clicking the Chrome icon at the top right corner.

</details>

<details>
  <summary>Bob</summary>

Follow the <a href="https://bob.ibm.com/docs/ide/configuration/mcp/mcp-in-bob">IBM Bob MCP guide</a> and add the Brave DevTools MCP server to your Bob MCP configuration. Use the global config (`~/.bob/mcp.json`) to apply it across all workspaces, or a project config (`.bob/mcp.json`) to scope it to one project:

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

You can edit these files from **Bob panel → Settings → MCP → Edit Global MCP** (or **Edit Project MCP**). Bob hot-reloads on save. Once the server appears in the MCP tab, switch to the **🌎 Browser Dev** mode to get guided browser debugging directly in Bob.

</details>

<details>
  <summary>Claude Code</summary>

**Install via CLI (MCP only)**

Use the Claude Code CLI to add the Brave DevTools MCP server (<a href="https://code.claude.com/docs/en/mcp">guide</a>):

```bash
claude mcp add brave-devtools --scope user npx brave-mcp@latest
```

**Install as a Plugin (MCP + Skills)**

> [!NOTE]
> If you already had Brave DevTools MCP installed previously for Claude Code, make sure to remove it first from your installation and configuration files.

To install Brave DevTools MCP with skills, add the marketplace registry in Claude Code:

```sh
/plugin marketplace add triuzzi/brave-devtools-mcp
```

Then, install the plugin:

```sh
/plugin install brave-devtools-mcp@brave-devtools-plugins
```

Restart Claude Code to have the MCP server and skills load (check with `/skills`).

> [!TIP]
> If the plugin installation fails with a `Failed to clone repository` error (e.g., HTTPS connectivity issues behind a corporate firewall), see the [troubleshooting guide](./troubleshooting.md#claude-code-plugin-installation-fails-with-failed-to-clone-repository) for workarounds, or use the CLI installation method above instead.

</details>

<details>
  <summary>Cline</summary>
  Follow https://docs.cline.bot/mcp/configuring-mcp-servers and use the config provided above.
</details>

<details>
  <summary>Codex</summary>
  Follow the <a href="https://developers.openai.com/codex/mcp/#configure-with-the-cli">configure MCP guide</a>
  using the standard config from above. You can also install the Brave DevTools MCP server using the Codex CLI:

```bash
codex mcp add brave-devtools -- npx brave-mcp@latest
```

**On Windows 11**

Configure the Brave install location and increase the startup timeout by updating `.codex/config.toml` and adding the following `env` and `startup_timeout_ms` parameters:

```
[mcp_servers.brave-devtools]
command = "cmd"
args = [
    "/c",
    "npx",
    "-y",
    "brave-mcp@latest",
]
env = { SystemRoot="C:\\Windows", PROGRAMFILES="C:\\Program Files" }
startup_timeout_ms = 20_000
```

</details>

<details>
  <summary>Command Code</summary>

Use the Command Code CLI to add the Brave DevTools MCP server (<a href="https://commandcode.ai/docs/mcp">MCP guide</a>):

```bash
cmd mcp add brave-devtools --scope user npx brave-mcp@latest
```

</details>

<details>
  <summary>Copilot CLI</summary>

Start Copilot CLI:

```
copilot
```

Start the dialog to add a new MCP server by running:

```
/mcp add
```

Configure the following fields and press `CTRL+S` to save the configuration:

- **Server name:** `brave-devtools`
- **Server Type:** `[1] Local`
- **Command:** `npx -y brave-mcp@latest`

</details>

<details>
  <summary>Copilot / VS Code</summary>

**Install as a Plugin (Recommended)**

The easiest way to get up and running is to install `brave-mcp` as an agent plugin.
This bundles the **MCP server** and all **skills** together, so your agent gets both the tools
and the expert guidance it needs to use them effectively.

1.  Open the **Command Palette** (`Cmd+Shift+P` on macOS or `Ctrl+Shift+P` on Windows/Linux).
2.  Search for and run the **Chat: Install Plugin From Source** command.
3.  Paste in our repository name: `triuzzi/brave-devtools-mcp`.

That's it! Your agent is now supercharged with Brave DevTools capabilities.

---

**Install as an MCP Server (MCP only)**

**Click the button to install:**

[<img src="https://img.shields.io/badge/VS_Code-VS_Code?style=flat-square&label=Install%20Server&color=0098FF" alt="Install in VS Code">](https://vscode.dev/redirect/mcp/install?name=io.github.triuzzi%2Fbrave-mcp&config=%7B%22command%22%3A%22npx%22%2C%22args%22%3A%5B%22-y%22%2C%22brave-mcp%22%5D%2C%22env%22%3A%7B%7D%7D)

[<img src="https://img.shields.io/badge/VS_Code_Insiders-VS_Code_Insiders?style=flat-square&label=Install%20Server&color=24bfa5" alt="Install in VS Code Insiders">](https://insiders.vscode.dev/redirect?url=vscode-insiders%3Amcp%2Finstall%3F%257B%2522name%2522%253A%2522io.github.triuzzi%252Fbrave-mcp%2522%252C%2522config%2522%253A%257B%2522command%2522%253A%2522npx%2522%252C%2522args%2522%253A%255B%2522-y%2522%252C%2522brave-mcp%2522%255D%252C%2522env%2522%253A%257B%257D%257D%257D)

**Or install manually:**

Follow the VS Code [MCP configuration guide](https://code.visualstudio.com/docs/copilot/chat/mcp-servers#_add-an-mcp-server) using the standard config from above, or use the CLI:

For macOS and Linux:

```bash
code --add-mcp '{"name":"io.github.triuzzi/brave-devtools-mcp","command":"npx","args":["-y","brave-mcp"],"env":{}}'
```

For Windows (PowerShell):

```powershell
code --add-mcp '{"""name""":"""io.github.triuzzi/brave-devtools-mcp""","""command""":"""npx""","""args""":["""-y""","""brave-mcp"""]}'
```

</details>

<details>
  <summary>Cursor</summary>

**Click the button to install:**

[<img src="https://cursor.com/deeplink/mcp-install-dark.svg" alt="Install in Cursor">](https://cursor.com/en/install-mcp?name=brave-devtools&config=eyJjb21tYW5kIjoibnB4IC15IGJyYXZlLW1jcEBsYXRlc3QifQ%3D%3D)

**Or install manually:**

Go to `Cursor Settings` -> `MCP` -> `New MCP Server`. Use the config provided above.

</details>

<details>
  <summary>Devin CLI</summary>

**Install via CLI (MCP only)**

Use the Devin CLI to add the Brave DevTools MCP server (<a href="https://docs.devin.ai/cli/extensibility/mcp/configuration">guide</a>):

```bash
devin mcp add brave-devtools -- npx brave-mcp@latest
```

</details>

<details>
  <summary>Factory CLI</summary>
Use the Factory CLI to add the Brave DevTools MCP server (<a href="https://docs.factory.ai/cli/configuration/mcp">guide</a>):

```bash
droid mcp add brave-devtools "npx -y brave-mcp@latest"
```

</details>

<details>
  <summary>Gemini CLI</summary>
Install the Brave DevTools MCP server using the Gemini CLI.

**Project wide:**

```bash
# Either MCP only:
gemini mcp add brave-devtools npx brave-mcp@latest
# Or as a Gemini extension (MCP+Skills):
gemini extensions install --auto-update https://github.com/triuzzi/brave-devtools-mcp
```

**Globally:**

```bash
gemini mcp add -s user brave-devtools npx brave-mcp@latest
```

Alternatively, follow the <a href="https://github.com/google-gemini/gemini-cli/blob/main/docs/tools/mcp-server.md#how-to-set-up-your-mcp-server">MCP guide</a> and use the standard config from above.

</details>

<details>
  <summary>Gemini Code Assist</summary>
  Follow the <a href="https://cloud.google.com/gemini/docs/codeassist/use-agentic-chat-pair-programmer#configure-mcp-servers">configure MCP guide</a>
  using the standard config from above.
</details>

<details>
  <summary>Grok Build CLI</summary>

```bash
grok mcp add brave-devtools npx brave-mcp@latest
```

See the <a href="https://docs.x.ai/build/features/skills-plugins-marketplaces">docs</a> for more options
</details>

<details>
  <summary>JetBrains AI Assistant & Junie</summary>

Go to `Settings | Tools | AI Assistant | Model Context Protocol (MCP)` -> `Add`. Use the config provided above.
The same way brave-mcp can be configured for JetBrains Junie in `Settings | Tools | Junie | MCP Settings` -> `Add`. Use the config provided above.

</details>

<details>
  <summary>Kiro</summary>

In **Kiro Settings**, go to `Configure MCP` > `Open Workspace or User MCP Config` > Use the configuration snippet provided above.

Or, from the IDE **Activity Bar** > `Kiro` > `MCP Servers` > `Click Open MCP Config`. Use the configuration snippet provided above.

</details>

<details>
  <summary>Katalon Studio</summary>

The Brave DevTools MCP server can be used with Katalon StudioAssist via an MCP proxy.

**Step 1:** Install the MCP proxy by following the <a href="https://docs.katalon.com/katalon-studio/studioassist/mcp-servers/setting-up-mcp-proxy-for-stdio-mcp-servers">MCP proxy setup guide</a>.

**Step 2:** Start the Brave DevTools MCP server with the proxy:

```bash
mcp-proxy --transport streamablehttp --port 8080 -- npx -y brave-mcp@latest
```

**Note:** You may need to pick another port if 8080 is already in use.

**Step 3:** In Katalon Studio, add the server to StudioAssist with the following settings:

- **Connection URL:** `http://127.0.0.1:8080/mcp`
- **Transport type:** `HTTP`

Once connected, the Brave DevTools MCP tools will be available in StudioAssist.

</details>

<details>
  <summary>Mistral Vibe</summary>

Add in ~/.vibe/config.toml:

```toml
[[mcp_servers]]
name = "brave-devtools"
transport = "stdio"
command = "npx"
args = ["brave-mcp@latest"]
```

</details>

<details>
  <summary>OpenCode</summary>

Add the following configuration to your `opencode.json` file. If you don't have one, create it at `~/.config/opencode/opencode.json` (<a href="https://opencode.ai/docs/mcp-servers">guide</a>):

```json
{
  "$schema": "https://opencode.ai/config.json",
  "mcp": {
    "brave-devtools": {
      "type": "local",
      "command": ["npx", "-y", "brave-mcp@latest"]
    }
  }
}
```

</details>

<details>
  <summary>Qoder</summary>

In **Qoder Settings**, go to `MCP Server` > `+ Add` > Use the configuration snippet provided above.

Alternatively, follow the <a href="https://docs.qoder.com/user-guide/chat/model-context-protocol">MCP guide</a> and use the standard config from above.

</details>

<details>
  <summary>Qoder CLI</summary>

Install the Brave DevTools MCP server using the Qoder CLI (<a href="https://docs.qoder.com/cli/using-cli#mcp-servers">guide</a>):

**Project wide:**

```bash
qodercli mcp add brave-devtools -- npx brave-mcp@latest
```

**Globally:**

```bash
qodercli mcp add -s user brave-devtools -- npx brave-mcp@latest
```

</details>

<details>
  <summary>Visual Studio</summary>

**Click the button to install:**

[<img src="https://img.shields.io/badge/Visual_Studio-Install-C16FDE?logo=visualstudio&logoColor=white" alt="Install in Visual Studio">](https://vs-open.link/mcp-install?%7B%22name%22%3A%22brave-devtools%22%2C%22command%22%3A%22npx%22%2C%22args%22%3A%5B%22brave-mcp%40latest%22%5D%7D)

</details>

<details>
  <summary>Warp</summary>

Go to `Settings | AI | Manage MCP Servers` -> `+ Add` to [add an MCP Server](https://docs.warp.dev/knowledge-and-collaboration/mcp#adding-an-mcp-server). Use the config provided above.

</details>

<details>
  <summary>Windsurf</summary>
  Follow the <a href="https://docs.windsurf.com/windsurf/cascade/mcp#mcp-config-json">configure MCP guide</a>
  using the standard config from above.
</details>
