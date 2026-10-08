// Cloudflare Pages Advanced Mode entrypoint for the original Claude classroom.
// The project's current static-only build has not activated /functions routes.
// This explicit Worker preserves all existing static/PWA routes via env.ASSETS.
import { onRequest as serveOriginalClaudeMp4 } from './functions/claude-library/2_음성/[[path]].js';

const AUDIO_ROUTE = '/claude-library/2_음성/';

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    let path;
    try { path = decodeURI(url.pathname); }
    catch { return env.ASSETS.fetch(request); }

    if (path.startsWith(AUDIO_ROUTE) && path.toLowerCase().endsWith('.mp4')) {
      const suffix = path.slice(AUDIO_ROUTE.length);
      return serveOriginalClaudeMp4({
        request,
        env,
        params: { path: suffix.split('/') }
      });
    }

    // All other pages, HTML originals, manifest, icons, PWA and images are static.
    return env.ASSETS.fetch(request);
  }
};
