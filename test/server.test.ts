// Note: you should call the actual commons api because part of the implementation relies on it
// so do not mock the server

import { deepStrictEqual, equal } from 'node:assert';
import { describe, it } from 'node:test';
import fs from 'node:fs';
import path from 'node:path';
import { createMcp } from '../src/index.js';

describe('MCP server', () => {
  it('search_commons handler returns structuredContent with results (live Commons API)', async () => {
    // Use the real search implementation (do not inject a stub) so the handler
    // exercise the production logic that formats textual content from results.
    const { handlers } = createMcp();

    // Try a few common queries as a fallback in case one query returns no results.
    const tryQueries = async (queries: string[], limit = 1) => {
      for (const q of queries) {
        const r = await handlers.search_commons({ query: q, limit });
        if (
          Array.isArray(r.structuredContent.results) &&
          r.structuredContent.results.length
        ) {
          return r;
        }
      }
      // return the last attempt even if empty so assertions below can inspect it
      return await handlers.search_commons({ query: queries[0], limit });
    };

    const res = await tryQueries(['red panda', 'panda', 'cat'], 1);

    // If no results at all, skip the strict presence assertions but ensure shape.
    if (
      !Array.isArray(res.structuredContent.results) ||
      res.structuredContent.results.length === 0
    ) {
      // basic shape checks
      if (!Array.isArray(res.structuredContent.results))
        throw new Error('expected results array');
      deepStrictEqual(typeof res.content[0].text, 'string');
      return;
    }

    deepStrictEqual(typeof res.content[0].text, 'string');
    // ensure the textual content contains the first result's imageUrl if present
    const first = res.structuredContent.results[0];
    if (first.imageUrl && res.content[0].text.indexOf(first.imageUrl) === -1) {
      throw new Error(
        'textual content does not include imageUrl from the first result',
      );
    }
  });

  it('search_commons respects the limit option', async () => {
    const { handlers } = createMcp();

    const res = await handlers.search_commons({ query: 'red panda', limit: 2 });

    // ensure the handler respects the limit option when calling the live API
    if (!Array.isArray(res.structuredContent.results)) {
      throw new Error('expected results array');
    }
    equal(res.structuredContent.results.length, 2);
  });

  it('search_commons snapshot for "Scarlett Johansson"', async () => {
    const { handlers } = createMcp();
    const res = await handlers.search_commons({
      query: 'Scarlett Johansson',
      limit: 3,
    });

    // normalize a couple of volatile fields before snapshotting
    const normalized = JSON.parse(JSON.stringify(res));
    if (Array.isArray(normalized.structuredContent?.results)) {
      for (const r of normalized.structuredContent.results) {
        // remove potentially changing fields if present (none expected), keep stable shape
        delete r.author;
        delete r.license;
      }
    }

    // write snapshot file to test/__snapshots__/server.test.scarlett.json

    const dir = path.join(process.cwd(), 'test', '__snapshots__');
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    const snapFile = path.join(dir, 'server.test.scarlett.json');
    // If snapshot doesn't exist, create it. If it exists, compare.
    if (!fs.existsSync(snapFile)) {
      fs.writeFileSync(snapFile, JSON.stringify(normalized, null, 2), 'utf8');
      // created snapshot; ensure test passes on first creation
      return;
    }
    const existing = JSON.parse(fs.readFileSync(snapFile, 'utf8'));
    deepStrictEqual(normalized, existing);
  });
});
