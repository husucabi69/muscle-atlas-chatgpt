// Claude Muscle Compendium #1/2: full-source interactive responsive reader.
// Preserve each 3.2 MB source HTML and its original JavaScript in the iframe:
// an app-owned large-reading layout and free device voice ride on that same DOM.
// This is NOT a rewrite of the interactive exercises or an original MP4.
(function(){
 'use strict';
 const ROUTES=new Set([1,2]);
 const oldOpen=window.openClaudeOriginalLecture;
 const frame=document.getElementById('diseaseTraumaOriginalFrame');
 const nativeHost=document.getElementById('claudeNativePilotHost');
 if(typeof oldOpen!=='function'||!frame||!nativeHost)return;
 const banner=document.createElement('div');
 banner.id='claudeCompendiumReaderHost';
 banner.className='claude-native-pilot claude-compendium-reader';
 banner.hidden=true;
 frame.before(banner);
 const style=document.createElement('style');
 style.textContent=
  '.claude-compendium-reader{max-width:100%;margin:8px 0 16px}'+
  '.claude-compendium-actions{display:flex;gap:10px;flex-wrap:wrap;margin:10px 0}'+
  '.claude-compendium-actions button{min-height:43px;padding:10px 16px;border:1px solid #abc0d0;border-radius:12px;background:#fff;color:#173951;font-weight:750}'+
  '.claude-compendium-reader .claude-native-audio{margin:14px 0}'+
  '.claude-original-frame.claude-compendium-large{display:block;width:100%;max-width:100%;box-sizing:border-box;min-height:880px;height:100svh;border:1px solid #cbd7df;border-radius:16px;background:#fff}';
 document.head.append(style);
 let route=null,epoch=0,inProgress=false,listener=null,frameDoc=null,heightTimer=null,player=null;
 let resizeObserver=null,sourceMouse=null;
 const status=document.getElementById('diseaseTraumaOriginalStatus');
 function stop(){
   window.LYSNativeAudio?.stop();
   if(frameDoc&&sourceMouse)frameDoc.removeEventListener('click',sourceMouse,true);
   sourceMouse=null;frameDoc=null;
   if(resizeObserver){resizeObserver.disconnect();resizeObserver=null;}
   if(heightTimer){clearTimeout(heightTimer);heightTimer=null;}
   frame.classList.remove('claude-compendium-large');
   frame.style.removeProperty('height');
   banner.hidden=true;banner.replaceChildren();
   player=null;
 }
 function nextHeight(doc){
   const body=doc.body;
   if(!body)return;
   // Avoid tiny nested 78vh browser panes seen on Android. A very long
   // interactive source is capped for mobile compositor stability.
   const trueHeight=Math.max(body.scrollHeight,doc.documentElement.scrollHeight);
   const px=Math.min(18000,Math.max(880,trueHeight+36));
   if(Math.abs(frame.clientHeight-px)>8)frame.style.height=px+'px';
   const note=banner.querySelector('[data-compendium-height-note]');
   if(note)note.textContent=trueHeight>18000
     ?'강의가 길어 화면 일부는 원본 창 안에서 계속 스크롤됩니다.'
     :'강의 내용 높이에 맞춰 원본 창을 넓혔습니다. 전체 페이지를 자연스럽게 스크롤하세요.';
 }
 function scheduleHeight(doc){
   if(heightTimer)clearTimeout(heightTimer);
   heightTimer=setTimeout(()=>{heightTimer=null;if(frameDoc===doc)nextHeight(doc);},180);
 }
 function responsive(doc){
   const existing=doc.getElementById('lys-compendium-native-layout-v1');
   if(existing)return;
   const el=doc.createElement('style');el.id='lys-compendium-native-layout-v1';
   el.textContent=
     'html,body{box-sizing:border-box;max-width:100%!important;overflow-x:hidden!important}'+
     'body{font-size:18px!important;line-height:1.75!important;padding-left:10px!important;padding-right:10px!important}'+
     'main,.wrap,.container,.content,.page,.layout,#root,#app,article,section{max-width:100%!important;min-width:0!important;box-sizing:border-box!important}'+
     'p,li,td,th,dd,dt,blockquote{font-size:clamp(17px,4.25vw,20px)!important;line-height:1.8!important;overflow-wrap:anywhere}'+
     'h1{font-size:clamp(26px,6.5vw,34px)!important;line-height:1.35!important}'+
     'h2{font-size:clamp(23px,5.8vw,30px)!important;line-height:1.4!important}'+
     'h3,h4{font-size:clamp(20px,5vw,26px)!important;line-height:1.45!important}'+
     'button,select,input{min-height:38px;max-width:100%}'+
     'table{max-width:100%;overflow-x:auto}img,svg,video{max-width:100%;height:auto}'+
     'pre{max-width:100%;overflow-x:auto;white-space:pre-wrap}'+
     '[data-i].claude-native-speaking{outline:3px solid #d79416!important;outline-offset:3px;background:#fff2b9!important;border-radius:6px}';
   doc.head.append(el);
 }
 function extractPassages(doc){
   // Preserve the real interactive HTML. Mark only visible educational nodes
   // in the in-memory DOM; NEVER write a shortened copy of the source.
   // Both compendiums are interactive: educational copy is mostly DIV/SPAN
   // cards and muscle-selection BUTTONs, not static <p> paragraphs.
   const candidates=[...doc.body.querySelectorAll('h1,h2,h3,h4,p,li,tr,dt,dd,figcaption,blockquote,summary,button,div,span')];
   // Drop only marks from this reader, never source-authored annotations.
   for(const el of doc.querySelectorAll('[data-compendium-voice]')){
     el.removeAttribute('data-compendium-voice');el.removeAttribute('data-i');
   }
   const found=[];
   for(const el of candidates){
     if(el.closest('nav,footer,script,style,template,[aria-hidden="true"]'))continue;
     if(!el.matches('button')&&el.closest('button,input,select,textarea,a'))continue;
     if(el.matches('div,span')){
       if(el.closest('h1,h2,h3,h4,p,li,summary'))continue;
       if(el.querySelector('div,span,p,li,h1,h2,h3,h4,button,table,section,article'))continue;
     }
     if(el.matches('li,tr')&&el.querySelector('p,li,tr,dd,dt'))continue;
     if(el.parentElement?.closest('[data-compendium-voice]'))continue;
     if(!el.getClientRects().length)continue;
     const txt=(el.innerText||el.textContent||'').replace(/\s+/g,' ').trim();
     if(txt.length<3||txt.length>3000)continue;
     found.push(el);
     el.dataset.compendiumVoice='1';
   }
   // If a cover screen currently exposes only a few visible headings, allow
   // it to speak its cover text; after a muscle is selected Refresh rescans.
   if(found.length<3){
     for(const el of doc.body.querySelectorAll('div,span,strong,b,small')){
       if(el.children.length>3||el.closest('nav,footer,button,a,script,style'))continue;
       if(el.parentElement?.closest('[data-compendium-voice]'))continue;
       if(!el.getClientRects().length||el.querySelector('p,li,h1,h2,h3,h4,tr'))continue;
       const txt=(el.innerText||'').replace(/\s+/g,' ').trim();
       if(txt.length>=10&&txt.length<=900&&!found.includes(el)){
         found.push(el);el.dataset.compendiumVoice='1';
       }
       if(found.length>=300)break;
     }
   }
   // The full original DOM stays intact; add temporary app-owned TTS IDs.
   found.sort((a,b)=>{
     if(a===b)return 0;
     const order=a.compareDocumentPosition(b);
     return order&Node.DOCUMENT_POSITION_FOLLOWING?-1:1;
   });
   found.forEach((el,i)=>{el.dataset.i=String(i);el.dataset.compendiumVoice='1';});
   return found.length;
 }
 async function prepare(token){
   const n=route;
   if(!ROUTES.has(n)||inProgress||token!==epoch)return;
   let doc;
   try{doc=frame.contentDocument;}catch{return;}
   const item=(window.LYSClaudeLectureCatalog?.()||[]).find(x=>x.number===n);
   if(!item||!doc||doc.readyState!=='complete'||doc.title==='원본 강의 확인 필요')return;
   const path=decodeURIComponent(frame.contentWindow.location.pathname);
   if(path!=='/claude-library/'+item.source_path&&!path.endsWith('/'+item.source_path.split('/').at(-1)))return;
   if((doc.body?.textContent||'').length<1000)return;
   inProgress=true;
   try{
     // Independently verify the complete original file before mounting any
     // misleading "full lecture" UI. Protect both large source variants.
     const response=await fetch('./claude-library/'+item.source_path,{cache:'no-store'});
     if(!response.ok)throw Error('원본 '+response.status);
     const bytes=await response.arrayBuffer();
     if(bytes.byteLength!==item.source_bytes)throw Error('원본 바이트 불일치');
     const digest=await crypto.subtle.digest('SHA-256',bytes);
     const sha=[...new Uint8Array(digest)].map(x=>x.toString(16).padStart(2,'0')).join('');
     if(sha!==item.source_sha256)throw Error('원본 SHA-256 불일치');
     if(token!==epoch||route!==n||frame.contentDocument!==doc)return;
     responsive(doc);
     frameDoc=doc;frame.classList.add('claude-compendium-large');
     const lead=document.createElement('div');lead.className='claude-native-lead';
     const head=document.createElement('b');head.textContent='📖 '+item.title+' · 큰 글씨 학습 및 무료 한국어 음성';
     const desc=document.createElement('p');
     desc.textContent='원본 근육 목록과 대화형 기능을 보존하면서 화면을 확대했습니다. 근육을 새로 선택한 뒤 아래 「음성 갱신」을 누르면 새로 보이는 설명을 읽습니다. 무료 기기 음성이며 원본 녹음 MP4와는 다릅니다.';
     const tiny=document.createElement('small');
     tiny.textContent='원본 '+item.source_bytes.toLocaleString('ko-KR')+'바이트 · SHA-256 확인 · 무료 휴대전화 음성(Claude 녹음 MP4와 별개)';
     lead.append(head,desc,tiny);
     const row=document.createElement('div');row.className='claude-compendium-actions';
     const refresh=document.createElement('button');refresh.textContent='🔄 지금 선택한 내용으로 음성 갱신';refresh.type='button';
     const shrink=document.createElement('button');shrink.textContent='원본 화면 크기로 보기';shrink.type='button';
     const enlarge=document.createElement('button');enlarge.textContent='확대 보기 다시 적용';enlarge.type='button';
     const heightNote=document.createElement('small');heightNote.dataset.compendiumHeightNote='1';
     row.append(refresh,shrink,enlarge);
     const mountAudio=()=>{
       if(token!==epoch||!doc.body)return;
       window.LYSNativeAudio?.stop();
       const count=extractPassages(doc);
       if(!count)throw Error('읽기 대상 본문이 없습니다');
       const newPlayer=window.LYSNativeAudio.mount(doc,{
         lectureNumber:n,title:item.title,expectedCount:count,
         // These are two interactive reference sources, not a continuous
         // muscle-series MP4; no deceptive auto-next promise.
         onComplete:undefined
       });
       // The original interactive iframe can finish a second navigation or
       // replace an earlier read-aloud DOM node. Replacing a detached node is
       // a silent no-op: mount to the CURRENT banner instead, exactly once.
       if(player?.isConnected&&banner.contains(player))player.replaceWith(newPlayer);
       else if(row.isConnected&&banner.contains(row))row.after(newPlayer);
       else banner.append(newPlayer);
       player=newPlayer;
       banner.dataset.compendiumVoiceSegments=String(count);
     };
     banner.replaceChildren(lead,row,heightNote);
     refresh.addEventListener('click',()=>{mountAudio();scheduleHeight(doc);});
     shrink.addEventListener('click',()=>{frame.classList.remove('claude-compendium-large');frame.style.removeProperty('height');shrink.hidden=true;enlarge.hidden=false;});
     enlarge.addEventListener('click',()=>{frame.classList.add('claude-compendium-large');scheduleHeight(doc);shrink.hidden=false;enlarge.hidden=true;});
     enlarge.hidden=true;
     mountAudio();
     banner.hidden=false;
     banner.dataset.compendiumLecture=String(n);
     status.textContent='✓ 근육총람 '+n+'번 원본 검증 PASS · 큰 화면 + 무료 한국어 음성 · 원본 대화 기능 보존';
     nextHeight(doc);
     // The source itself remains interactive; after choosing a new muscle,
     // update frame height, and let the user refresh the voice context.
     sourceMouse=()=>scheduleHeight(doc);
     doc.addEventListener('click',sourceMouse,true);
   }catch(error){
     if(token!==epoch)return;
     banner.hidden=false;banner.replaceChildren();
     const p=document.createElement('p');
     p.textContent='큰 글씨·음성 추가 기능 확인 실패: '+String(error?.message||error)+'. 원본 화면은 계속 사용할 수 있습니다.';
     banner.append(p);
     status.textContent='원본 강의 화면 유지 · 큰 글씨·음성 검증 미완료';
   }finally{inProgress=false;}
 }
 frame.addEventListener('load',()=>{if(route!==null){const token=epoch;setTimeout(()=>prepare(token),0);}});
 window.openClaudeOriginalLecture=function(number,record=true){
   const n=Number(number);
   epoch++;route=null;inProgress=false;stop();
   if(!ROUTES.has(n))return oldOpen(number,record);
   route=n;const token=epoch;
   const result=oldOpen(number,record);
   // If a cached iframe finished before the callback, retry immediately.
   setTimeout(()=>prepare(token),200);
   return result;
 };
})();
