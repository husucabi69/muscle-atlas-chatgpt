import fs from 'node:fs';

const manifest=JSON.parse(fs.readFileSync('data/patient-exercise-realistic-assets-v1.json','utf8'));
const index=fs.readFileSync('index.html','utf8');
const checks=[];
const check=(name,pass,detail='')=>checks.push({name,pass:Boolean(pass),detail});
const allowedStatuses=new Set(['PENDING_GENERATION','PENDING_REGENERATION','STYLE_REFERENCE_APPROVED','CANDIDATE_GENERATED','APPROVED']);

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
check('Every generated candidate has three-part review state',
  manifest.profiles.filter(x=>x.status==='CANDIDATE_GENERATED').every(x=>{
    const r=x.candidate_review||{};
    return ['PENDING','PASS','FAIL'].includes(r.clinical_content)&&
      ['PENDING','PASS','FAIL'].includes(r.visual_pose)&&
      ['PENDING','PASS','FAIL'].includes(r.embedded_text);
  })
);
check('No candidate with FAIL review may be approved',
  manifest.profiles.every(x=>x.status!=='APPROVED'||!Object.values(x.candidate_review||{}).includes('FAIL'))
);
check('px001-px018 have locked generation briefs',
  ['px001','px002','px003','px004','px005','px006','px007','px008','px009','px010','px011','px012','px013','px014','px015','px016','px017','px018'].every(id=>{
    const x=manifest.profiles.find(p=>p.profile_id===id);
    return x&&['PENDING_GENERATION','PENDING_REGENERATION','CANDIDATE_GENERATED','APPROVED'].includes(x.status)&&x.generation_brief&&x.generation_brief_reviewed_on==='2026-09-30'&&typeof x.generation_brief.text_policy==='string';
  })
);
check('Generation briefs prohibit invented dosage',
  ['px001','px002','px003','px004','px005','px006','px007','px008','px009','px010','px011','px012','px013','px014','px015','px016','px017','px018'].every(id=>String(manifest.profiles.find(p=>p.profile_id===id)?.generation_brief?.text_policy||'').includes('금지'))
);
check('Pending/reference/candidate slots never pretend to have an asset URL',
  manifest.profiles.filter(x=>x.status!=='APPROVED').every(x=>!x.composite_url)
);
check('Approval blockers prevent premature realistic asset approval',
  manifest.profiles.every(x=>!(Array.isArray(x.approval_blockers)&&x.approval_blockers.length)||x.status!=='APPROVED')
);
check('px009 unsafe squat candidate is retired and corrected brief forbids the absolute cue',(()=>{
  const x=manifest.profiles.find(p=>p.profile_id==='px009');
  return x&&x.status==='CANDIDATE_GENERATED'&&x.asset_gate==='BINARY_HANDOFF_BLOCKED'&&
    Array.isArray(x.approval_blockers)&&x.approval_blockers.length===0&&
    Array.isArray(x.rejected_candidates)&&
    x.rejected_candidates.some(c=>c.reason_code==='UNRECOVERABLE_BINARY_AND_UNSAFE_KNEE_TOE_CUE')&&
    String(x.generation_brief?.text_policy||'').includes('무릎이 발끝보다 앞으로 나가면 안 된다')&&
    String(x.generation_brief?.text_policy||'').includes('금지');
})());
check('px007 invalid fist candidate is retired and binary-loss provenance is preserved',(()=>{
  const x=manifest.profiles.find(p=>p.profile_id==='px007');
  return x&&x.status==='PENDING_REGENERATION'&&x.asset_gate==='BINARY_LOSS_CONFIRMED_REGENERATION_ALLOWED'&&
    Array.isArray(x.approval_blockers)&&x.approval_blockers.length===0&&
    Array.isArray(x.rejected_candidates)&&
    x.rejected_candidates.some(c=>c.reason_code==='HAND_INTRINSIC_MOTION_MISMATCH')&&
    Array.isArray(x.lost_candidate_history)&&
    x.lost_candidate_history.some(c=>c.gen_id==='8c940201-f1c0-4440-832d-83972f8efbb8'&&c.resolution==='EXACT_BINARY_UNRECOVERABLE')&&
    x.gen_id===null&&x.candidate_review===null;
})());
check('px007 regeneration brief locks finger-spread motion and forbids fist substitution',(()=>{
  const x=manifest.profiles.find(p=>p.profile_id==='px007');
  const b=x?.generation_brief||{};
  return typeof b.start==='string'&&b.start.includes('모은')&&
    typeof b.end==='string'&&b.end.includes('벌린')&&b.end.includes('주먹')&&
    typeof b.common_error==='string'&&b.common_error.includes('주먹쥐기')&&
    typeof b.text_policy==='string'&&b.text_policy.includes('무저항');
})());

