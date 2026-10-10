// Local-device Korean reading for the native Muscle 1 lecture.
// No paid TTS or generated files. Recorded Claude MP4 must not be simulated.
(function(){
 'use strict';
 const MAX_CHUNK=160;
 const POS_KEY='lys-native-muscle-1-tts-position-v1';
 const RATE_KEY='lys-native-muscle-1-tts-rate-v1';
 const VOICE_KEY='lys-native-muscle-1-tts-voice-v1';
 const synth=window.speechSynthesis;
 let active=null;
 function normalized(el){
   if(el.matches('tr')){
     return [...el.cells].map(cell=>cell.textContent.trim()).filter(Boolean).join('. ');
   }
   return (el.textContent||'').replace(/\s+/g,' ').trim();
 }
 function split(text,max=MAX_CHUNK){
   const out=[]; let remaining=text.replace(/\s+/g,' ').trim();
   while(remaining.length>max){
     const windowText=remaining.slice(0,max+1);
     let at=Math.max(windowText.lastIndexOf('다. '),windowText.lastIndexOf('. '),windowText.lastIndexOf('? '),
       windowText.lastIndexOf('! '),windowText.lastIndexOf('요. '));
     if(at>=Math.floor(max*0.45))at+=2;
     else at=windowText.lastIndexOf(' ');
     if(at<Math.floor(max*0.45))at=max;
     out.push(remaining.slice(0,at).trim());
     remaining=remaining.slice(at).trimStart();
   }
   if(remaining)out.push(remaining);
   return out;
 }
 function stop(){
   if(!active)return;
   const state=active;
   state.token++;
   state.playing=false;
   state.paused=false;
   try{synth?.cancel();}catch{}
   state.highlight?.classList.remove('claude-native-speaking');
   state.highlight=null;
   state.status.textContent='⏹ 정지 · 문단을 눌러 해당 위치부터 다시 들을 수 있습니다.';
   state.play.textContent='▶ 읽기';
   state.pause.textContent='⏸ 일시정지';
   if(state.dock)state.dock.hidden=true;
 }
 function createButton(label,action,className){
   const b=document.createElement('button');b.type='button';b.textContent=label;
   b.dataset.nativeAudio=action;
   if(className)b.className=className;
   return b;
 }
 function mount(shadow){
   if(active?.navObserver)active.navObserver.disconnect();
   stop();
   const elements=[...shadow.querySelectorAll('[data-i], .claude-native-teaching')];
   const entries=elements.map(el=>{
     const src=el.classList.contains('claude-native-teaching')
       ? '보강 설명. '+el.querySelector('summary')?.textContent+'. '+el.querySelector('p')?.textContent
       : normalized(el);
     const title=el.closest('section')?.querySelector('.sechead h1')?.textContent?.trim()||'강의';
     return {el,title,text:src?.trim()||''};
   }).filter(x=>x.text.length);
   if(entries.length!==676)throw Error('읽기 대상 문단 수 불일치: '+entries.length+' / 676');
   const box=document.createElement('section');
   box.className='claude-native-audio';
   box.dataset.nativeAudio='player';
   box.setAttribute('aria-label','근육학 1권 한국어 읽기');
   const header=document.createElement('div');header.className='claude-native-audio-head';
   const heading=document.createElement('strong');heading.textContent='🎧 강의 듣기 · 무료 한국어 음성';
   const detail=document.createElement('small');detail.textContent='기기에 설치된 한국어 음성으로 원문 671구간 + 보강 5곳을 순서대로 읽습니다. Claude 녹음 MP4는 아직 연결되지 않았습니다.';
   header.append(heading,detail);
   const controls=document.createElement('div');controls.className='claude-native-audio-controls';
   const prev=createButton('⏮ 이전 문단','prev');
   const play=createButton('▶ 읽기','play','primary');
   const pause=createButton('⏸ 일시정지','pause');
   const next=createButton('다음 문단 ⏭','next');
   const end=createButton('⏹ 정지','stop');
   const fromStart=createButton('⟲ 처음부터','start');
   controls.append(prev,play,pause,next,end,fromStart);
   const optionRow=document.createElement('div');optionRow.className='claude-native-audio-options';
   const voiceLabel=document.createElement('label');voiceLabel.textContent='한국어 목소리';
   const voiceSelect=document.createElement('select');voiceSelect.dataset.nativeAudio='voice';
   voiceLabel.append(voiceSelect);
   const rateLabel=document.createElement('label');rateLabel.textContent='말하기 속도';
   const rateSelect=document.createElement('select');rateSelect.dataset.nativeAudio='rate';
   rateSelect.innerHTML='<option value="0.85">천천히 0.85</option><option selected value="1">보통 1.0</option><option value="1.15">빠르게 1.15</option><option value="1.3">빠르게 1.3</option>';
   rateLabel.append(rateSelect);optionRow.append(voiceLabel,rateLabel);
   const status=document.createElement('p');status.className='claude-native-audio-status';
   status.dataset.nativeAudio='status';status.setAttribute('role','status');
   status.textContent='▶ 읽기를 누르거나, 아래 강의에서 원하는 문단을 눌러 들으세요. 기기 설정에 따라 음색이 달라집니다.';
   const chapterButton=createButton('선택한 장부터 듣기','chapter');
   const progress=document.createElement('div');progress.className='claude-native-audio-progress';
   progress.dataset.nativeAudio='progress';progress.textContent='읽기 구간: 0 / 676';
   const chapterTools=document.createElement('div');chapterTools.className='claude-native-audio-chapter';chapterTools.append(chapterButton);
   const dock=document.createElement('div');dock.className='claude-native-audio-dock';dock.hidden=true;
   const dockText=document.createElement('strong');dockText.textContent='🎧 근육학 1권 · 듣는 중';
   const dockPause=createButton('⏸ 일시정지','dock-pause');
   const dockStop=createButton('⏹ 정지','dock-stop');
   dock.append(dockText,dockPause,dockStop);
   box.append(header,controls,optionRow,chapterTools,status,progress,dock);
   const state={
     token:0,playing:false,paused:false,highlight:null,entries,index:0,chunk:0,chunks:[],
     box,play,pause,status,progress,dock,dockPause,dockStop,voiceSelect,rateSelect,availableVoices:[],selectedVoice:null
   };
   active=state;
   try{
     const stored=Number(localStorage.getItem(POS_KEY)||'0');
     if(Number.isInteger(stored)&&stored>=0&&stored<entries.length)state.index=stored;
     const savedRate=localStorage.getItem(RATE_KEY);
     if(savedRate&&[...rateSelect.options].some(x=>x.value===savedRate))rateSelect.value=savedRate;
   }catch{}
   if(state.index>0)status.textContent='이전 구간부터 이어 듣기 준비 완료. ▶ 읽기를 누르세요. (기기 한국어 음성)';
   function setProgress(){
     progress.textContent='읽기 구간: '+(state.index+1)+' / '+entries.length+' · '+(entries[state.index]?.title||'');
   }
   setProgress();
   function setHighlight(index){
     state.highlight?.classList.remove('claude-native-speaking');
     const entry=entries[index];if(!entry)return;
     state.highlight=entry.el;
     entry.el.classList.add('claude-native-speaking');
     try{entry.el.scrollIntoView({behavior:'smooth',block:'center'});}catch{}
   }
   function updateVoices(){
     if(active!==state||!synth)return;
     const all=synth.getVoices?.()||[];
     const ko=all.filter(v=>/^ko(?:-|_|$)/i.test(v.lang));
     state.availableVoices=ko;
     const was=voiceSelect.value;
     let lastVoice='';
     try{lastVoice=localStorage.getItem(VOICE_KEY)||'';}catch{}
     voiceSelect.replaceChildren();
     if(!ko.length){
       const option=new Option('기기 기본 한국어 음성','default');
       voiceSelect.add(option);
       return;
     }
     const preferred=ko.findIndex(v=>/sunhi|seoyeon|yuna|sora|soyeon|heami|female|woman|여성|선희|서연|유나/i.test(v.name));
     const defaultIndex=preferred>=0?preferred:Math.max(0,ko.findIndex(v=>v.default));
     ko.forEach((v,i)=>{
       const option=new Option(v.name+(v.localService?' · 기기 음성':' · 온라인 음성'),String(i));
       voiceSelect.add(option);
     });
     const savedIndex=ko.findIndex(v=>v.name===lastVoice);
     voiceSelect.value=ko.some((v,i)=>String(i)===was)?was:String(savedIndex>=0?savedIndex:defaultIndex);
   }
   function handleError(ev,token){
     if(active!==state||token!==state.token)return;
     if(ev.error==='interrupted'||ev.error==='canceled')return;
     state.playing=false;state.paused=false;
     state.highlight?.classList.remove('claude-native-speaking');state.highlight=null;
     play.textContent='▶ 읽기';pause.textContent='⏸ 일시정지';
     status.textContent='음성 읽기 실패: '+(ev.error||'알 수 없는 오류')+'. 휴대전화의 한국어 TTS 설정을 확인해 주세요.';
   }
   function speakNext(token){
     if(active!==state||token!==state.token||!state.playing||state.paused)return;
     if(state.index>=state.entries.length){
       stop();try{localStorage.removeItem(POS_KEY);}catch{}
       state.status.textContent='✅ 근육학 1권 읽기가 끝났습니다.';return;
     }
     const entry=state.entries[state.index];
     if(!state.chunks.length){
       state.chunks=split(entry.text);
       state.chunk=0;
       try{localStorage.setItem(POS_KEY,String(state.index));}catch{}
       setHighlight(state.index);setProgress();
     }
     if(state.chunk>=state.chunks.length){
       state.index++;state.chunk=0;state.chunks=[];
       setTimeout(()=>speakNext(token),80);return;
     }
     const u=new SpeechSynthesisUtterance(state.chunks[state.chunk]);
     u.lang='ko-KR';u.rate=Number(rateSelect.value)||1;
     const selected=state.availableVoices[Number(voiceSelect.value)];
     if(selected)u.voice=selected;
     u.onend=()=>{
       if(token!==state.token||!state.playing||state.paused)return;
       state.chunk++;
       setTimeout(()=>speakNext(token),35);
     };
     u.onerror=ev=>handleError(ev,token);
     try{synth.speak(u);}
     catch(err){handleError({error:err?.name||'speech_api'},token);}
   }
   function startAt(index){
     if(!synth||!window.SpeechSynthesisUtterance){
       status.textContent='이 브라우저는 한국어 음성 읽기를 지원하지 않습니다. Chrome 또는 기기 TTS 설정을 확인해 주세요.';
       return;
     }
     stop();
     state.index=Math.max(0,Math.min(entries.length-1,index));
     state.chunk=0;state.chunks=[];
     state.playing=true;state.paused=false;
     state.play.textContent='↻ 처음부터';state.pause.textContent='⏸ 일시정지';
     dock.hidden=false;dockPause.textContent='⏸ 일시정지';
     const run=++state.token;
     status.textContent='🔊 기기 한국어 음성 읽기 중 · 이것은 유료 Niki 음성이 아닌 휴대전화 내장 음성입니다.';
     speakNext(run);
   }
   chapterButton.addEventListener('click',()=>{
     const selected=panelChapter();
     const idx=selected ? entries.findIndex(e=>e.el.closest('section')?.id===selected) : 0;
     startAt(Math.max(0,idx));
   });
   function panelChapter(){
     const selector=document.querySelector('#claudeNativePilotHost .claude-native-navbar select');
     return selector?.value||'';
   }
   play.addEventListener('click',()=>startAt(state.index));
   fromStart.addEventListener('click',()=>startAt(0));
   prev.addEventListener('click',()=>startAt(Math.max(0,state.index-1)));
   next.addEventListener('click',()=>startAt(Math.min(entries.length-1,state.index+1)));
   end.addEventListener('click',stop);
   dockStop.addEventListener('click',stop);
   dockPause.addEventListener('click',()=>pause.click());
   pause.addEventListener('click',()=>{
     if(active!==state||!state.playing)return;
     if(state.paused){
       state.paused=false;try{synth.resume();}catch{}
       pause.textContent='⏸ 일시정지';dockPause.textContent='⏸ 일시정지';status.textContent='🔊 다시 읽는 중';
     } else {
       state.paused=true;try{synth.pause();}catch{}
       pause.textContent='▶ 계속';dockPause.textContent='▶ 계속';status.textContent='⏸ 일시정지';
     }
   });
   voiceSelect.addEventListener('change',()=>{
     try{localStorage.setItem(VOICE_KEY,state.availableVoices[Number(voiceSelect.value)]?.name||'');}catch{}
     if(state.playing)startAt(state.index);
   });
   rateSelect.addEventListener('change',()=>{
     try{localStorage.setItem(RATE_KEY,rateSelect.value);}catch{}
     if(state.playing)startAt(state.index);
   });
   // A passage tap restarts at that sentence/figure/table, not from page top.
   shadow.addEventListener('click',ev=>{
     const el=ev.target.closest?.('[data-i], .claude-native-teaching');
     if(!el||ev.target.closest?.('a,button,select,summary'))return;
     const index=entries.findIndex(entry=>entry.el===el);
     if(index>=0)startAt(index);
   });
   window.addEventListener('pagehide',stop,{once:true});
   if(synth?.addEventListener)synth.addEventListener('voiceschanged',updateVoices);
   updateVoices();
   // Stopping playback on app navigation prevents speech continuing over a
   // different lecture/category or browser background tab.
   const lectureView=document.getElementById('diseaseTraumaOriginalView');
   const appPage=document.getElementById('diseaseTrauma');
   const navObserver=new MutationObserver(()=>{
     if(active!==state){navObserver.disconnect();return;}
     if(lectureView?.hidden||!appPage?.classList.contains('active'))stop();
   });
   if(lectureView)navObserver.observe(lectureView,{attributes:true,attributeFilter:['hidden']});
   if(appPage)navObserver.observe(appPage,{attributes:true,attributeFilter:['class']});
   state.navObserver=navObserver;
   return box;
 }
 window.LYSNativeAudio=Object.freeze({mount,stop,split});
})();
