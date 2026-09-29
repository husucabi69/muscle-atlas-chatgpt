import fs from 'node:fs';

const manifest=JSON.parse(fs.readFileSync('data/patient-exercise-realistic-assets-v1.json','utf8'));
const index=fs.readFileSync('index.html','utf8');
const checks=[];
const check=(name,pass,detail='')=>checks.push({name,pass:Boolean(pass),detail});

check('Realistic asset manifest schema',manifest.schema_version==='1.0.0',manifest.schema_version);
check('User-approved style lock',manifest.style_lock?.status==='USER_APPROVED',manifest.style_lock?.status||'missing');
check('18 actionable realistic asset slots',manifest.profiles?.length===18,String(manifest.profiles?.length||0));
check('Unique profile slots',new Set(manifest.profiles.map(x=>x.profile_id)).size===18);
check('Only px009 is approved style reference before asset generation',
  manifest.profiles.filter(x=>x.status==='STYLE_REFERENCE_APPROVED').map(x=>x.profile_id).join(',')==='px009'
);
check('No pending slot pretends to have an asset URL',
  manifest.profiles.filter(x=>x.status!=='APPROVED').every(x=>!x.composite_url)
);
check('Any APPROVED asset must have WebP URL',
  manifest.profiles.filter(x=>x.status==='APPROVED').every(x=>typeof x.composite_url==='string'&&/\.webp(?:\?|$)/.test(x.composite_url))
);
check('Current realistic Preview batch approved', ['px001','px002','px003'].every(id=>manifest.profiles.some(x=>x.profile_id===id&&x.status==='APPROVED')),
  manifest.profiles.filter(x=>x.status==='APPROVED').map(x=>x.profile_id).join(',')
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
