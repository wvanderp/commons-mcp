#!/usr/bin/env node
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { searchCommons } from './commons.js';
import pkg from '../package.json' assert { type: 'json' };

const searchSchema = z.object({
    query: z.string().min(1, 'query is required'),
    limit: z.number().int().min(1).max(50).optional(),
});


export async function main() {
    const mcp = new McpServer(
        { name: 'commons-mcp', version: pkg.version },
    );

    mcp.tool(
        'search_commons',
        'Search Wikimedia Commons for images by keywords. Returns description and image URL(s).',
        searchSchema.shape,
        async (
            args,
            _extra
        ) => {
            const results = await searchCommons(args.query, { limit: args.limit });
            const text = results
                .map(
                    (r, i) =>
                        `#${i + 1} ${r.title}\n${r.description}\nImage: ${r.imageUrl}\nPage: ${r.pageUrl}`,
                )
                .join('\n\n');

            return ({
                structuredContent: {
                    results,
                },
                content: [
                    {
                        type: 'text' as const,
                        text,
                    },
                ],
            });
        }
    );

    const transport = new StdioServerTransport();
    await mcp.connect(transport);
}

main();
