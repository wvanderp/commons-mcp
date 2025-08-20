# Commons MCP

A Model Context Protocol (MCP) server that lets any LLM search for Wikimedia Commons photos by keywords.

- Stack: Node.js + TypeScript
- Interface: MCP server with a single tool: `search_commons`
- Output: description and image URL(s)
- Run standalone first; later integrate with VS Code MCP client.

## Capabilities

Tool: `search_commons`

- Input: `query` (string), optional `limit` (number, default 5)
- Output: array of `{ title, description, imageUrl, pageUrl, author, license }`

## Quick start

1. Install deps
2. Run in dev mode
3. Test via minimal JSON-RPC (or use the included CLI)

See "Try it" below.

## Try it

- Dev server: `npm run dev`
- Build: `npm run build`
- Start (built): `npm start`

CLI helper for quick testing:

```sh
node dist/cli.js --q "red panda" --limit 3
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

## Notes

- Uses Wikimedia Commons API via MediaWiki action API (`generator=search` + `prop=imageinfo`)
- No API key required, but be respectful of rate limits.
- Safe for public use; no nonfree content is hosted here.
