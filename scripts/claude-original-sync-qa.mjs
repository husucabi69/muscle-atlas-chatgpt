import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { spawnSync } from 'node:child_process';

const manifest=JSON.parse(fs.readFileSync('data/claude-library-manifest-v1.json','utf8'));
let passes=0;
const run=(args)=>{
 const result=spawnSync(process.execPath,['scripts/sync-claude-original-html.mjs',...args],{encoding:'utf8',timeout:10000});
 return result;
};
const check=(name,ok)=>{
 if(!ok)throw new Error('FAIL | '+name);
 console.log('PASS | '+name);
 passes++;
};
for(const n of [28,29,30,31,32,33]){
 const row=manifest.lectures.find(x=>x.number===n);
 const result=run(['--lecture',String(n),'--source','claude-library/'+row.source_path,'--drive-id',row.source_drive_file_id]);
 if(result.status!==0)console.error('SYNC_DIAGNOSTIC | lecture '+n+' | '+result.stderr.slice(0,1600));
 check('Claude sync dry-run original lecture '+n+' source identity',result.status===0&&
  (()=>{try{const j=JSON.parse(result.stdout);return j.mode==='DRY_RUN'&&j.existing_matches_source===true&&j.source_bytes===row.source_bytes&&j.source_sha256===row.source_sha256&&j.projected_audio_verification===(row.audio_source_verification||null);}catch{return false;}})());
}
const row=manifest.lectures.find(x=>x.number===29);
const tmp=fs.mkdtempSync(path.join(os.tmpdir(),'claude-original-sync-qa-'));
try{
 const wrongName=path.join(tmp,'wrong-filename.html');
 fs.copyFileSync('claude-library/'+row.source_path,wrongName);
 const renamed=run(['--lecture','29','--source',wrongName,'--drive-id',row.source_drive_file_id]);
 check('Claude sync rejects wrong original HTML filename',renamed.status!==0&&/filename differs/i.test(renamed.stderr));
 const broken=path.join(tmp,path.posix.basename(row.source_path));
 const bytes=fs.readFileSync('claude-library/'+row.source_path);
 const changed=Buffer.from(bytes);
 changed[changed.length-2]=changed[changed.length-2]===62?32:62;
 fs.writeFileSync(broken,changed);
 const drift=run(['--lecture','29','--source',broken,'--drive-id',row.source_drive_file_id]);
 check('Claude sync rejects changed original bytes without explicit user review',drift.status!==0);
 const wrongId=run(['--lecture','29','--source','claude-library/'+row.source_path,'--drive-id','1INVALIDSOURCEIDENTITY123']);
 check('Claude sync rejects Drive file identity drift',wrongId.status!==0);
}finally{fs.rmSync(tmp,{recursive:true,force:true});}
console.log('CLAUDE ORIGINAL SYNC QA | '+passes+'/'+passes+' PASS');
