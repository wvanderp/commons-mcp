#!/usr/bin/env node
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { searchCommons } from './commons.js';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const pkg = JSON.parse(readFileSync(join(__dirname, '..', 'package.json'), 'utf8'));

// --- Schemas ---
const inputSchema = {
  query: z.string().min(1, 'query must be a non-empty string')
    .describe('Required. Keywords to search on Wikimedia Commons.'),
  limit: z.number().int().min(1).max(50)
    .describe('Optional. Max results to return (1–50). Default: 10.')
    .optional(),
} as const;

const CommonsResult = z.object({
  title: z.string(),
  description: z.string().optional(),
  imageUrl: z.string().url(),
  pageUrl: z.string().url(),
});

const outputSchema = {
  results: z.array(CommonsResult),
} as const;

export async function main() {
  const mcp = new McpServer({ name: 'commons-mcp', version: pkg.version });

  mcp.registerTool(
    'search_commons',
    {
      title: 'Search Wikimedia Commons',
      description:
        'Search Wikimedia Commons for images by keywords. ' +
        'ALWAYS include "query". Example: { "query": "Nederlands scouting kampvuur", "limit": 5 }',
      inputSchema,
      outputSchema,
    },
    async (args) => {
      const query = args.query?.trim();
      const limit = args.limit;

      if (!query) {
        const usage = 'Usage: { "query": "<keywords>", "limit"?: number }. ' +
          'Example: { "query": "Rotterdam harbor lights", "limit": 5 }';
        return {
          isError: true,
          content: [{ type: 'text', text: `Missing "query". ${usage}` }],
        };
      }

      try {
        const results = await searchCommons(query, { limit });

        const text = results.map((r, i) =>
          `#${i + 1} ${r.title}\n${r.description ?? ''}\nImage: ${r.imageUrl}\nPage: ${r.pageUrl}`
        ).join('\n\n');

        const validated = z.object(outputSchema).parse({ results });

        return {
          content: [{ type: 'text', text }],
          structuredContent: validated,
        };
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        return {
          isError: true,
          content: [{ type: 'text', text: `search_commons failed: ${message}` }],
        };
      }
    }
  );

  const transport = new StdioServerTransport();
  await mcp.connect(transport);
}

main().catch((e) => {
  console.error('[commons-mcp] Fatal error:', e);
  process.exit(1);
});
