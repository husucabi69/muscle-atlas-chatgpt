#!/usr/bin/env node
/** Preview PWA regression: 205-muscle QA page and module must survive offline. */
import {strict as assert} from 'node:assert';
import {readFileSync} from 'node:fs';
import {dirname,resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const sw=readFileSync(resolve(root,'sw.js'),'utf8');
const ver=readFileSync(resolve(root,'app-version.js'),'utf8');
for(const path of [
 './anatomy-coverage.html',
 './src/anatomy/canonical-muscle-resolver.mjs',
 './data/muscles-v1.json',
 './data/m184-m205-recovery-inventory-v1.json',
 './data/knowledge-core-v1.json'
])assert(sw.includes("'"+path+"'"),'not in offline CORE: '+path);
assert(sw.includes("isAnatomyCoverage?'./anatomy-coverage.html':'./index.html'"),'wrong offline navigation fallback');
assert(sw.includes("(?:js|mjs|css)"),'module files not network-first');
const patch=JSON.parse(readFileSync(resolve(root,'data/clinical-safety-patch-manifest-20261115.json'),'utf8'));
const cacheKey=ver.match(/cacheKey:'([^']+)'/)?.[1];
const displayVersion=ver.match(/displayVersion:'([^']+)'/)?.[1];
assert.equal(displayVersion,patch.preview_app_version,'version must match safety patch');
assert(/^2026\d{4}-[a-z0-9-]+-preview$/.test(cacheKey||''),'release must use a rotated preview cache key');
assert.equal(cacheKey,'20261115-galaxy-compact-nav-preview','cache key must match reviewed release');
assert.equal(displayVersion,'v12.79-preview','latest reviewed preview version missing');
console.log(JSON.stringify({test:'anatomy-pwa-cache-gate',status:'PASS',preview_only:true}));
