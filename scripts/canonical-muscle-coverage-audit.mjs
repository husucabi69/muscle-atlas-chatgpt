#!/usr/bin/env node
/** Read-only canonical muscle coverage audit; no dependencies. */
import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const muscles=JSON.parse(readFileSync(resolve(root,'data/muscles-v1.json'),'utf8'));
const expected=205;
const runtime=JSON.parse(readFileSync(resolve(root,'data/knowledge-core-v1.json'),'utf8'));
const runtimeIds=runtime.muscles.map(m=>m.muscle_id);
const runtimeMap=new Map(runtime.muscles.map(m=>[m.muscle_id,m]));
const auditText=readFileSync(resolve(root,'docs/CLAUDE_186_AUDIT.md'),'utf8');
const auditedIds=[...auditText.matchAll(/m(18[4-9]|19\d|20[0-5])\b/g)].map(m=>'m'+m[1]);
const auditedRoster=[...new Set(auditedIds)];
const recovery=JSON.parse(readFileSync(resolve(root,'data/m184-m205-recovery-inventory-v1.json'),'utf8'));
const illustration=JSON.parse(readFileSync(resolve(root,'data/muscle-illustration-audit-v1.json'),'utf8'));
const recoveredIds=recovery.records.map(m=>m.id);
const illustrationById=new Map(illustration.muscles.map(m=>[m.muscle_id,m]));
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
if(runtimeIds.length!==205||new Set(runtimeIds).size!==205)errors.push('runtime Knowledge Core must contain 205 unique IDs');
for(const id of expectedIds){const m=runtimeMap.get(id);if(!m)errors.push('runtime missing '+id);else if(!m.anatomy?.origin?.trim()||!m.anatomy?.insertion?.trim()||!m.anatomy?.function?.trim()||!m.innervation_text?.trim())errors.push('runtime incomplete O/I/F/N '+id);}
if(unexpected.length)errors.push('unexpected IDs: '+unexpected.join(', '));
if(!counts.has('m009'))errors.push('m009 missing');
if(auditedRoster.length!==22)errors.push('historical 22-ID audit roster unreadable or incomplete');
if(recoveredIds.length!==22||new Set(recoveredIds).size!==22)errors.push('recovery inventory must have 22 unique IDs');
for(const id of auditedRoster)if(!recoveredIds.includes(id))errors.push('historical ID missing in recovery inventory: '+id);
for(const m of recovery.records){const src=illustrationById.get(m.id);if(!src||src.name_ko!==m.ko||src.name_en!==m.en)errors.push('recovery name/source mismatch: '+m.id);}
if(recovery.clinical_content_verified!==false)errors.push('recovery inventory must not assert clinical O/I/F/N approval');
const warnings=[];
if(missing.length)warnings.push('Legacy 183-record muscles-v1.json omits '+missing.length+' IDs. Actual runtime Knowledge Core includes all 205; do not treat legacy export as canonical runtime source.');
const report={audit:'canonical-muscle-coverage',status:errors.length?'FAIL':warnings.length?'PASS_STRUCTURE_INCOMPLETE_COVERAGE':'PASS_STRUCTURE',expected_count:expected,actual_count:muscles.length,runtime_knowledge_core_count:runtimeIds.length,runtime_oinf_complete:expectedIds.filter(id=>{const m=runtimeMap.get(id);return m?.anatomy?.origin?.trim()&&m?.anatomy?.insertion?.trim()&&m?.anatomy?.function?.trim()&&m?.innervation_text?.trim()}).length,historical_audit_roster_count:auditedRoster.length,historical_roster_missing_from_v1:auditedRoster.filter(id=>!counts.has(id)),recovery_inventory_count:recoveredIds.length,recovery_inventory_is_not_clinical_master:true,first_missing:missing[0]||null,last_missing:missing.at(-1)||null,missing_ids:missing,duplicates,unexpected,regions,errors,warnings};
console.log(JSON.stringify(report,null,2));
if(errors.length)process.exitCode=1;
