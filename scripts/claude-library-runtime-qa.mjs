import fs from 'node:fs';
import crypto from 'node:crypto';

const json=p=>JSON.parse(fs.readFileSync(p,'utf8'));
const read=p=>fs.readFileSync(p);
const manifest=json('data/claude-library-manifest-v1.json');
const failures=[],passes=[];
const check=(name,ok,detail='')=>{(ok?passes:failures).push({name,detail});console.log(`${ok?'PASS':'FAIL'} | ${name}${detail?' | '+detail:''}`)};

const rows=manifest.lectures||[];
const disease=rows.filter(x=>x.series==='질환·외상');
const evidence=rows.filter(x=>x.series==='근거 업데이트');
const withAudio=rows.filter(x=>x.audio!=='없음');

check('Claude library manifest baseline >= 76 lectures',rows.length>=76,String(rows.length));
check('Claude Disease/Trauma baseline >= 24 lectures',disease.length>=24,String(disease.length));
check('Claude evidence updates baseline >= 2 lectures',evidence.length>=2,String(evidence.length));
check('Claude audio-labelled baseline >= 67',withAudio.length>=67,String(withAudio.length));
check('Claude lecture numbers unique',new Set(rows.map(x=>x.number)).size===rows.length);
check('Claude source paths unique',new Set(rows.map(x=>x.source_path)).size===rows.length);
check('Claude Artifact fallback URLs valid',rows.every(x=>/^https:\/\/claude\.ai\/artifact\/[A-Za-z0-9_-]+$/.test(x.claude_artifact_url||'')));
check('Drive is source-of-truth, not runtime dependency',manifest.runtime_policy?.drive==='SOURCE_OF_TRUTH_NOT_RUNTIME_DEPENDENCY');
check('Original HTML self-host policy locked',manifest.runtime_policy?.html==='SELF_HOSTED_ORIGINAL_BYTE_PRESERVING');
check('Large media R2 policy locked',String(manifest.runtime_policy?.media||'').startsWith('CLOUDFLARE_R2'));
check('Native summary user-facing deprecated',manifest.runtime_policy?.native_summary_ui==='DEPRECATED_USER_FACING');

const pilot=rows.find(x=>x.number===28);
const pilotPath='claude-library/'+pilot?.source_path;
check('Pilot row 28 is Shoulder Disease',pilot?.title==='질환외상 01권 어깨 질환',pilot?.title||'');
check('Pilot HTML exists',!!pilot&&fs.existsSync(pilotPath),pilotPath);
if(pilot&&fs.existsSync(pilotPath)){
  const bytes=read(pilotPath),hash=crypto.createHash('sha256').update(bytes).digest('hex'),text=bytes.toString('utf8');
  check('Pilot original HTML bytes locked',bytes.length===366718,String(bytes.length));
  check('Pilot original HTML SHA-256 locked',hash===pilot.source_sha256,hash);
  check('Pilot keeps original relative MP4 reference',text.includes('../../2_음성/03_질환외상/클로드_질환외상_01권_어깨_질환.mp4'));
  check('Pilot keeps Claude fallback URL',text.includes('https://claude.ai/artifact/SGzig6jhFXL2Q6rtrwyyGh'));
}
check('Pilot audio source identity locked',pilot?.audio_drive_file_id==='1sP66rCVNFCdfZB0IswULPsVGyk-ap0Ev'&&pilot?.audio_sha256==='2662e3f37daf7daef28c97b1141f18489baf64ad2c82a4bc5a1c79a87eae3538'&&pilot?.audio_bytes===14629413);
check('Pilot audio is fail-closed pending R2',pilot?.hosting_status==='SELF_HOSTED_HTML_MEDIA_PENDING'&&manifest.media?.status==='R2_WRITE_PATH_PENDING'&&manifest.media?.public_base_url===null);

