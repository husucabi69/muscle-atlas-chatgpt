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
      if(result.realistic.width>result.realistic.naturalWidth+1)fail(id+' realistic image must not upscale beyond source pixels',JSON.stringify(result.realistic));
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

  await page.setViewportSize({width:1440,height:1000});
  const desktopFidelity=await page.evaluate(async()=>{
    const p=exerciseProfileById.px001;
    const host=document.createElement('div');
    host.style.width='100%';
    host.innerHTML=exerciseIllustration(p);
    document.body.appendChild(host);
    const img=host.querySelector('.exercise-realistic-media img');
    if(img){try{await img.decode();}catch{}}
    const media=host.querySelector('.exercise-realistic-media');
    const out={
      present:Boolean(img),
      naturalWidth:img?.naturalWidth||0,
      naturalHeight:img?.naturalHeight||0,
      renderedWidth:img?Math.round(img.getBoundingClientRect().width):0,
      renderedHeight:img?Math.round(img.getBoundingClientRect().height):0,
      mediaWidth:media?Math.round(media.getBoundingClientRect().width):0
    };
    host.remove();
    return out;
  });
  if(!desktopFidelity.present)fail('Stage 23B desktop fidelity approved image present');
  if(desktopFidelity.renderedWidth>desktopFidelity.naturalWidth+1)fail('Stage 23B desktop no source upscaling',JSON.stringify(desktopFidelity));
  if(desktopFidelity.renderedWidth>720)fail('Stage 23B desktop illustration cap 720px',JSON.stringify(desktopFidelity));
  pass('Stage 23B desktop illustration source-pixel fidelity',JSON.stringify(desktopFidelity));

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

  const blockedPrint=await page.evaluate(()=>{
    const p=exerciseProfileById.px007;
    const asset=exerciseRealisticAssetById.px007;
    const host=document.createElement('div');
    host.id='educationDetail';
    host.style.width='180mm';
    host.innerHTML=exerciseIllustration(p);
    document.body.appendChild(host);
    document.body.classList.add('printing-education');
    const figure=host.querySelector('.exercise-figure');
    const realistic=host.querySelector('.exercise-realistic-media');
    const fallback=host.querySelector('.exercise-svg-fallback');
    const out={
      gate:asset?.asset_gate||'',
      status:asset?.status||'',
      overflow:figure?figure.scrollWidth-figure.clientWidth:999,
      realisticPresent:Boolean(realistic),
      realisticDisplay:realistic?getComputedStyle(realistic).display:'',
      fallbackPresent:Boolean(fallback),
      fallbackDisplay:fallback?getComputedStyle(fallback).display:''
    };
    document.body.classList.remove('printing-education');
    host.remove();
    return out;
  });
  if(blockedPrint.gate==='BINARY_HANDOFF_BLOCKED'){
    if(blockedPrint.status!=='CANDIDATE_GENERATED')fail('Stage 23B A4 blocked candidate status',blockedPrint.status);
    if(blockedPrint.realisticPresent&&blockedPrint.realisticDisplay!=='none')fail('Stage 23B A4 blocked candidate must hide realistic media',blockedPrint.realisticDisplay);
    if(!blockedPrint.fallbackPresent||blockedPrint.fallbackDisplay==='none')fail('Stage 23B A4 blocked candidate must show SVG fallback',blockedPrint.fallbackDisplay);
    if(blockedPrint.overflow>1)fail('Stage 23B A4 blocked candidate no clipping',String(blockedPrint.overflow));
    pass('Stage 23B A4 binary-handoff candidate uses safe fallback','px007');
  }


  const printAll=await page.evaluate(profileIds=>{
    const results=[];
    document.body.classList.add('printing-education');
    for(const profileId of profileIds){
      const p=exerciseProfileById[profileId];
      const asset=exerciseRealisticAssetById?.[profileId]||null;
      const host=document.createElement('div');
      host.id='educationDetail';
      host.style.width='180mm';
      host.innerHTML=exerciseIllustration(p);
      document.body.appendChild(host);
      const figure=host.querySelector('.exercise-figure');
      const realistic=host.querySelector('.exercise-realistic-media');
      const fallback=host.querySelector('.exercise-svg-fallback');
      const note=host.querySelector('.exercise-a4-pending-note');
      results.push({
        profileId,
        status:asset?.status||'',
        gate:asset?.asset_gate||'',
        overflow:figure?figure.scrollWidth-figure.clientWidth:999,
        breakInside:figure?getComputedStyle(figure).breakInside:'',
        realisticPresent:Boolean(realistic),
        realisticDisplay:realistic?getComputedStyle(realistic).display:'',
        fallbackPresent:Boolean(fallback),
        fallbackDisplay:fallback?getComputedStyle(fallback).display:'',
        notePresent:Boolean(note),
        noteDisplay:note?getComputedStyle(note).display:''
      });
      host.remove();
    }
    document.body.classList.remove('printing-education');
    return results;
  },ids);

  if(printAll.length!==18)fail('Stage 23B A4 all actionable profiles checked',String(printAll.length));
  for(const x of printAll){
    if(x.overflow>1)fail(x.profileId+' A4 no clipping',String(x.overflow));
    if(x.breakInside!=='avoid')fail(x.profileId+' A4 break-inside avoid',x.breakInside);
    if(!x.fallbackPresent||x.fallbackDisplay==='none')fail(x.profileId+' A4 safe fallback visible',x.fallbackDisplay);
    if(x.gate==='MOBILE_PREVIEW_APPROVED_A4_HD_PENDING'){
      if(!x.realisticPresent)fail(x.profileId+' approved mobile realistic media exists before A4 fallback');
      if(x.realisticDisplay!=='none')fail(x.profileId+' A4 hides mobile-preview realistic media',x.realisticDisplay);
      if(!x.notePresent||x.noteDisplay==='none')fail(x.profileId+' A4 explains HD-pending fallback',x.noteDisplay);
    }else{
      if(x.realisticPresent&&x.realisticDisplay!=='none')fail(x.profileId+' non-approved A4 must not show realistic media',x.realisticDisplay);
    }
    pass('Stage 23B A4 profile safety',x.profileId);
  }
  pass('Stage 23B A4 all 18 actionable profiles safe');
  console.log('\n--- STAGE 23B PATIENT EXERCISE RUNTIME E2E ---');
  console.log('PASS | blocked and binary-handoff candidates stay off-screen; 18/18 profiles render safe fallback/approved realistic media + A4 print guard');
}finally{
  await browser.close();
}
