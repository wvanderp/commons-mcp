# Commons MCP

[![CI](https://github.com/wvanderp/commons-mcp/actions/workflows/ci.yml/badge.svg)](https://github.com/wvanderp/commons-mcp/actions/workflows/ci.yml)
[![npm version](https://badge.fury.io/js/commons-mcp.svg)](https://badge.fury.io/js/commons-mcp)

A Model Context Protocol (MCP) server that lets any LLM search for Wikimedia Commons photos by keywords.

- **Stack**: Node.js + TypeScript
- **Interface**: MCP server with a single tool: `search_commons`
- **Output**: Structured results with image URLs, descriptions, and metadata
- **Integration**: Works with VS Code MCP extension and other MCP clients

## Features

- 🖼️ Search Wikimedia Commons for images by keywords
- 📝 Get structured metadata including titles, descriptions, and licensing info
- 🔍 Configurable result limits (1-50 images)
- 🌐 No API key required - uses public MediaWiki API
- 🛡️ Type-safe TypeScript implementation
- 🧪 Comprehensive test coverage
- 📱 CLI tool for quick testing

## Installation

### For Use in MCP Clients

```bash
npm install -g commons-mcp
```

### For Development

```bash
git clone https://github.com/wvanderp/commons-mcp.git
cd commons-mcp
npm install
npm run build
```

## Capabilities

### Tool: `search_commons`

Search Wikimedia Commons for images by keywords.

**Input:**
- `query` (string, required): Search keywords
- `limit` (number, optional): Number of results to return (default: 5, max: 50)

**Output:**
Array of image objects with:
- `title`: Image title
- `description`: Image description  
- `imageUrl`: Direct image URL (1200px max width/height)
- `pageUrl`: Wikimedia Commons page URL
- `author`: Image author (optional)
- `license`: License information (optional)

**Example:**
```json
{
  "title": "File:Red panda (Ailurus fulgens).jpg",
  "description": "A red panda in a tree",
  "imageUrl": "https://upload.wikimedia.org/wikipedia/commons/thumb/f/fe/Red_panda_%28Ailurus_fulgens%29.jpg/1200px-Red_panda_%28Ailurus_fulgens%29.jpg",
  "pageUrl": "https://commons.wikimedia.org/wiki/File:Red_panda_(Ailurus_fulgens).jpg",
  "author": "Photographer Name",
  "license": "CC BY-SA 4.0"
}
```

## Quick Start

### 1. Development Server

```bash
npm run dev
```

### 2. Build and Run

```bash
npm run build
npm start
```

### 3. Test with CLI

```bash
# Built version
node dist/cli.js --q "red panda" --limit 3

# Development version  
npx tsx src/cli.ts --q "red panda" --limit 3
```

### 4. Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm start` - Start built server
- `npm test` - Run test suite
- `npm run lint` - Lint code
- `npm run format` - Format code with Prettier
- `npm run check` - Run all checks (typecheck + lint + test)

## VS Code Integration

Use this MCP server directly in VS Code with the [Model Context Protocol extension](https://marketplace.visualstudio.com/items?itemName=modelcontextprotocol.mcp):

1. **Install the MCP extension** in VS Code
2. **Create or update** `.vscode/mcp.json` in your project:

```jsonc
{
  "servers": {
    "commons-mcp": {
      "type": "stdio", 
      "command": "npx",
      "args": ["commons-mcp"]
    }
  },
  "inputs": []
}
```

3. **Development setup** (if working on this project):

```jsonc
{
  "servers": {
    "commons-mcp-dev": {
      "type": "stdio",
      "command": "tsx", 
      "args": ["watch", "src/index.ts"]
    }
  },
  "inputs": []
}
```

4. **Save and reload** VS Code - the MCP extension will detect the server
5. **Use the tool** in VS Code chat by asking for Wikimedia Commons images

## Testing

Tests use the real Wikimedia Commons API to ensure compatibility. In CI environments without network access, tests may be skipped.

```bash
# Run all tests
npm test

# Run tests with watch mode
npm run test:watch

# Run tests with network access (integration tests)
npm test
```

**Note**: Tests that require network access will fail in sandboxed environments. This is expected and tests should be run in environments with internet connectivity for full validation.

## API Usage

You can also use the search functionality programmatically:

```typescript
import { searchCommons } from 'commons-mcp';

const results = await searchCommons('red panda', { limit: 5 });
console.log(results);
```

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Make your changes
4. Run tests: `npm run check`
5. Commit your changes: `git commit -am 'Add feature'`
6. Push to the branch: `git push origin feature-name`
7. Submit a pull request

### Development Guidelines

- **Code Quality**: All code must pass linting (`npm run lint`) and type checking (`npm run typecheck`)
- **Testing**: Add tests for new features and ensure existing tests pass
- **Formatting**: Use Prettier for consistent code formatting (`npm run format`)
- **Documentation**: Update README and code comments for any new features

## Notes

- **API**: Uses Wikimedia Commons API via MediaWiki action API (`generator=search` + `prop=imageinfo`)
- **Rate Limits**: No API key required, but please be respectful of rate limits
- **Content**: Safe for public use - only free/libre content from Wikimedia Commons
- **User Agent**: Follows [Wikimedia API etiquette](https://www.mediawiki.org/wiki/API:Etiquette) with proper User-Agent header

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Related Projects

- [Model Context Protocol](https://modelcontextprotocol.io/) - The protocol this server implements
- [Wikimedia Commons](https://commons.wikimedia.org/) - The image repository this server searches
- [VS Code MCP Extension](https://marketplace.visualstudio.com/items?itemName=modelcontextprotocol.mcp) - VS Code integration for MCP servers
