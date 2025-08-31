# Commons MCP

An installable Model Context Protocol (MCP) server that lets any LLM (or you) search Wikimedia Commons for freely licensed images by keyword.

- Stack: Node.js + TypeScript
- Interface: MCP server (STDIO only) exposing one tool: `search_commons`
- Output: description, image URL, page URL (+ author/license when available)
- Distribution: Published to npm as `commons-mcp`

## Capabilities

Tool: `search_commons`

- Input: `query` (string), optional `limit` (number, default 5)
- Output: array of `{ title, description, imageUrl, pageUrl, author, license }`

## Install

Global (exposes `commons-mcp` commands):

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

### MCP Server (LLM tool integration)

The server speaks ONLY STDIO (JSON‑RPC messages newline‑delimited over stdin/stdout).

Executable entrypoint (installed binary, recommended for VS Code and other clients):


Dev (watch mode without a build step):

```sh
tsx watch src/index.ts
```

Production (after `npm run build`):

```sh
node dist/index.js
```

STDIO guarantees / invariants:

- Stdout: ONLY valid MCP JSON-RPC frames (no logs, banners, or stray whitespace).
- Stderr: All human / diagnostic logging.
- Newline-delimited UTF‑8 JSON; no embedded newlines inside a single frame.
- Process remains in foreground (no daemonization) so pipes stay open.

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

## VS Code Integration (STDIO)

With the VS Code Model Context Protocol extension:

1. Ensure the package is installed (`npm i -g commons-mcp` or project local + use `npx`).
2. Create or edit `.vscode/mcp.json` (this repo already ships an example):

```jsonc
{
    "servers": {
        "commons-mcp": {
            "type": "stdio",
            "command": "commons-mcp-server"
        }
    }
}
```

For local development without a build, you can point to `tsx`:

```jsonc
{
    "servers": {
        "commons-mcp-dev": {
            "type": "stdio",
            "command": "tsx",
            "args": ["watch", "src/index.ts"]
        }
    }
}
```

Reload VS Code or use the MCP extension command to refresh servers. The `search_commons` tool will appear. No `url`, `http`, or `sse` configuration is required (or supported) for this server.

### Removal / Compliance Checklist

All of the following are satisfied:

| Item | Status |
| ---- | ------ |
| No HTTP/SSE/WebSocket listeners or imports | ✅ |
| STDIO transport only (`StdioServerTransport`) | ✅ |
| Foreground process (no detach) | ✅ |
| Stdout strictly MCP frames; logs to stderr | ✅ |
| VS Code config uses `type: "stdio"` only | ✅ |
| No `url` fields in config | ✅ |

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
- No network listeners are opened by this package; all communication is over the invoking process stdio pipes.

## License

MIT
