import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { searchCommons as defaultSearchCommons } from './commons.js';
import { fileURLToPath } from 'url';

const searchSchema = z.object({
    query: z.string().min(1, 'query is required'),
    limit: z.number().int().min(1).max(50).optional(),
});

/**
 * Create and configure an McpServer instance.
 * Accepts an optional search function for easier testing/injection.
 */
export function createMcp(searchFn = defaultSearchCommons) {
    const mcp = new McpServer(
        { name: 'commons-mcp', version: '0.1.0' },
        { capabilities: { tools: {} } },
    );

    // Accept the extra parameter that the McpServer expects and
    // ensure the returned `type` is a literal so it matches the union type.
    const handler = async (
        args: { query: string; limit?: number },
        _extra?: unknown,
    ) => {
        const results = await searchFn(args.query, { limit: args.limit });
        const text = results
            .map(
                (r, i) =>
                    `#${i + 1} ${r.title}\n${r.description}\nImage: ${r.imageUrl}\nPage: ${r.pageUrl}`,
            )
            .join('\n\n');

        // Cast to unknown to satisfy the library's broad return type.
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
        } as unknown) as Record<string, unknown>;
    };

    // Cast mcp to any to avoid strict SDK overload type conflicts.
    (mcp as any).tool(
        'search_commons',
        'Search Wikimedia Commons for images by keywords. Returns description and image URL(s).',
        searchSchema.shape,
        handler,
    );

    return { mcp, handlers: { search_commons: handler } };
}

export async function main() {
    const { mcp } = createMcp();
    const transport = new StdioServerTransport();
    await mcp.connect(transport);
}

// Only run main when this file is executed directly (not imported)
if (process.argv[1] === fileURLToPath(new URL(import.meta.url))) {
    main().catch(() => process.exit(1));
}