check('Any APPROVED asset must have WebP URL',
  manifest.profiles.filter(x=>x.status==='APPROVED').every(x=>typeof x.composite_url==='string'&&/\.webp(?:\?|$)/.test(x.composite_url))
);
check('px001 corrected realistic asset is approved after three-part review',(()=>{
  const x=manifest.profiles.find(p=>p.profile_id==='px001');
  return x&&x.status==='APPROVED'&&x.composite_url==='./assets/patient-exercise-realistic/px001.webp'&&
    x.asset_gate==='MOBILE_PREVIEW_APPROVED_A4_HD_PENDING'&&
    Array.isArray(x.approval_blockers)&&x.approval_blockers.length===0&&
    ['clinical_content','visual_pose','embedded_text'].every(k=>x.candidate_review?.[k]==='PASS');
})());
check('px006 repaired realistic asset is approved after three-part review',(()=>{
  const x=manifest.profiles.find(p=>p.profile_id==='px006');
  return x&&x.status==='APPROVED'&&x.composite_url==='./assets/patient-exercise-realistic/px006.webp'&&
    x.asset_gate==='MOBILE_PREVIEW_APPROVED_A4_HD_PENDING'&&
    Array.isArray(x.approval_blockers)&&x.approval_blockers.length===0&&
    ['clinical_content','visual_pose','embedded_text'].every(k=>x.candidate_review?.[k]==='PASS');
})());
check('Demoted first-six candidate binaries are preserved for review',
  ['px001','px002','px003','px004','px005','px006'].every(id=>{
    const x=manifest.profiles.find(p=>p.profile_id===id);
    const path=String(x?.candidate_asset_path||'').replace(/^\.\//,'');
    if(!path||!fs.existsSync(path))return false;
    const b=fs.readFileSync(path);
    return b.length>20&&b.subarray(0,4).toString('ascii')==='RIFF'&&b.subarray(8,12).toString('ascii')==='WEBP';
  })
);
check('Every APPROVED asset has recognized print-quality gate',
  manifest.profiles.filter(x=>x.status==='APPROVED').every(x=>['MOBILE_PREVIEW_APPROVED_A4_HD_PENDING','A4_HD_APPROVED'].includes(x.asset_gate))
);
check('A4-HD approved assets meet minimum stored resolution',
  manifest.profiles.filter(x=>x.status==='APPROVED'&&x.asset_gate==='A4_HD_APPROVED').every(x=>{
    const m=String(x.preview_resolution||'').match(/^(\d+)x(\d+)$/);
    return Boolean(m)&&Number(m[1])>=1240&&Number(m[2])>=1754;
  })
);
check('Every APPROVED realistic asset exists and is WebP bytes',
  manifest.profiles.filter(x=>x.status==='APPROVED').every(x=>{
    const path=String(x.composite_url||'').replace(/^\.\//,'');
    if(!path||!fs.existsSync(path))return false;
    const b=fs.readFileSync(path);
    return b.length>20&&b.subarray(0,4).toString('ascii')==='RIFF'&&b.subarray(8,12).toString('ascii')==='WEBP';
  })
);
check('px001 corrected asset is connected to renderer after review',
  manifest.profiles.some(x=>x.profile_id==='px001'&&x.status==='APPROVED'&&x.composite_url==='./assets/patient-exercise-realistic/px001.webp'&&x.candidate_asset_path==='./assets/patient-exercise-realistic/px001.webp')
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
