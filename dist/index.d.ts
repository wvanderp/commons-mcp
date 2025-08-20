import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { searchCommons as defaultSearchCommons } from './commons.js';
/**
 * Create and configure an McpServer instance.
 * Accepts an optional search function for easier testing/injection.
 */
export declare function createMcp(searchFn?: typeof defaultSearchCommons): {
    mcp: McpServer;
    handlers: {
        search_commons: (args: {
            query: string;
            limit?: number;
        }, _extra?: unknown) => Promise<Record<string, unknown>>;
    };
};
export declare function main(): Promise<void>;
