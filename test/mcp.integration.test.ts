import { test } from 'node:test';
import assert from 'node:assert/strict';
import { spawn, exec } from 'node:child_process';
import { createInterface } from 'node:readline';

function runCommand(cmd: string, cwd = process.cwd()): Promise<{ stdout: string; stderr: string }> {
  return new Promise((resolve, reject) => {
    exec(cmd, { cwd, env: process.env }, (err, stdout, stderr) => {
      if (err) return reject({ err, stdout, stderr });
      resolve({ stdout, stderr });
    });
  });
}

test('builds server, starts it, and queries search_commons over MCP stdio', async (t) => {
  // 1) Build the project (emit dist/)
  await t.test('build', async () => {
    const res = await runCommand('npm run build', process.cwd());
    // tsc writes no output on success; ensure dist/index.js exists by checking stdout/stderr
    assert.ok(res.stdout !== undefined);
  });

  // 2) Spawn the built server
  const child = spawn(process.execPath, ['dist/index.js'], {
    cwd: process.cwd(),
    stdio: ['pipe', 'pipe', 'pipe'],
  });

  const rl = createInterface({ input: child.stdout, terminal: false });

  const pending = new Map<number, { resolve: (v: unknown) => void; reject: (e: unknown) => void }>();
  let idCounter = 1;

  rl.on('line', (line) => {
    try {
      const msg = JSON.parse(line);
      if (msg.id !== undefined && pending.has(msg.id)) {
        const entry = pending.get(msg.id)!;
        entry.resolve(msg);
        pending.delete(msg.id);
      }
      // ignore notifications for this simple test
    } catch {
      // ignore non-json lines (server should not emit any, but be defensive)
    }
  });

  child.stderr.on('data', (d) => {
    // forward server logs to test stderr for visibility
    process.stderr.write(String(d));
  });

  function sendRequest(method: string, params?: Record<string, unknown>): Promise<unknown> {
    const id = idCounter++;
    const msg = { jsonrpc: '2.0', id, method, params };
    return new Promise((resolve, reject) => {
      pending.set(id, { resolve, reject });
      try {
        child.stdin.write(JSON.stringify(msg) + '\n');
      } catch (err) {
        pending.delete(id);
        reject(err);
      }
    });
  }

  // Send initialize
  const initRes = await sendRequest('initialize', {
    protocolVersion: '2025-06-18',
    capabilities: {},
    clientInfo: { name: 'mcp-integration-test', version: '1.0.0' },
  });

  // debug log the initialize response
  process.stderr.write('INIT RES: ' + JSON.stringify(initRes) + '\n');
  const init = initRes as unknown as Record<string, unknown>;
  const initResult = init.result as Record<string, unknown>;
  const serverInfo = initResult.serverInfo as Record<string, unknown>;
  assert.equal(serverInfo.name, 'commons-mcp');

  // Optionally send notifications/initialized (server has a handler but it's not required)
  child.stdin.write(JSON.stringify({ jsonrpc: '2.0', method: 'notifications/initialized' }) + '\n');

  // Call the search_commons tool
  const callRes = await sendRequest('tools/call', {
    name: 'search_commons',
    arguments: { query: 'red panda', limit: 1 },
  });
  // debug raw call result
  process.stderr.write('CALL RES: ' + JSON.stringify(callRes) + '\n');
  const call = callRes as unknown as Record<string, unknown>;
  assert.ok(call.result, 'expected a result from tools/call');
  // structuredContent.results should be present when the tool returns structured content
  const callResult = call.result as Record<string, unknown>;
  const structured = callResult.structuredContent as Record<string, unknown> | undefined;
  assert.ok(structured, 'expected structuredContent in result');
  assert.ok(Array.isArray(structured.results), 'expected results array');
  assert.ok(structured.results.length <= 1, 'expected at most 1 result');

  // Clean up
  child.kill();
  rl.close();
});
