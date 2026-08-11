# How to contribute

We'd love to accept your patches and contributions to this project.

## Licensing

By submitting a contribution, you agree to license it under this repository's
Apache License 2.0 and confirm that you have the right to do so.

## Development process

### Code reviews

All submissions, including submissions by project members, require review. We
use GitHub pull requests for this purpose. Consult
[GitHub Help](https://help.github.com/articles/about-pull-requests/) for more
information on using pull requests.

### Conventional commits

Please follow [conventional commits](https://www.conventionalcommits.org/en/v1.0.0/)
for PR and commit titles.

### Feature release checklist

Use `chore:` for commits containing incomplete features that are not available
to users yet. Once the feature is ready to be released, create a PR with a
`feat:` prefix that enables the feature. The following criteria need to be
completed:

- Documentation for the feature is up to date. For example, README.md and tools
  reference are updated.
- The feature can be used with Brave release or version restrictions are
  documented otherwise.
- Corresponding skills are updated or new skills are added if needed.
- The feature fulfills the use case by its own or in conjunction with existing
  features (we want to avoid features that offer some tools but cannot be used
  successfully to debug things).

### Release process

Update every versioned manifest in a pull request. After that pull request is
green and merged, dispatch the `Release` workflow from `main`. It verifies the
full package, creates the matching `v<version>` GitHub release, publishes
`brave-mcp` to npm with provenance, and publishes the MCP Registry entry.

### How to update the Lighthouse dependency

- Update the Lighthouse version in package.json and run `npm install`. The npm version is currently used for types.
- Check out the corresponding Lighthouse repository revision to a sibling directory (`../lighthouse`).
- Run `npm run update-lighthouse` (Note that Lighthouse requires yarn).
- Commit the bundle. If new dependencies are added via the bundle, update `tests/third_party_notices.test.ts`.

## Installation

Check that you are using node version specified in .nvmrc, then run following commands:

```sh
git clone https://github.com/triuzzi/brave-devtools-mcp.git
cd brave-devtools-mcp
npm ci
npm run build
```

### Testing with @modelcontextprotocol/inspector

```sh
npx @modelcontextprotocol/inspector node ./build/src/bin/brave-devtools-mcp.js
```

### Testing with an MCP client

Add the MCP server to your client's config.

```json
{
  "mcpServers": {
    "brave-devtools": {
      "command": "node",
      "args": [
        "/<path-to-brave-devtools-mcp>/build/src/bin/brave-devtools-mcp.js"
      ]
    }
  }
}
```

#### Using with VS Code SSH

When running the `@modelcontextprotocol/inspector` it spawns 2 services - one on port `6274` and one on `6277`.
Usually VS Code automatically detects and forwards `6274` but fails to detect `6277` so you need to manually forward it.

### Debugging

To write debug logs to `log.txt` in the working directory, run with the following commands:

```sh
npx @modelcontextprotocol/inspector node ./build/src/bin/brave-devtools-mcp.js --log-file=/your/desired/path/log.txt
```

You can use the `DEBUG` environment variable as usual to control categories that are logged.

### Updating documentation

When adding a new tool or updating a tool name or description, make sure to run `npm run gen` to generate the tool reference documentation.

### Contributing to Evals

We use Gemini to evaluate the MCP server tools in `scripts/eval_scenarios`.
Each scenario is a TypeScript file that exports a `scenario` object implementing `TestScenario`.

- **prompt**: The prompt to send to the model.
- **maxTurns**: Maximum number of conversation turns.
- **expectations**: A function that verifies the tool calls made by the model.
- **htmlRoute** (Optional): Serve custom HTML content for the test at a specific path.

We look to test that the tools are used correctly without too rigid assertions. Avoid asserting exact argument values if they can vary (e.g., natural language reasoning), but ensure the core parameters (like URLs or selectors) were correct.

Example:

```ts
import {TestScenario} from '../eval_gemini.js';

export const scenario: TestScenario = {
  prompt: 'Navigate to example.com',
  maxTurns: 2,
  expectations: calls => {
    // Check that at least one call was 'browse_page'
    const navigation = calls.find(c => c.name === 'browse_page');
    if (!navigation) throw new Error('Model did not browse the page');
    // Verify essential args
    if (navigation.args.url !== 'http://example.com') {
      throw new Error(`Wrong URL: ${navigation.args.url}`);
    }
  },
};
```

## Restrictions on JSON schema

- no .nullable(), no .object() types. Enforced by the `@local/enforce-zod-schema` ESLint rule.
- represent complex object as a short formatted string.
