---
name: brave-devtools-cli
description: Use this skill to write shell scripts or run shell commands to automate tasks in the browser or otherwise use Brave DevTools via CLI.
---

The `brave-mcp` CLI lets you interact with the browser from your terminal.

## Setup

_Note: If this is your very first time using the CLI, see [references/installation.md](references/installation.md) for setup. Installation is a one-time prerequisite and is **not** part of the regular AI workflow._

## AI Workflow

1. **Execute**: Run tools directly. If you don't know the target page's ID, run `brave-devtools list_pages` to find it. The background server starts implicitly; **do not** run `start`/`status`/`stop` before each use.
2. **Inspect**: Use `brave-devtools take_snapshot <pageId>` to get an element `<uid>`.
3. **Act**: Use `brave-devtools click <pageId> <uid>`, `brave-devtools fill <pageId> <uid> <value>`, etc. State persists across commands.

Snapshot example:

```
uid=1_0 RootWebArea "Example Domain" url="https://example.com/"
  uid=1_1 heading "Example Domain" level="1"
```

## Permissions & File Access

By default, the CLI has full filesystem access (`--allowUnrestrictedPaths=true`), allowing file-saving parameters (`--filePath`, `--outputDirPath`) and `upload_file` to access files anywhere on the system. Pass `--allowUnrestrictedPaths=false` if you want to restrict file access to the OS temp directory.

## Command Usage

```sh
brave-devtools <tool> [arguments] [flags]
```

- Required arguments are passed positionally; optional arguments use flags.
- Use `--help` on any command for usage details.
- Output defaults to plain Markdown-like text; pass `--output-format=json` for JSON.

## Input Automation (<uid> from snapshot)

```bash
brave-devtools take_snapshot 1 # Take a text snapshot of the page to get UIDs for elements
brave-devtools click 1 "id" # Clicks on the provided element
brave-devtools click 1 "id" --dblClick true --includeSnapshot true # Double clicks and returns a snapshot
brave-devtools drag 1 "src" "dst" # Drag an element onto another element
brave-devtools drag 1 "src" "dst" --includeSnapshot true # Drag an element and return a snapshot
brave-devtools fill 1 "id" "text" # Type text into an input, textarea, or select an option
brave-devtools fill 1 "id" "text" --includeSnapshot true # Fill an element and return a snapshot
brave-devtools handle_dialog 1 accept # Handle a browser dialog (accept/dismiss)
brave-devtools handle_dialog 1 dismiss --promptText "hi" # Dismiss a dialog with prompt text
brave-devtools hover 1 "id" # Hover over the provided element
brave-devtools hover 1 "id" --includeSnapshot true # Hover over an element and return a snapshot
brave-devtools press_key 1 "Enter" # Press a key or key combination ("Control+A", "Escape")
brave-devtools press_key 1 "Control+A" --includeSnapshot true # Press a key and return a snapshot
brave-devtools type_text 1 "hello" # Type text using keyboard into a focused input
brave-devtools type_text 1 "hello" --submitKey "Enter" # Type text and press a submit key
brave-devtools upload_file 1 "id" "file.txt" # Upload a file through a provided element
brave-devtools upload_file 1 "id" "file.txt" --includeSnapshot true # Upload a file and return a snapshot
```

## Navigation

```bash
brave-devtools close_page 1 # Closes the page by its index
brave-devtools list_pages # Get a list of pages open in the browser
brave-devtools navigate_page 1 --url "https://example.com" # Navigates the currently selected page to a URL
brave-devtools navigate_page 1 --type "reload" --ignoreCache true # Reload page ignoring cache
brave-devtools navigate_page 1 --url "https://example.com" --timeout 5000 # Navigate with a timeout
brave-devtools navigate_page 1 --handleBeforeUnload "accept" # Handle before unload dialog
brave-devtools navigate_page 1 --type "back" --initScript "foo()" # Navigate back and run an init script
brave-devtools new_page "https://example.com" # Creates a new page
brave-devtools new_page "https://example.com" --background true --timeout 5000 # Create new page in background
brave-devtools new_page "https://example.com" --isolatedContext "ctx" # Create new page with isolated context
brave-devtools select_page 1 # Select a page as a context for future tool calls
brave-devtools select_page 1 --bringToFront true # Select a page and bring it to front
```

## Emulation

```bash
brave-devtools emulate 1 --networkConditions "Offline" # Emulate network conditions
brave-devtools emulate 1 --cpuThrottlingRate 4 --geolocation "0x0" # Emulate CPU throttling and geolocation
brave-devtools emulate 1 --colorScheme "dark" --viewport "1920x1080" # Emulate color scheme and viewport
brave-devtools emulate 1 --userAgent "Mozilla/5.0..." # Emulate user agent
brave-devtools resize_page 1 1920 1080 # Resizes the selected page's window
```

## Performance

```bash
brave-devtools performance_analyze_insight 1 "1" "LCPBreakdown" # Get more details on a specific Performance Insight (pageId, insightSetId, insightName)
brave-devtools performance_start_trace 1 --reload true --autoStop false # Starts a performance trace recording (reload, autoStop)
brave-devtools performance_start_trace 1 --reload true --autoStop true --filePath "t.json.gz" # Start trace and save to a file
brave-devtools performance_stop_trace 1 # Stops the active performance trace
brave-devtools performance_stop_trace 1 --filePath "t.json.gz" # Stop trace and save to a file
```

## Memory

```bash
brave-devtools take_heapsnapshot 1 "./snap.heapsnapshot" # Capture a memory heap snapshot
```

### Memory Debugging (requires `--memoryDebugging=true`)

