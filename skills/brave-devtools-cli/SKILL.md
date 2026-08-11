---
name: brave-devtools-cli
description: Use this skill to write shell scripts or run shell commands to automate tasks in the browser or otherwise use Brave DevTools via CLI.
---

The `brave-mcp` CLI lets you interact with the browser from your terminal.

## Setup

_Note: If this is your very first time using the CLI, see [references/installation.md](references/installation.md) for setup. Installation is a one-time prerequisite and is **not** part of the regular AI workflow._

## AI Workflow

1. **Execute**: Run tools directly (e.g., `brave-devtools list_pages`). The background server starts implicitly; **do not** run `start`/`status`/`stop` before each use.
2. **Inspect**: Use `take_snapshot` to get an element `<uid>`.
3. **Act**: Use `click`, `fill`, etc. State persists across commands.

Snapshot example:

```
uid=1_0 RootWebArea "Example Domain" url="https://example.com/"
  uid=1_1 heading "Example Domain" level="1"
```

## Command Usage

```sh
brave-devtools <tool> [arguments] [flags]
```

Use `--help` on any command. Output defaults to Markdown, use `--output-format=json` for JSON.

## Input Automation (<uid> from snapshot)

```bash
brave-devtools take_snapshot --help # Help message for commands, works for any command.
brave-devtools take_snapshot # Take a text snapshot of the page to get UIDs for elements
brave-devtools click "id" # Clicks on the provided element
brave-devtools click "id" --dblClick true --includeSnapshot true # Double clicks and returns a snapshot
brave-devtools drag "src" "dst" # Drag an element onto another element
brave-devtools drag "src" "dst" --includeSnapshot true # Drag an element and return a snapshot
brave-devtools fill "id" "text" # Type text into an input or select an option
brave-devtools fill "id" "text" --includeSnapshot true # Fill an element and return a snapshot
brave-devtools handle_dialog accept # Handle a browser dialog
brave-devtools handle_dialog dismiss --promptText "hi" # Dismiss a dialog with prompt text
brave-devtools hover "id" # Hover over the provided element
brave-devtools hover "id" --includeSnapshot true # Hover over an element and return a snapshot
brave-devtools press_key "Enter" # Press a key or key combination
brave-devtools press_key "Control+A" --includeSnapshot true # Press a key and return a snapshot
brave-devtools type_text "hello" # Type text using keyboard into a focused input
brave-devtools type_text "hello" --submitKey "Enter" # Type text and press a submit key
brave-devtools upload_file "id" "file.txt" # Upload a file through a provided element
brave-devtools upload_file "id" "file.txt" --includeSnapshot true # Upload a file and return a snapshot
```

## Navigation

```bash
brave-devtools close_page 1 # Closes the page by its index
brave-devtools list_pages # Get a list of pages open in the browser
brave-devtools navigate_page --url "https://example.com" # Navigates the currently selected page to a URL
brave-devtools navigate_page --type "reload" --ignoreCache true # Reload page ignoring cache
brave-devtools navigate_page --url "https://example.com" --timeout 5000 # Navigate with a timeout
brave-devtools navigate_page --handleBeforeUnload "accept" # Handle before unload dialog
brave-devtools navigate_page --type "back" --initScript "foo()" # Navigate back and run an init script
brave-devtools new_page "https://example.com" # Creates a new page
brave-devtools new_page "https://example.com" --background true --timeout 5000 # Create new page in background
brave-devtools new_page "https://example.com" --isolatedContext "ctx" # Create new page with isolated context
brave-devtools select_page 1 # Select a page as a context for future tool calls
brave-devtools select_page 1 --bringToFront true # Select a page and bring it to front
```

## Emulation

```bash
brave-devtools emulate --networkConditions "Offline" # Emulate network conditions
brave-devtools emulate --cpuThrottlingRate 4 --geolocation "0x0" # Emulate CPU throttling and geolocation
brave-devtools emulate --colorScheme "dark" --viewport "1920x1080" # Emulate color scheme and viewport
brave-devtools emulate --userAgent "Mozilla/5.0..." # Emulate user agent
brave-devtools resize_page 1920 1080 # Resizes the selected page's window
```

