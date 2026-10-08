// Live Cloudflare Pages probe: prove that original HTML's MP4 relative path
// routes to the private R2 Pages Function, without requiring bucket credentials.
import fs from 'node:fs';
const manifest = JSON.parse(fs.readFileSync('data/claude-library-manifest-v1.json', 'utf8'));
const pilot = manifest.lectures.find(row => row.number === 28);
if (!pilot?.r2_object_key) throw new Error('Missing pilot media object key');
const base = process.argv[2] || 'https://preview-development.muscle-atlas-chatgpt.pages.dev';
const url = new URL('/claude-library/' + pilot.r2_object_key, base);
const res = await fetch(url, {
  headers: { Range: 'bytes=0-1023' },
  cache: 'no-store',
  redirect: 'manual',
  signal: AbortSignal.timeout(15000)
});
const text = res.status === 206 ? '' : (await res.text()).slice(0,300);
const fail = reason => {
  console.error('FAIL | Live Claude media proxy | ' + reason + ' | HTTP ' + res.status + ' | ' + url.origin);
  process.exitCode = 1;
};
if (res.status === 503 && /Audio storage not connected/.test(text) &&
    pilot.hosting_status === 'SELF_HOSTED_HTML_MEDIA_PENDING') {
  console.log('PASS | Live Pages Function route exists; private R2 binding not yet connected (correctly pending)');
} else if (res.status === 404 && /Audio not uploaded/.test(text) &&
           pilot.hosting_status === 'SELF_HOSTED_HTML_MEDIA_PENDING') {
  console.log('PASS | Live Pages Function route exists; MP4 object not yet uploaded (correctly pending)');
} else if (res.status === 206 &&
           res.headers.get('content-range') === 'bytes 0-1023/' + pilot.audio_bytes &&
           Number(res.headers.get('content-length')) === 1024) {
  console.log('PASS | Live R2 audio byte-range route verified (source SHA-256 still needs independent upload verification)');
} else {
  fail('Unexpected route, missing Function, incorrect Range or media status: ' + text.replace(/\\s+/g, ' ').slice(0,160));
}
