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

check('Claude library manifest = 76 lectures',rows.length===76,String(rows.length));
check('Claude Disease/Trauma = 24 lectures',disease.length===24,String(disease.length));
check('Claude evidence updates = 2 lectures',evidence.length===2,String(evidence.length));
check('Claude audio-labelled lectures = 67',withAudio.length===67,String(withAudio.length));
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

console.log(`SUMMARY | ${passes.length}/${passes.length+failures.length} PASS`);
if(failures.length){console.error(JSON.stringify(failures,null,2));process.exit(1);}
