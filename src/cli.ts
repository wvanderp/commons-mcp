#!/usr/bin/env node
import { fileURLToPath } from 'url';
import { searchCommons } from './commons.js';

async function run() {
    const args = process.argv.slice(2);
    let query = '';
    let limit = 5;

    for (let i = 0; i < args.length; i++) {
        const a = args[i];
        if ((a === '-q' || a === '--q' || a === '--query') && args[i + 1]) {
            query = args[++i];
        } else if ((a === '-l' || a === '--limit') && args[i + 1]) {
            limit = Number(args[++i]);
        }
    }

    if (!query) {
        console.error('Usage: commons-mcp --q "red panda" [--limit 3]');
        process.exit(2);
    }

    const res = await searchCommons(query, { limit });
    for (const r of res) {
        console.log(`${r.title}\n${r.description}\n${r.imageUrl}\n${r.pageUrl}\n---`);
    }
}

// Only run when this file is executed directly, not when imported.
if (process.argv[1] === fileURLToPath(new URL(import.meta.url))) {
    run().catch((e) => {
        console.error(e);
        process.exit(1);
    });
}
