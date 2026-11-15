#!/usr/bin/env node
/** Static guard for the Galaxy horizontal navigation fix. Does not replace device QA. */
import {readFileSync} from 'node:fs';
import {strict as assert} from 'node:assert';
const html=readFileSync(new URL('../index.html',import.meta.url),'utf8');
const styles=html.slice(html.indexOf('<style>'),html.indexOf('</style>'));
const marker='/* Galaxy compact header: one-line navigation, preserve all tabs and keyboard access. */';
assert.equal(styles.split(marker).length,2,'single compact nav override required');
const override=styles.split(marker)[1];
assert(override.includes('@media(max-width:850px)'),'tablet/mobile breakpoint');
assert(override.includes('@media(max-width:520px)'),'small mobile breakpoint');
for(const pattern of ['overflow-x:auto','flex-wrap:nowrap','white-space:nowrap','writing-mode:horizontal-tb','min-height:44px','focus-visible','scroll-snap-type:x proximity'])assert(override.includes(pattern),'missing navigation safeguard: '+pattern);
assert(override.includes('.tabs{display:flex;grid-template-columns:none'),'small-screen grid must be disabled');
const nav=html.match(/<div class="tabs">([\s\S]*?)<\/div>/);
assert(nav,'navigation markup missing');
const pages=[...nav[1].matchAll(/data-page="([^"]+)"/g)].map(m=>m[1]);
assert.equal(pages.length,10,'must retain ten navigation tabs');
assert.equal(new Set(pages).size,10,'duplicate navigation page');
for(const id of pages)assert(html.includes('id="'+id+'"'),'missing destination '+id);
console.log(JSON.stringify({test:'galaxy-compact-nav',status:'PASS_STATIC',tab_count:pages.length,device_qa:'PENDING'}));
