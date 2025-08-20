#!/usr/bin/env node
import { searchCommons } from './commons.js';
function showHelp() {
    console.log(`
Commons MCP CLI - Search Wikimedia Commons for images

Usage: commons-mcp-cli [options]

Options:
  -q, --query <query>    Search query (required)
  -l, --limit <number>   Number of results (default: 5, max: 50)
  -h, --help            Show this help message

Examples:
  commons-mcp-cli --query "red panda" --limit 3
  commons-mcp-cli -q "sunset" -l 10
`);
}
async function run() {
    const args = process.argv.slice(2);
    let query = '';
    let limit = 5;
    // Show help if no arguments or help flag
    if (args.length === 0 || args.includes('-h') || args.includes('--help')) {
        showHelp();
        process.exit(0);
    }
    for (let i = 0; i < args.length; i++) {
        const a = args[i];
        if ((a === '-q' || a === '--q' || a === '--query') && args[i + 1]) {
            query = args[++i];
        }
        else if ((a === '-l' || a === '--limit') && args[i + 1]) {
            const limitInput = Number(args[++i]);
            if (isNaN(limitInput) || limitInput < 1 || limitInput > 50) {
                console.error('Error: Limit must be a number between 1 and 50');
                process.exit(2);
            }
            limit = limitInput;
        }
    }
    if (!query) {
        console.error('Error: Query is required\n');
        showHelp();
        process.exit(2);
    }
    try {
        console.log(`Searching for "${query}" (limit: ${limit})...\n`);
        const res = await searchCommons(query, { limit });
        if (res.length === 0) {
            console.log('No results found.');
            return;
        }
        console.log(`Found ${res.length} result(s):\n`);
        for (const [index, r] of res.entries()) {
            console.log(`${index + 1}. ${r.title}`);
            console.log(`   Description: ${r.description}`);
            console.log(`   Image URL: ${r.imageUrl}`);
            console.log(`   Page URL: ${r.pageUrl}`);
            if (r.author)
                console.log(`   Author: ${r.author}`);
            if (r.license)
                console.log(`   License: ${r.license}`);
            console.log();
        }
    }
    catch (error) {
        console.error('Error searching Commons:', error instanceof Error ? error.message : error);
        process.exit(1);
    }
}
run().catch((e) => {
    console.error('Unexpected error:', e);
    process.exit(1);
});
//# sourceMappingURL=cli.js.map