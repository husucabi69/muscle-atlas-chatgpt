// Claude Original Classroom original-HTML relative media route.
// Cloudflare Pages Preview: bind private R2 bucket as CLAUDE_MEDIA_R2.
// No public bucket or credentials; only manifest-listed objects are readable.
const MANIFEST_PATH = '/data/claude-library-manifest-v1.json';
const KEY_PREFIX = '2_음성/';

function objectKey(params) {
  const raw = params?.path;
  const parts = Array.isArray(raw) ? raw : typeof raw === 'string' ? raw.split('/') : [];
  if (!parts.length) return null;
  const safe = [];
  for (const part of parts) {
    let value;
    try { value = decodeURIComponent(part); } catch { return null; }
    if (!value || value === '.' || value === '..' || /[/\\\x00-\x1f\x7f]/.test(value)) return null;
    safe.push(value);
  }
  const key = KEY_PREFIX + safe.join('/');
  return key.endsWith('.mp4') ? key : null;
}

async function allowedMedia(context, key) {
  const manifestUrl = new URL(MANIFEST_PATH, context.request.url);
  const response = await context.env.ASSETS.fetch(new Request(manifestUrl));
  if (!response.ok) return false;
  const data = await response.json();
  return Array.isArray(data?.lectures) && data.lectures.some(row =>
    row?.r2_object_key === key ||
    (Array.isArray(row?.r2_object_keys) && row.r2_object_keys.includes(key))
  );
}

function requestedRange(header, size) {
  if (!header) return { requested: false };
  const match = /^bytes=(\d*)-(\d*)$/.exec(header.trim());
  if (!match || (!match[1] && !match[2]) || size < 1) return { invalid: true };
  let start, end;
  if (!match[1]) {
    const suffix = Number(match[2]);
    if (!Number.isSafeInteger(suffix) || suffix < 1) return { invalid: true };
    start = Math.max(0, size - suffix);
    end = size - 1;
  } else {
    start = Number(match[1]);
    end = match[2] === '' ? size - 1 : Math.min(size - 1, Number(match[2]));
    if (!Number.isSafeInteger(start) || !Number.isSafeInteger(end) || start >= size || end < start) return { invalid: true };
  }
  return { requested: true, start, end, length: end - start + 1 };
}

export async function onRequest(context) {
  const method = context.request.method.toUpperCase();
  if (method !== 'GET' && method !== 'HEAD') {
    return new Response('Method Not Allowed', { status: 405, headers: { Allow: 'GET, HEAD' } });
  }
  const key = objectKey(context.params);
  if (!key) return new Response('Not Found', { status: 404 });
  if (!context.env?.ASSETS?.fetch) return new Response('Media manifest unavailable', { status: 503 });
  try {
    if (!(await allowedMedia(context, key))) return new Response('Not Found', { status: 404 });
    const bucket = context.env?.CLAUDE_MEDIA_R2;
    if (!bucket?.head || !bucket?.get) {
      return new Response('Audio storage not connected', { status: 503, headers: { 'Cache-Control': 'no-store' } });
    }
    const meta = await bucket.head(key);
    if (!meta) return new Response('Audio not uploaded', { status: 404, headers: { 'Cache-Control': 'no-store' } });
    const rangeHeader = context.request.headers.get('range');
    const ifRange = context.request.headers.get('if-range');
    const range = requestedRange(!ifRange || ifRange === meta.httpEtag ? rangeHeader : null, meta.size);
    const headers = new Headers({
      'Content-Type': 'audio/mp4',
      'Accept-Ranges': 'bytes',
      'Cache-Control': 'public, max-age=60',
      'X-Content-Type-Options': 'nosniff'
    });
    if (meta.httpEtag) headers.set('ETag', meta.httpEtag);
    if (range.invalid) {
      headers.set('Content-Range', 'bytes */' + meta.size);
      return new Response(null, { status: 416, headers });
    }
    const status = range.requested ? 206 : 200;
    headers.set('Content-Length', String(range.requested ? range.length : meta.size));
    if (range.requested) headers.set('Content-Range', 'bytes ' + range.start + '-' + range.end + '/' + meta.size);
    if (method === 'HEAD') return new Response(null, { status, headers });
    const item = await bucket.get(key, range.requested ? { range: { offset: range.start, length: range.length } } : {});
    if (!item?.body) return new Response('Audio unavailable', { status: 503, headers: { 'Cache-Control': 'no-store' } });
    return new Response(item.body, { status, headers });
  } catch {
    return new Response('Audio service temporarily unavailable', { status: 502, headers: { 'Cache-Control': 'no-store' } });
  }
}