```bash
brave-devtools get_heapsnapshot_summary "./snap.heapsnapshot" # Get snapshot summary stats
brave-devtools compare_heapsnapshots "./base.heapsnapshot" "./target.heapsnapshot" # Compare two snapshots
brave-devtools get_heapsnapshot_class_nodes "./snap.heapsnapshot" "Array" # Inspect class instances
brave-devtools get_heapsnapshot_details "./snap.heapsnapshot" 123 # Detailed object properties
brave-devtools get_heapsnapshot_dominators "./snap.heapsnapshot" 123 # Dominator tree for node
brave-devtools get_heapsnapshot_duplicate_strings "./snap.heapsnapshot" # Find duplicated strings
brave-devtools get_heapsnapshot_edges "./snap.heapsnapshot" 123 # Node edges/references
brave-devtools get_heapsnapshot_object_details "./snap.heapsnapshot" 123 # Object details by node ID
brave-devtools get_heapsnapshot_retainers "./snap.heapsnapshot" 123 # Retaining objects
brave-devtools get_heapsnapshot_retaining_paths "./snap.heapsnapshot" 123 # Shortest retaining paths
brave-devtools close_heapsnapshot "./snap.heapsnapshot" # Free memory from loaded snapshot
```

## Network

```bash
brave-devtools get_network_request 1 # Get the currently selected network request for page 1
brave-devtools get_network_request 1 --reqid 1 --requestFilePath "req.md" # Get request by id and save to file
brave-devtools get_network_request 1 --responseFilePath "res.md" # Save response body to file
brave-devtools list_network_requests 1 # List all network requests for page 1
brave-devtools list_network_requests 1 --pageSize 50 --pageIdx 0 # List network requests with pagination
brave-devtools list_network_requests 1 --resourceTypes Fetch # Filter requests by resource type
brave-devtools list_network_requests 1 --includePreservedRequests true # Include preserved requests
```

## Debugging & Inspection

```bash
brave-devtools evaluate_script "() => document.title" --pageId 1 # Evaluate a JavaScript function on page 1
brave-devtools evaluate_script "(a) => a.innerText" --pageId 1 --args 1_4 # Evaluate JS with UID arguments on page 1
brave-devtools get_console_message 1 1 # Gets a console message by its ID
brave-devtools lighthouse_audit 1 --mode "navigation" # Run Lighthouse audit for navigation
brave-devtools lighthouse_audit 1 --mode "snapshot" --device "mobile" # Run Lighthouse audit for a snapshot on mobile
brave-devtools lighthouse_audit 1 --outputDirPath ./out # Run Lighthouse audit and save reports
brave-devtools list_console_messages 1 # List all console messages
brave-devtools list_console_messages 1 --pageSize 20 --pageIdx 1 # List console messages with pagination
brave-devtools list_console_messages 1 --types error --types info # Filter console messages by type
brave-devtools list_console_messages 1 --includePreservedMessages true # Include preserved messages
brave-devtools take_screenshot 1 # Take a screenshot of the page viewport
brave-devtools take_screenshot 1 --fullPage true --format "jpeg" --quality 80 # Take a full page screenshot as JPEG with quality
brave-devtools take_screenshot 1 --uid "id" --filePath "s.png" # Take a screenshot of an element
brave-devtools take_snapshot 1 # Take a text snapshot of the page from the a11y tree
brave-devtools take_snapshot 1 --verbose true --filePath "s.txt" # Take a verbose snapshot and save to file
```

## Extensions

```bash
brave-devtools list_extensions # Lists all the Brave extensions installed in the browser
brave-devtools install_extension "/path/to/extension" # Installs a Brave extension from the given path
brave-devtools uninstall_extension "extension_id" # Uninstalls a Brave extension by its ID
brave-devtools reload_extension "extension_id" # Reloads an unpacked Brave extension by its ID
brave-devtools trigger_extension_action "extension_id" # Triggers the default action of an extension by its ID
```

## Progressive Web Apps (requires `--categoryPwa=true`)

```bash
brave-devtools install_pwa "https://example.com/" # Install PWA by manifest ID or URL
brave-devtools launch_pwa "https://example.com/" # Launch installed PWA
brave-devtools get_os_app_state "https://example.com/" # Get OS app installation state
brave-devtools uninstall_pwa "https://example.com/" # Uninstall PWA and close windows
```

## Experimental Features

Experimental tools are disabled by default. Enable them with the corresponding flag during `start`.

```bash
brave-devtools click_at 1 100 200 # Clicks at the provided coordinates on page 1 (requires --experimentalVision=true)
brave-devtools screencast_start 1 --filePath "screen.mp4" # Starts a screencast recording on page 1 (requires --experimentalScreencast=true and ffmpeg)
brave-devtools screencast_stop 1 # Stops the active screencast on page 1
brave-devtools list_webmcp_tools 1 # List all WebMCP tools on page 1 (requires --categoryExperimentalWebmcp=true)
brave-devtools execute_webmcp_tool 1 "tool_name" --input '{"arg":"val"}' # Execute a WebMCP tool on page 1 (requires --categoryExperimentalWebmcp=true)
brave-devtools list_3p_developer_tools 1 # List third-party developer tools on page 1 (requires --categoryExperimentalThirdParty=true)
brave-devtools execute_3p_developer_tool 1 "tool_name" --params '{"arg":"val"}' # Execute third-party developer tool on page 1 (requires --categoryExperimentalThirdParty=true)
```

## Service Management

```bash
brave-devtools start   # Start or restart brave-mcp
brave-devtools start --headless=false # Start with visible browser window
brave-devtools status  # Checks if brave-mcp is running
brave-devtools stop    # Stop brave-mcp if any
```
