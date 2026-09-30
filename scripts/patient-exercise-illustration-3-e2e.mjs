import {chromium} from 'playwright';

const base=process.env.MUSCLE_ATLAS_BASE_URL||'http://127.0.0.1:4173/';
const browser=await chromium.launch({headless:true});
const page=await browser.newPage({viewport:{width:390,height:844},deviceScaleFactor:1});
const fail=(name,detail='')=>{throw new Error('FAIL | '+name+(detail?' | '+detail:''));};
const pass=(name,detail='')=>console.log('PASS | '+name+(detail?' | '+detail:''));

try{
  await page.goto(base,{waitUntil:'networkidle',timeout:30000});
  await page.waitForFunction(()=>typeof patientExerciseIllustrations!=='undefined'&&Array.isArray(patientExerciseIllustrations?.profiles)&&patientExerciseIllustrations.profiles.length===19,{timeout:10000});
  const ids=await page.evaluate(()=>patientExerciseIllustrations.profiles.filter(x=>x.actionability===true).map(x=>x.profile_id));
  if(ids.length!==18)fail('18 actionable profiles available',String(ids.length));

  for(const id of ids){
    const result=await page.evaluate(async profileId=>{
      const p=exerciseProfileById[profileId];
      const spec=exerciseIllustrationById[profileId];
      const asset=exerciseRealisticAssetById?.[profileId]||null;
      if(!p||!spec)return{error:'missing profile'};
      const host=document.createElement('div');
      host.id='stage23b-e2e-host';
      host.style.width='360px';
      host.style.maxWidth='calc(100vw - 20px)';
      host.style.margin='0 auto';
      host.innerHTML=exerciseIllustration(p);
      document.body.appendChild(host);
      const figure=host.querySelector('.exercise-figure');
      const realisticImg=host.querySelector('.exercise-realistic-media img');
      if(realisticImg){try{await realisticImg.decode();}catch{}}
      const realistic={
        present:Boolean(realisticImg),
        src:realisticImg?.getAttribute('src')||'',
        alt:realisticImg?.getAttribute('alt')||'',
        naturalWidth:realisticImg?.naturalWidth||0,
        naturalHeight:realisticImg?.naturalHeight||0,
        width:realisticImg?Math.round(realisticImg.getBoundingClientRect().width):0,
        height:realisticImg?Math.round(realisticImg.getBoundingClientRect().height):0
      };
      const phases=[...host.querySelectorAll('.exercise-phase')];
      const svgs=[...host.querySelectorAll('.exercise-phase svg')];
      const viewBoxes=svgs.map(x=>x.getAttribute('viewBox'));
      const labels=phases.map(x=>x.querySelector('b')?.textContent?.trim()||'');
      const widths=svgs.map(x=>Math.round(x.getBoundingClientRect().width));
      const overflow=figure?figure.scrollWidth-figure.clientWidth:999;
      const grid=host.querySelector('.exercise-sequence');
      const cols=grid?getComputedStyle(grid).gridTemplateColumns:'';
      const cueText=host.querySelector('.exercise-cues')?.textContent||'';
      const keyText=host.querySelector('.exercise-visual-key')?.textContent||'';
      const phaseMarkup=phases.map(x=>x.querySelector('svg')?.innerHTML||'');
      host.remove();
      return{
        realistic,viewBoxes,labels,widths,overflow,cols,cueText,keyText,phaseMarkup,
        assetStatus:asset?.status||'',
        assetGate:asset?.asset_gate||'',
        candidateAssetPath:asset?.candidate_asset_path||'',
        compositeUrl:asset?.composite_url||'',
        blockerCodes:Array.isArray(asset?.approval_blockers)?asset.approval_blockers.map(x=>x.code||'UNKNOWN'):[]
      };
    },id);
    if(result.error)fail(id+' profile render',result.error);
    if(result.blockerCodes.length&&result.realistic.present)fail(id+' blocked realistic candidate must not render',result.blockerCodes.join(','));
    if(result.assetGate==='BINARY_HANDOFF_BLOCKED'){
      if(result.realistic.present)fail(id+' binary-handoff candidate must stay off-screen');
      if(result.assetStatus!=='CANDIDATE_GENERATED')fail(id+' binary-handoff status must remain candidate',result.assetStatus);
      if(result.candidateAssetPath)fail(id+' binary-handoff candidate must not claim repository asset',result.candidateAssetPath);
      if(result.compositeUrl)fail(id+' binary-handoff candidate must not have visible composite URL',result.compositeUrl);
    }
    if(result.viewBoxes.length!==2||!result.viewBoxes.every(x=>x==='0 0 240 180'))fail(id+' two 240x180 SVG fallback phases',JSON.stringify(result.viewBoxes));
    if(result.labels.join('|')!=='1 · 시작|2 · 끝')fail(id+' fallback phase labels',result.labels.join('|'));
    if(result.phaseMarkup[0]===result.phaseMarkup[1])fail(id+' fallback start/end differ');
    if(result.phaseMarkup.some(x=>!x||x.length<250||/(NaN|undefined)/.test(x)))fail(id+' valid SVG fallback markup');
    if(result.realistic.present){
      if(!/\.webp(?:\?|$)/.test(result.realistic.src))fail(id+' realistic WebP source',result.realistic.src);
      if(!result.realistic.alt)fail(id+' realistic alt text');
      if(result.realistic.naturalWidth<1||result.realistic.naturalHeight<1)fail(id+' realistic asset loads',JSON.stringify(result.realistic));
      if(result.realistic.width<250)fail(id+' mobile realistic image readable width',String(result.realistic.width));
      if(result.realistic.height<=result.realistic.width)fail(id+' realistic portrait ratio preserved',JSON.stringify(result.realistic));
    }else if(result.widths.some(x=>x<250)){
      fail(id+' mobile SVG readable width',JSON.stringify(result.widths));
    }
    if(result.overflow>1)fail(id+' no horizontal clipping',String(result.overflow));
    if(!result.cols||result.cols.trim().split(' ').length!==1)fail(id+' mobile start/end stack to one column',result.cols);
    for(const cue of ['움직임','고정·지지','흔한 실수','중단 기준'])if(!result.cueText.includes(cue))fail(id+' cue '+cue);
    for(const key of ['움직임 방향','고정·지지','피할 보상'])if(!result.keyText.includes(key))fail(id+' visual key '+key);
    pass('Stage 23B mobile illustration',id);
  }

  await page.emulateMedia({media:'print'});
  const print=await page.evaluate(()=>{
    const p=exerciseProfileById.px001;
    const original=exerciseRealisticAssetById.px001;
    exerciseRealisticAssetById.px001={
      ...original,
      status:'APPROVED',
      composite_url:original?.candidate_asset_path||'./assets/patient-exercise-realistic/px001.webp',
      approval_blockers:[],
      asset_gate:'MOBILE_PREVIEW_APPROVED_A4_HD_PENDING'
    };
    const host=document.createElement('div');
    host.id='educationDetail';
    host.style.width='180mm';
    host.innerHTML=exerciseIllustration(p);
    document.body.appendChild(host);
    document.body.classList.add('printing-education');
    const figure=host.querySelector('.exercise-figure');
    const phase=host.querySelector('.exercise-phase');
    const realistic=host.querySelector('.exercise-realistic-media');
    const fallback=host.querySelector('.exercise-svg-fallback');
    const note=host.querySelector('.exercise-a4-pending-note');
    const out={
      breakInside:getComputedStyle(figure).breakInside,
      figureBackground:getComputedStyle(figure).backgroundColor,
      phaseBackground:getComputedStyle(phase).backgroundColor,
      overflow:figure.scrollWidth-figure.clientWidth,
      realisticDisplay:realistic?getComputedStyle(realistic).display:'',
      fallbackDisplay:fallback?getComputedStyle(fallback).display:'',
      noteDisplay:note?getComputedStyle(note).display:''
    };
    document.body.classList.remove('printing-education');
    host.remove();
    exerciseRealisticAssetById.px001=original;
    return out;
  });
  if(print.breakInside!=='avoid')fail('Stage 23B A4 break-inside avoid',print.breakInside);
  if(print.overflow>1)fail('Stage 23B A4 no clipping',String(print.overflow));
  if(print.realisticDisplay!=='none')fail('Stage 23B A4 hides mobile-preview realistic asset',print.realisticDisplay);
  if(print.fallbackDisplay==='none'||!print.fallbackDisplay)fail('Stage 23B A4 shows sharp fallback while HD pending',print.fallbackDisplay);
  if(print.noteDisplay==='none'||!print.noteDisplay)fail('Stage 23B A4 explains HD pending fallback',print.noteDisplay);
  pass('Stage 23B A4 print geometry and HD-pending fallback');

  console.log('\n--- STAGE 23B PATIENT EXERCISE RUNTIME E2E ---');
  console.log('PASS | blocked and binary-handoff candidates stay off-screen; 18/18 profiles render safe fallback/approved realistic media + A4 print guard');
}finally{
  await browser.close();
}
