#!/usr/bin/env node
/** Syntax + source contract for the standalone Galaxy anatomy coverage page. */
import {strict as assert} from 'node:assert';
import {readFileSync,writeFileSync,mkdtempSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join,dirname,resolve} from 'node:path';
import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const html=readFileSync(resolve(root,'anatomy-coverage.html'),'utf8');
const main=readFileSync(resolve(root,'index.html'),'utf8');
const script=html.match(/<script type="module">([\s\S]*?)<\/script>/);
assert(script,'coverage module script missing');
assert(main.includes('href="./anatomy-coverage.html"'),'main link missing');
assert(script[1].includes('resolveMuscleAtlasFromKnowledgeCore(core)'),'actual runtime source must be preferred');
assert(script[1].includes("source='예비 데이터"),'fallback source disclosure missing');
assert(script[1].includes('textContent'),'safe text rendering missing');
assert(script[1].includes("value=\"held\"")===false,'filter must be in HTML, not injected in JS');
assert(html.includes('value="held"'),'MMT hold filter missing');
const temp=mkdtempSync(join(tmpdir(),'lysos-anatomy-'));
try{
 const file=join(temp,'coverage.mjs');
 writeFileSync(file,script[1]);
 const checked=spawnSync(process.execPath,['--check',file],{encoding:'utf8'});
 assert.equal(checked.status,0,'coverage JS syntax error: '+checked.stderr);
}finally{rmSync(temp,{recursive:true,force:true})}
console.log(JSON.stringify({test:'anatomy-coverage-page',status:'PASS',source:'knowledge-core-first',filter:'mmt-hold'}));
