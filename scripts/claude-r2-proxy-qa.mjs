import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const functionFile = path.resolve('functions/claude-library/2_음성/[[path]].js');
assert.ok(fs.existsSync(functionFile), 'Cloudflare Pages R2 function exists');
const source = fs.readFileSync(functionFile, 'utf8');
const { onRequest } = await import('data:text/javascript;base64,' + Buffer.from(source).toString('base64'));
const manifest = JSON.parse(fs.readFileSync('data/claude-library-manifest-v1.json', 'utf8'));
const pilot = manifest.lectures.find(row => row.number === 28);
const key = pilot.r2_object_key;
const rawParts = key.slice('2_음성/'.length).split('/');
const fixture = Uint8Array.from({ length: 32 }, (_, i) => i);
let tests = 0;

function context({ method = 'GET', range, ifRange, parts = rawParts, binding = true, authorized = true, absent = false, manifestError = false } = {}) {
  const calls = { head: 0, get: 0, options: undefined, manifest: 0 };
  const headers = new Headers();
  if (range) headers.set('range', range);
  if (ifRange) headers.set('if-range', ifRange);
  const r2 = {
    async head(name) {
      calls.head += 1;
      assert.equal(name, key);
      return absent ? null : { size: fixture.length, httpEtag: '"fixture-etag"' };
    },
    async get(name, options) {
      calls.get += 1;
      calls.options = options;
      assert.equal(name, key);
      const start = options?.range?.offset ?? 0;
      const length = options?.range?.length ?? fixture.length;
      return { body: new Blob([fixture.slice(start, start + length)]).stream() };
    }
  };
  const env = {
    ASSETS: {
      async fetch(request) {
        calls.manifest += 1;
        assert.equal(new URL(request.url).pathname, '/data/claude-library-manifest-v1.json');
        if (manifestError) return new Response('unavailable', { status: 503 });
        return Response.json({ lectures: authorized ? [pilot] : [] });
      }
    }
  };
  if (binding) env.CLAUDE_MEDIA_R2 = r2;
  const ctx = {
    request: new Request('https://preview.example/claude-library/2_%EC%9D%8C%EC%84%B1/03_.../file.mp4', { method, headers }),
    params: { path: parts },
    env
  };
  return { ctx, calls };
}
async function test(name, fn) {
  await fn();
  tests += 1;
  console.log('PASS | ' + name);
}
await test('Original HTML relative path maps to manifest R2 key', () => {
  const html = fs.readFileSync('claude-library/' + pilot.source_path, 'utf8');
  assert.ok(html.includes('../../' + key));
});
await test('Unbound R2 fails closed with 503 (no falsely ready audio)', async () => {
  const x = context({ binding: false });
  const res = await onRequest(x.ctx);
  assert.equal(res.status, 503);
  assert.equal(x.calls.head, 0);
});
await test('Manifest whitelist denies unspecified object', async () => {
  const x = context({ authorized: false });
  const res = await onRequest(x.ctx);
  assert.equal(res.status, 404);
  assert.equal(x.calls.head, 0);
});
await test('Full GET streams MP4 and accurate length', async () => {
  const x = context();
  const res = await onRequest(x.ctx);
  assert.equal(res.status, 200);
  assert.equal(res.headers.get('content-length'), '32');
  assert.equal(res.headers.get('content-type'), 'audio/mp4');
  assert.equal(res.headers.get('accept-ranges'), 'bytes');
  assert.deepEqual([...new Uint8Array(await res.arrayBuffer())], [...fixture]);
  assert.equal(x.calls.get, 1);
});
await test('Partial seek GET returns 206 / Content-Range / exact bytes', async () => {
  const x = context({ range: 'bytes=5-11' });
  const res = await onRequest(x.ctx);
  assert.equal(res.status, 206);
  assert.equal(res.headers.get('content-range'), 'bytes 5-11/32');
  assert.equal(res.headers.get('content-length'), '7');
  assert.deepEqual([...new Uint8Array(await res.arrayBuffer())], [...fixture.slice(5, 12)]);
  assert.deepEqual(x.calls.options, { range: { offset: 5, length: 7 } });
});
await test('Open-ended and suffix seek ranges work', async () => {
  for (const [header, expected] of [['bytes=29-', 'bytes 29-31/32'], ['bytes=-2', 'bytes 30-31/32']]) {
    const x = context({ range: header });
    const res = await onRequest(x.ctx);
    assert.equal(res.status, 206);
    assert.equal(res.headers.get('content-range'), expected);
    assert.equal((await res.arrayBuffer()).byteLength, header === 'bytes=-2' ? 2 : 3);
  }
});
await test('Out-of-bounds seek returns 416 instead of wrong audio', async () => {
  const x = context({ range: 'bytes=99-100' });
  const res = await onRequest(x.ctx);
  assert.equal(res.status, 416);
  assert.equal(res.headers.get('content-range'), 'bytes */32');
  assert.equal(x.calls.get, 0);
});
await test('Multiple ranges rejected instead of mismatched Content-Range', async () => {
  const x = context({ range: 'bytes=0-1,4-5' });
  assert.equal((await onRequest(x.ctx)).status, 416);
});
await test('HEAD returns headers only (no R2 object download)', async () => {
  const x = context({ method: 'HEAD', range: 'bytes=0-9' });
  const res = await onRequest(x.ctx);
  assert.equal(res.status, 206);
  assert.equal(res.headers.get('content-length'), '10');
  assert.equal(x.calls.get, 0);
});
await test('If-Range mismatch safely returns complete object', async () => {
  const x = context({ range: 'bytes=0-2', ifRange: '"old-version"' });
  const res = await onRequest(x.ctx);
  assert.equal(res.status, 200);
  assert.equal(res.headers.get('content-length'), '32');
});
await test('Traversal and encoded slash are blocked', async () => {
  for (const parts of [['..', rawParts[1]], ['%2Fetc', rawParts[1]], ['\\evil.mp4']]) {
    const x = context({ parts });
    assert.equal((await onRequest(x.ctx)).status, 404);
    assert.equal(x.calls.manifest, 0);
  }
});
await test('Non-GET/HEAD methods cannot mutate R2', async () => {
  const x = context({ method: 'POST' });
  const res = await onRequest(x.ctx);
  assert.equal(res.status, 405);
  assert.equal(res.headers.get('allow'), 'GET, HEAD');
});
await test('Missing MP4 object stays 404 pending upload', async () => {
  const x = context({ absent: true });
  assert.equal((await onRequest(x.ctx)).status, 404);
  assert.equal(x.calls.get, 0);
});
await test('Manifest errors fail closed', async () => {
  const x = context({ manifestError: true });
  assert.equal((await onRequest(x.ctx)).status, 404);
});
console.log('CLAUDE R2 PROXY QA | ' + tests + '/' + tests + ' PASS');
