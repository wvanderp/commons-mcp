#!/usr/bin/env node
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { searchCommons } from './commons.js';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Read package.json at runtime
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const pkg = JSON.parse(readFileSync(join(__dirname, '..', 'package.json'), 'utf8'));

// ---- Schemas ----
// Use raw shapes (ZodRawShape), not z.object(...)
const inputSchema = {
  query: z.string().min(1, 'query is required'),
  limit: z.number().int().min(1).max(50).optional(),
} as const;

const CommonsResult = z.object({
  title: z.string(),
  description: z.string().optional(),
  imageUrl: z.string().url(),
  pageUrl: z.string().url(),
});

// outputSchema must also be a raw shape
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
        'Search Wikimedia Commons for images by keywords. Returns description and image URL(s).',
      inputSchema,
      outputSchema,
    },
    async ({ query, limit }) => {
      try {
        const results = await searchCommons(query, { limit });

        const text = results
          .map(
            (r, i) =>
              `#${i + 1} ${r.title}\n${r.description ?? ''}\nImage: ${r.imageUrl}\nPage: ${r.pageUrl}`,
          )
          .join('\n\n');

        // Optional: validate output before returning (defensive)
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
    },
  );

  const transport = new StdioServerTransport();
  await mcp.connect(transport);
}

main().catch((e) => {
  console.error('[commons-mcp] Fatal error:', e);
  process.exit(1);
});
