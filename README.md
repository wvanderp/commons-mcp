# Commons MCP

An installable Model Context Protocol (MCP) server + CLI that lets any LLM (or you) search Wikimedia Commons for freely licensed images by keyword.

- Stack: Node.js + TypeScript
- Interface: MCP server (`stdio`) exposing one tool: `search_commons`
- Output: description, image URL, page URL (+ author/license when available)
- Distribution: Published to npm as `commons-mcp`

## Capabilities

Tool: `search_commons`

- Input: `query` (string), optional `limit` (number, default 5)
- Output: array of `{ title, description, imageUrl, pageUrl, author, license }`

## Install

Global (exposes `commons-mcp` and `commons-mcp-server` commands):

```sh
npm install -g commons-mcp
```

Ad‑hoc (no global install) using `npx`:

```sh
npx commons-mcp --q "red panda" --limit 2
```

Add to a project (for programmatic use / embedding):

```sh
npm install commons-mcp
```

## Usage

### CLI (human friendly)

Search images quickly:

```sh
commons-mcp --q "red panda" --limit 3
```

Output: each match with title, description, image URL, page URL separated by `---`.

### MCP Server (LLM tool integration)

Executable entrypoint:

```sh
commons-mcp-server
```

Integrate with an MCP-compatible client (e.g. VS Code extension) by pointing the command to `commons-mcp-server` (or to your local dev command during development).

### Dev Workflow

```sh
npm install
npm run dev          # tsx watch mode
npm test             # run tests (live Commons API queries)
npm run build        # emit dist/
npm start            # run built server
```

## Testing note

Unit tests in `test/` use stubbed search implementations by default. You may
choose to call the real server or a real Wikimedia Commons search implementation
from a test by passing a real `search` function to `createMcp` — this turns the
test into an integration test. If you do this, ensure network access and
external dependencies are acceptable in your CI environment.

## VS Code Integration

You can use this MCP server directly in VS Code with the Model Context Protocol extension:

1. Open `.vscode/mcp.json` in your project (or create it if missing).
2. Add a server entry like this:

```jsonc
{
 "servers": {
  "my-mcp-server-a83fb132": {
   "type": "stdio",
   "command": "tsx",
   "args": [
    "watch",
    "src/index.ts"
   ]
  }
 },
 "inputs": []
}
```

3. Save the file and reload VS Code if needed.
4. The MCP extension should now detect and offer the `search_commons` tool for use in chat or tool panels.

> **Tip:** You can use any unique name for the server key. The above example matches the default dev setup.

## Publishing & Release

Releases are automated via GitHub Actions on version tags.

1. Bump the version in `package.json` (respecting semver).
2. Commit the change: `git commit -am "chore: release v0.1.1"`.
3. Tag it: `git tag v0.1.1`.
4. Push: `git push && git push origin v0.1.1`.
5. The `publish` workflow will build, test, and publish to npm (requires `NPM_TOKEN` repo secret).

Local manual publish (fallback):

```sh
npm run build
npm publish --access public
```

## Notes

- Uses Wikimedia Commons API via MediaWiki action API (`generator=search` + `prop=imageinfo`).
- No API key required, but set a descriptive `MCP_USER_AGENT` env var in production.
- Respects Wikimedia API etiquette; avoid abusive parallel queries.
- Output order is made deterministic-ish by stable sorting on title.

## License

MIT
