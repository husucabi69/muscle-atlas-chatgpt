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
check('Self-hosted Claude original count >= 6',hosted.length>=6,String(hosted.length));
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
const elbow=rows.find(x=>x.number===30);
check('Elbow Disease exact source lock',elbow?.source_drive_file_id==='1RPvoJe6Mga8OslVutO7CU1BWR8xr2xvM'&&
  elbow?.source_bytes===398461&&elbow?.source_sha256==='b36ffb364a763f25d5055be3bfb211029183637dfc0bc904204fd1b50a86164d');
const additionalLocked=[
 [31,'1FKnUrTQc8Z4Mb3rC5Br0GFJcJusvwCb7',572548,'890b804c6319860a728bff047a6904f2887d8f563e7bd8fb158bd403b60531a2'],
 [32,'1YyzgbOlfGogsnhie9slvmjzrvs26JioR',508134,'8b55d687e9fd7b17cc59448bfbed09dfb629e45d66e0e741fce97bb4c9d6e012'],
 [33,'1KOjt3F-GaJe4SkWSv8WGKiw7qQnCUrhd',592896,'f78b2f7c9b8dd55b15767951b625bcf631e15b0cb32d13c484accf1dabe94955']
];
for(const [number,driveId,size,digest] of additionalLocked){
 const row=rows.find(x=>x.number===number);
 check('Claude lecture '+number+' source immutable lock',row?.source_drive_file_id===driveId&&
   row?.source_bytes===size&&row?.source_sha256===digest);
}
const lockedAudio=[
 [29,'1hp56nqlgzinLo6-VRyDM_LJfPNkNBd0M',11690224,'24d01731ba8389c87ab0a92f12e7bd97a631d1a1d56f771ef097c52948f3a4cf'],
 [30,'1B99fjUhLEiHoa8we2tYKgvl7vlnr84Tp',17375944,'2b4837f7d6573258b16bc6beae709248fbf0db640dbd8b3f0576d393e2dad52d'],
 [31,'10v9F4VmeygX6lU7poyF8bCZ_kGtrcVQH',12525527,'8ce6fddade476e4bfcb652dc008e15688b703a897e440422744a50a1dc4831d2'],
 [32,'1lNqFsPc9pk_9iFmv5GXu5fr1KQsNp8rA',12662848,'e763f76380ddab687a3e9d44f27c46871084a7f8b182e0e574aea4065cd0a579'],
 [33,'1nkVvQh8yuT-_bwJwKfrg9O-4bfVLAzvd',10877433,'4be0988fbb4277e1811c861c022f8f9d6f746cee5e4a769d4f36fa34828636af']
];
for(const [number,driveId,size,digest] of lockedAudio){
 const row=rows.find(x=>x.number===number);
 check('Claude lecture '+number+' Drive MP4 exact source identity',row?.audio_drive_file_id===driveId&&
   row?.audio_bytes===size&&row?.audio_sha256===digest&&
   row?.audio_source_verification==='DRIVE_MP4_SHA256_VERIFIED');
 check('Claude lecture '+number+' audio still NOT ready on R2',row?.hosting_status==='SELF_HOSTED_HTML_MEDIA_PENDING'&&
   manifest.media?.status==='R2_WRITE_PATH_PENDING');
}
// 2026-10-09 refreshed Drive inventory: 76 prior + 6 rehabilitation + 1 sports.
const inventory=json('data/claude-drive-inventory-v2.json');
check('Fresh Claude Drive inventory has exactly 87 original HTML courses',inventory.lectures?.length===87&&rows.length===87);
check('Fresh Drive inventory represents 10 source HTML folders',inventory.folders?.length===10);
check('New rehabilitation 6 and sports medicine 1 registered',rows.filter(x=>x.series==='재활·운동처방').length===6&&rows.filter(x=>x.series==='스포츠의학').length===5);
check('Drive inventory and app manifest agree on every path/number',
 inventory.lectures?.length===rows.length&&inventory.lectures.every(i=>{
  const row=rows.find(x=>x.number===i.number);
  return row?.source_path===i.source_path&&row?.series===i.series;
 }));
