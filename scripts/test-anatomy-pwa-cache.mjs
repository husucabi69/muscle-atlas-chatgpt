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
assert(ver.includes("20261115-anatomy205-safety-preview"),'cache key not rotated');
assert(ver.includes("v12.78-preview"),'preview version not labeled');
console.log(JSON.stringify({test:'anatomy-pwa-cache-gate',status:'PASS',preview_only:true}));
