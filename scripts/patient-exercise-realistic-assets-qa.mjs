import fs from 'node:fs';

const manifest=JSON.parse(fs.readFileSync('data/patient-exercise-realistic-assets-v1.json','utf8'));
const index=fs.readFileSync('index.html','utf8');
const checks=[];
const check=(name,pass,detail='')=>checks.push({name,pass:Boolean(pass),detail});
const allowedStatuses=new Set(['PENDING_GENERATION','STYLE_REFERENCE_APPROVED','CANDIDATE_GENERATED','APPROVED']);

check('Realistic asset manifest schema',manifest.schema_version==='1.0.0',manifest.schema_version);
check('User-approved style lock',manifest.style_lock?.status==='USER_APPROVED',manifest.style_lock?.status||'missing');
check('18 actionable realistic asset slots',manifest.profiles?.length===18,String(manifest.profiles?.length||0));
check('Unique profile slots',new Set(manifest.profiles.map(x=>x.profile_id)).size===18);
check('Every slot uses a known lifecycle status',manifest.profiles.every(x=>allowedStatuses.has(x.status)),manifest.profiles.filter(x=>!allowedStatuses.has(x.status)).map(x=>`${x.profile_id}:${x.status}`).join(','));
check('No stale style-reference status remains after candidate generation',
  manifest.profiles.filter(x=>x.status==='STYLE_REFERENCE_APPROVED').every(x=>x.profile_id==='px009')
);
check('Generated candidates retain generator provenance and no asset URL',
  manifest.profiles.filter(x=>x.status==='CANDIDATE_GENERATED').every(x=>x.generator==='OpenAI image generation'&&typeof x.gen_id==='string'&&x.gen_id.length>10&&!x.composite_url)
);
check('px007-px018 have locked generation briefs',
  ['px007','px008','px009','px010','px011','px012','px013','px014','px015','px016','px017','px018'].every(id=>{
    const x=manifest.profiles.find(p=>p.profile_id===id);
    return x&&x.status==='PENDING_GENERATION'&&x.generation_brief&&x.generation_brief_reviewed_on==='2026-09-30'&&typeof x.generation_brief.text_policy==='string';
  })
);
check('Generation briefs prohibit invented dosage',
  ['px007','px008','px009','px010','px011','px012','px013','px014','px015','px016','px017','px018'].every(id=>String(manifest.profiles.find(p=>p.profile_id===id)?.generation_brief?.text_policy||'').includes('금지'))
);
check('Pending/reference/candidate slots never pretend to have an asset URL',
  manifest.profiles.filter(x=>x.status!=='APPROVED').every(x=>!x.composite_url)
);
check('Approval blockers prevent premature realistic asset approval',
  manifest.profiles.every(x=>!(Array.isArray(x.approval_blockers)&&x.approval_blockers.length)||x.status!=='APPROVED')
);
check('px009 squat safety blocker is explicit until corrected',
  manifest.profiles.some(x=>x.profile_id==='px009'&&x.status==='CANDIDATE_GENERATED'&&Array.isArray(x.approval_blockers)&&x.approval_blockers.some(b=>b.code==='SQUAT_KNEE_TOE_ABSOLUTE_CUE'))
);
check('px007 hand-motion mismatch blocker is explicit until regenerated',
  manifest.profiles.some(x=>x.profile_id==='px007'&&x.status==='CANDIDATE_GENERATED'&&Array.isArray(x.approval_blockers)&&x.approval_blockers.some(b=>b.code==='HAND_INTRINSIC_MOTION_MISMATCH'))
);
check('Any APPROVED asset must have WebP URL',
  manifest.profiles.filter(x=>x.status==='APPROVED').every(x=>typeof x.composite_url==='string'&&/\.webp(?:\?|$)/.test(x.composite_url))
);
check('First six realistic Preview assets approved', ['px001','px002','px003','px004','px005','px006'].every(id=>manifest.profiles.some(x=>x.profile_id===id&&x.status==='APPROVED')),
  manifest.profiles.filter(x=>x.status==='APPROVED').map(x=>x.profile_id).join(',')
);
check('Every APPROVED asset keeps A4 HD pending gate',
  manifest.profiles.filter(x=>x.status==='APPROVED').every(x=>x.asset_gate==='MOBILE_PREVIEW_APPROVED_A4_HD_PENDING')
);
check('Every APPROVED realistic asset exists and is WebP bytes',
  manifest.profiles.filter(x=>x.status==='APPROVED').every(x=>{
    const path=String(x.composite_url||'').replace(/^\.\//,'');
    if(!path||!fs.existsSync(path))return false;
    const b=fs.readFileSync(path);
    return b.length>20&&b.subarray(0,4).toString('ascii')==='RIFF'&&b.subarray(8,12).toString('ascii')==='WEBP';
  })
);
check('px001 realistic neck-stretch asset is connected',
  manifest.profiles.some(x=>x.profile_id==='px001'&&x.status==='APPROVED'&&x.composite_url==='./assets/patient-exercise-realistic/px001.webp')
);
check('px001 keeps mobile-preview / A4-HD-pending gate',
  manifest.profiles.some(x=>x.profile_id==='px001'&&x.asset_gate==='MOBILE_PREVIEW_APPROVED_A4_HD_PENDING')
);
check('App loads realistic asset manifest',index.includes("fetch('./data/patient-exercise-realistic-assets-v1.json'"));
check('App indexes realistic assets',index.includes('exerciseRealisticAssetById=Object.fromEntries'));
check('Renderer prefers APPROVED realistic asset',index.includes("asset?.status==='APPROVED'&&asset?.composite_url"));
check('Renderer preserves SVG fallback',index.includes('exercise-svg-fallback'));
check('A4 HD-pending assets use print-safe fallback',
  index.includes('exercise-realistic-media.a4-hd-pending')&&
  index.includes('exercise-svg-fallback.a4-hd-pending[hidden]')&&
  index.includes('exercise-a4-pending-note')&&
  index.includes("asset?.asset_gate==='MOBILE_PREVIEW_APPROVED_A4_HD_PENDING'")
);
// Keep this gate semantic rather than matching one exact JS-escaped HTML literal.
// The renderer source contains escaped quotes because the <img> markup is itself built inside a JS string.
check('Broken realistic image restores fallback',
  /onerror=.*parentElement\.style\.display=.*none.*nextElementSibling\.hidden=false/.test(index)
);
check('Realistic image is lazy and async decoded',/loading=[\\"']?lazy[\\"']?.*decoding=[\\"']?async/.test(index));
check('Realistic final style is not stick-figure final',
  manifest.style_lock?.forbidden?.includes('stick figure final')
);

let failed=0;
for(const x of checks){
  console.log(`${x.pass?'PASS':'FAIL'} | ${x.name}${x.detail?' | '+x.detail:''}`);
  if(!x.pass)failed++;
}
console.log('\n--- STAGE 23B REALISTIC ASSET PIPELINE QA ---');
console.log(`PASS=${checks.length-failed} FAIL=${failed}`);
if(failed)process.exit(1);