check('Every Drive inventory ID unique',new Set(inventory.lectures.map(x=>x.drive_file_id)).size===87);
const newExactSources=[
 [77,'1wrvJHTIOM1dbGk29gWmiNMdafRfsgC7_',55909,'47afa02a9ef757435dca959ae4543ab598ed1973602391b25195d5d8f036d503'],
 [78,'13IASFEfGCIVtTbcercz8tDxR2rgSIuIe',48539,'184dc1ab95455f8eb45e6781831f762113abb89da034ec0cbb7151d87a45737b'],
 [79,'1qGojcjfMBXRGgPgX10oHZg0gzXecDAEZ',41633,'be3ee6db3e6e24247496ba171e0f657f990c86fe1d27f3b02cc4dc2e58b991b7'],
 [80,'1JtmJ95W_0pBGomW9_7fSsFIrxZpt0MH4',41668,'f1d87ecb1116bb153abe52424d085ea58c1afac6b8dcd9d1bbf8f4fb63091591'],
 [81,'1wNOufa_RUhlr0OytwvLfLlIX-JIkz4RI',42402,'2111e78945e7342d60718fd45a445631b36dea2f09bbbec38e1aaf48e8cd462a'],
 [82,'1KoDgs9uReFDKe4jR5imBpTcE7SKLjCJL',43816,'9a4c9e3f2c51d6ea25ee4711e1785981d161144e9da42cadc844b3e8033a584d'],
 [83,'16fPNwt9JPigk1_RFELsvYoMAKZXSBOrr',35580,'144d62513a4698cbd2d6e412d5aad6c7dd5f0c1ef8eb9c7dae3b4250232788e0']
];
for(const [n,id,bytes,digest] of newExactSources){
 const row=rows.find(x=>x.number===n),entry=inventory.lectures.find(x=>x.number===n);
 check('Claude lecture '+n+' new original source identity locked',row?.source_drive_file_id===id&&
 row?.source_bytes===bytes&&row?.source_sha256===digest&&entry?.drive_file_id===id&&entry?.bytes===bytes);
 check('Claude lecture '+n+' honest unresolved MP4 status',row?.hosting_status==='SELF_HOSTED_HTML_MEDIA_PENDING'&&
 row?.audio_source_verification==='DRIVE_MP4_UNLOCATED'&&!row.audio_sha256&&!row.audio_bytes);
}
check('No Cloudflare R2 object keys collide',new Set(rows.filter(x=>x.r2_object_key).map(x=>x.r2_object_key)).size===rows.filter(x=>x.r2_object_key).length);

console.log(`SUMMARY | ${passes.length}/${passes.length+failures.length} PASS`);
if(failures.length){console.error(JSON.stringify(failures,null,2));process.exit(1);}

// Sports medicine 02–05 are original, byte-preserved Drive HTML files, not title-only links.
const sportsAdded=[
 [84,'1x6gQ2b0dU_-i3g9i5vP4sO3C8SL8cQh2',36866,'0933f7945796eb2eeaf7efefee5cadea0e9ca6c939b0506653d00272bac73d1d','380d5a4262251171193d83090cabdb3c094c0a9a'],
 [85,'1128_4bBJTXeBIuB2YB4fhvlm-MvcmvHS',36183,'02af6c30a0e9f321678253c86664f1f410f7f2de81c421d6d635f2119af94c98','ceca9e22b9941c7623db395cbe7c03db48dec1fc'],
 [86,'1DDEbVdfAECt7CBu2ObJl97hrINZGEXVr',36010,'f36e6c65b74a7bb071c9830a0d244e75d4fbafca67f854fa652c706e465494f0','7a9eafbdce9ed288e987ca129d0b904e871241d3'],
 [87,'1J6v4_yKTIpYSWAByNF98ubHeoUMYb3wc',36102,'0bf1709914d372e2dbfc807202cb7e094b890b6681136f5a0b7206079900c100','b48423f3d603982d38d73ac04f5b762158f755da']
];
for(const [n,id,size,digest,blob] of sportsAdded){
 const row=rows.find(x=>x.number===n),item=inventory.lectures.find(x=>x.number===n);
 check('Claude sports '+n+' source and app route locked',row?.source_drive_file_id===id&&row?.source_bytes===size&&row?.source_sha256===digest&&row?.source_git_blob_sha1===blob&&item?.drive_file_id===id&&item?.bytes===size&&row?.hosting_status==='SELF_HOSTED_HTML_MEDIA_PENDING'&&row?.audio_source_verification==='DRIVE_MP4_UNLOCATED');
}
check('All manifest original HTML files that actually exist can open locally',rows.every(x=>!fs.existsSync('claude-library/'+x.source_path)||x.hosting_status.startsWith('SELF_HOSTED_')));
