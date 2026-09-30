import fs from 'node:fs';

export function buildRenderRequest(manifest,curated,profileId){
  const profile=manifest.profiles?.find(x=>x.profile_id===profileId);
  if(!profile)throw new Error('Unknown profile: '+profileId);
  const special=curated.requests?.find(x=>x.profile_id===profileId);
  if(special)return{...special,source:'CURATED_OVERRIDE'};
  const b=profile.generation_brief;
  if(!b)throw new Error(profileId+' has no locked generation_brief');
  if(manifest.style_lock?.status!=='USER_APPROVED')throw new Error('User-approved style lock missing');
  return{
    profile_id:profile.profile_id,
    title_ko:profile.title_ko,
    status:'READY_TO_GENERATE',
    output_path:'assets/patient-exercise-realistic/'+profile.profile_id+'.webp',
    source:'MANIFEST_GENERATION_BRIEF',
    style:{
      style_lock_name:manifest.style_lock.name,
      description:manifest.style_lock.description,
      required:manifest.style_lock.required,
      forbidden:manifest.style_lock.forbidden
    },
    exact_motion:{
      view:b.view,
      start:b.start,
      end:b.end,
      arrows:b.motion,
      fixed_points:b.support
    },
    must_not_show:[
      b.common_error,
      b.text_policy
    ].filter(Boolean),
    review_gate:[
      '시작 자세와 끝 자세가 명확히 구분되는가',
      '움직임 방향이 generation brief와 일치하는가',
      '지지점·고정점이 generation brief와 일치하는가',
      '흔한 보상동작이 정상 동작처럼 보이지 않는가',
      '근거 없는 고정 숫자가 없는가',
      '모바일 화면에서 시작/끝이 한눈에 구분되는가'
    ],
    source_truth:[
      'data/patient-exercise-realistic-assets-v1.json#'+profile.profile_id,
      profile.generation_brief_source||null
    ].filter(Boolean)
  };
}

export function loadRenderRequest(profileId){
  const manifest=JSON.parse(fs.readFileSync('data/patient-exercise-realistic-assets-v1.json','utf8'));
  const curated=JSON.parse(fs.readFileSync('data/patient-exercise-render-requests-v1.json','utf8'));
  return buildRenderRequest(manifest,curated,profileId);
}

if(process.argv[1]&&process.argv[1].endsWith('build-patient-exercise-render-request.mjs')){
  try{
    const id=process.argv[2];
    if(!id)throw new Error('Usage: node scripts/build-patient-exercise-render-request.mjs pxNNN');
    console.log(JSON.stringify(loadRenderRequest(id),null,2));
  }catch(error){
    console.error('RENDER REQUEST BUILD FAIL | '+error.message);
    process.exit(1);
  }
}