## Performance

```bash
brave-devtools performance_analyze_insight "1" "LCPBreakdown" # Get more details on a specific Performance Insight
brave-devtools performance_start_trace true false # Starts a performance trace recording
brave-devtools performance_start_trace true true --filePath t.gz # Start trace and save to a file
brave-devtools performance_stop_trace # Stops the active performance trace
brave-devtools performance_stop_trace --filePath "t.json" # Stop trace and save to a file
brave-devtools take_memory_snapshot "./snap.heapsnapshot" # Capture a memory heapsnapshot
```

## Network

```bash
brave-devtools get_network_request # Get the currently selected network request
brave-devtools get_network_request --reqid 1 --requestFilePath req.md # Get request by id and save to file
brave-devtools get_network_request --responseFilePath res.md # Save response body to file
brave-devtools list_network_requests # List all network requests
brave-devtools list_network_requests --pageSize 50 --pageIdx 0 # List network requests with pagination
brave-devtools list_network_requests --resourceTypes Fetch # Filter requests by resource type
brave-devtools list_network_requests --includePreservedRequests true # Include preserved requests
```

## Debugging & Inspection

```bash
brave-devtools evaluate_script "() => document.title" # Evaluate a JavaScript function on the page
brave-devtools evaluate_script "(a) => a.innerText" --args 1_4 # Evaluate JS with UID arguments
brave-devtools get_console_message 1 # Gets a console message by its ID
brave-devtools lighthouse_audit --mode "navigation" # Run Lighthouse audit for navigation
brave-devtools lighthouse_audit --mode "snapshot" --device "mobile" # Run Lighthouse audit for a snapshot on mobile
brave-devtools lighthouse_audit --outputDirPath ./out # Run Lighthouse audit and save reports
brave-devtools list_console_messages # List all console messages
brave-devtools list_console_messages --pageSize 20 --pageIdx 1 # List console messages with pagination
brave-devtools list_console_messages --types error --types info # Filter console messages by type
brave-devtools list_console_messages --includePreservedMessages true # Include preserved messages
brave-devtools take_screenshot # Take a screenshot of the page viewport
brave-devtools take_screenshot --fullPage true --format "jpeg" --quality 80 # Take a full page screenshot as JPEG with quality
brave-devtools take_screenshot --uid "id" --filePath "s.png" # Take a screenshot of an element
brave-devtools take_snapshot # Take a text snapshot of the page from the a11y tree
brave-devtools take_snapshot --verbose true --filePath "s.txt" # Take a verbose snapshot and save to file
```

## Extensions

```bash
brave-devtools list_extensions # Lists all the Brave extensions installed in the browser
brave-devtools install_extension "/path/to/extension" # Installs a Brave extension from the given path
brave-devtools uninstall_extension "extension_id" # Uninstalls a Brave extension by its ID
brave-devtools reload_extension "extension_id" # Reloads an unpacked Brave extension by its ID
brave-devtools trigger_extension_action "extension_id" # Triggers the default action of an extension by its ID
```

## Experimental Features

Experimental tools are disabled by default. Enable them with the corresponding flag during `start`.

```bash
brave-devtools click_at 100 200 # Clicks at the provided coordinates (requires --experimentalVision=true)
brave-devtools screencast_start # Starts a screencast recording (requires --experimentalScreencast=true and ffmpeg)
brave-devtools screencast_stop # Stops the active screencast
brave-devtools list_webmcp_tools # List all WebMCP tools (requires --categoryExperimentalWebmcp=true)
```

## Service Management

```bash
brave-devtools start   # Start or restart brave-mcp
brave-devtools status  # Checks if brave-mcp is running
brave-devtools stop    # Stop brave-mcp if any
```
