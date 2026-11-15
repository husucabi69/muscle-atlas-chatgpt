#!/usr/bin/env node
/** Read-only canonical muscle coverage audit; no dependencies. */
import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const muscles=JSON.parse(readFileSync(resolve(root,'data/muscles-v1.json'),'utf8'));
const expected=205;
const auditText=readFileSync(resolve(root,'docs/CLAUDE_186_AUDIT.md'),'utf8');
const auditedIds=[...auditText.matchAll(/m(18[4-9]|19\\d|20[0-5])\\b/g)].map(m=>'m'+m[1]);
const auditedRoster=[...new Set(auditedIds)];
const ids=muscles.map(m=>m.id);
const counts=new Map();
for(const id of ids)counts.set(id,(counts.get(id)||0)+1);
const duplicates=[...counts].filter(([,n])=>n>1).map(([id])=>id);
const expectedIds=Array.from({length:expected},(_,i)=>'m'+String(i+1).padStart(3,'0'));
const missing=expectedIds.filter(id=>!counts.has(id));
const unexpected=ids.filter(id=>!expectedIds.includes(id));
const regions=Object.entries(Object.groupBy?Object.groupBy(muscles,m=>m.region):muscles.reduce((o,m)=>((o[m.region]??=[]).push(m),o),{})).map(([name,items])=>({name,count:items.length}));
const errors=[];
if(duplicates.length)errors.push('duplicate IDs: '+duplicates.join(', '));
if(unexpected.length)errors.push('unexpected IDs: '+unexpected.join(', '));
if(!counts.has('m009'))errors.push('m009 missing');
if(auditedRoster.length!==22)errors.push('historical 22-ID audit roster unreadable or incomplete');
const warnings=[];
if(missing.length)warnings.push('Source-of-truth mismatch: '+missing.length+' IDs absent from data/muscles-v1.json although docs/CLAUDE_186_AUDIT.md reports them integrated; investigate other canonical sources, build or migration before creating records.');
const report={audit:'canonical-muscle-coverage',status:errors.length?'FAIL':warnings.length?'PASS_STRUCTURE_INCOMPLETE_COVERAGE':'PASS_STRUCTURE',expected_count:expected,actual_count:muscles.length,historical_audit_roster_count:auditedRoster.length,historical_roster_missing_from_v1:auditedRoster.filter(id=>!counts.has(id)),first_missing:missing[0]||null,last_missing:missing.at(-1)||null,missing_ids:missing,duplicates,unexpected,regions,errors,warnings};
console.log(JSON.stringify(report,null,2));
if(errors.length)process.exitCode=1;