// All currently self-hosted originals (and all future synced originals) must
// preserve exact source bytes and the original audio/player relative URLs.
const hosted=rows.filter(x=>String(x.hosting_status||'').startsWith('SELF_HOSTED_'));
check('Self-hosted Claude original count >= 3',hosted.length>=3,String(hosted.length));
check('Lecture hosting statuses are known',rows.every(x=>['SOURCE_VERIFIED_SYNC_PENDING','SELF_HOSTED_HTML_MEDIA_PENDING','SELF_HOSTED_HTML_MEDIA_READY'].includes(x.hosting_status)));
for(const row of hosted){
  const label='Claude original '+row.number;
  const safe=typeof row.source_path==='string'&&row.source_path.startsWith('1_강의페이지/')&&!row.source_path.split('/').includes('..');
  check(label+' path safe',safe);
  const file='claude-library/'+row.source_path;
  check(label+' self-hosted HTML file exists',safe&&fs.existsSync(file),file);
  if(!safe||!fs.existsSync(file))continue;
  const bytes=read(file),body=bytes.toString('utf8');
  check(label+' Drive HTML byte identity',Number.isSafeInteger(row.source_bytes)&&bytes.length===row.source_bytes,String(bytes.length));
  check(label+' Drive HTML SHA256 integrity',/^[0-9a-f]{64}$/.test(row.source_sha256||'')&&crypto.createHash('sha256').update(bytes).digest('hex')===row.source_sha256);
  check(label+' preserves original Artifact fallback',body.includes(row.claude_artifact_url));
  if(row.audio!=='없음'){
    check(label+' preserves original R2 logical MP4 path',typeof row.r2_object_key==='string'&&
      row.r2_object_key.startsWith('2_음성/')&&body.includes('../../'+row.r2_object_key));
  }
  if(row.hosting_status==='SELF_HOSTED_HTML_MEDIA_READY'){
    check(label+' audio READY requires source identity',row.audio==='없음'||(
      Number.isSafeInteger(row.audio_bytes)&&row.audio_bytes>0&&/^[0-9a-f]{64}$/.test(row.audio_sha256||'')&&
      typeof row.audio_drive_file_id==='string'&&row.audio_drive_file_id.length>12));
  }
}
const trauma=rows.find(x=>x.number===29);
check('Shoulder Trauma exact source lock',trauma?.source_drive_file_id==='1_LgGCYaJGL_jBQZPHo8hQwwEizzZ5ptD'&&
  trauma?.source_bytes===604766&&trauma?.source_sha256==='e8b5b8dce8a1ebfb7c02cf62495515787f10597e83fd5c2ac28747ec6488d4b1');
check('Shoulder Trauma MP4 source not falsely verified',trauma?.hosting_status==='SELF_HOSTED_HTML_MEDIA_PENDING'&&
  trauma?.audio_source_verification==='DRIVE_MP4_IDENTITY_PENDING'&&!trauma.audio_sha256&&!trauma.audio_bytes);
const elbow=rows.find(x=>x.number===30);
check('Elbow Disease exact source lock',elbow?.source_drive_file_id==='1RPvoJe6Mga8OslVutO7CU1BWR8xr2xvM'&&
  elbow?.source_bytes===398461&&elbow?.source_sha256==='b36ffb364a763f25d5055be3bfb211029183637dfc0bc904204fd1b50a86164d');
check('Elbow Disease MP4 source not falsely verified',elbow?.hosting_status==='SELF_HOSTED_HTML_MEDIA_PENDING'&&
  elbow?.audio_source_verification==='DRIVE_MP4_IDENTITY_PENDING'&&!elbow.audio_sha256&&!elbow.audio_bytes);
check('No Cloudflare R2 object keys collide',new Set(rows.filter(x=>x.r2_object_key).map(x=>x.r2_object_key)).size===rows.filter(x=>x.r2_object_key).length);

console.log(`SUMMARY | ${passes.length}/${passes.length+failures.length} PASS`);
if(failures.length){console.error(JSON.stringify(failures,null,2));process.exit(1);}
