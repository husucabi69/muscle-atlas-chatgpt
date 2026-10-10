// Claude original audio: local-file audition until R2 is connected. No upload.
(function(){
'use strict';
const LOCK=[
 {name:'클로드_근육학_01권_어깨·견갑대_1부.mp4',size:17183339,sha:'f32fd6b9e1cc3bfa376c40cfc151893e4f30e47be3e803e69eb1364560146ede'},
 {name:'클로드_근육학_01권_어깨·견갑대_2부.mp4',size:7719745,sha:'165aea41a03ed624cfc537ab1a0110f4ef67a4da7f204794b580ba59181ad4c1'}];
let active=null;
function timing(doc){
 const script=[...doc.querySelectorAll('script')].find(s=>s.textContent.trim().startsWith('window.__AUD__='));
 if(!script)throw Error('원본 음성 시간표를 찾을 수 없습니다.');
 const raw=script.textContent.trim().replace(/^window\.__AUD__\s*=\s*/,'').replace(/;\s*$/,'');
 const data=JSON.parse(raw);
 if(data.urls?.length!==2||data.t?.length!==671||data.t.some(x=>x.length!==3||![0,1].includes(x[0])||x[2]<x[1]))
  throw Error('원본 음성 시간표의 671개 항목 불일치');
 return data.t;
}
function stop(){
 if(!active)return;
 active.audio.pause();
 active.mark?.classList.remove('claude-recorded-now');
 active.mark=null; active.dock.hidden=true;
}
function isReady(){return !!active?.urls.some(Boolean);}
function mount(shadow,doc){
 if(active){stop();for(const u of active.urls)if(u)URL.revokeObjectURL(u);}
 const cues=timing(doc),box=document.createElement('section');
 box.className='claude-original-recorded';box.dataset.recordedAudio='player';
 const title=document.createElement('h3');title.textContent='🎧 Claude 원본 여성 강사 음성 (1·2부)';
 const guide=document.createElement('p');guide.textContent='구글 드라이브의 원본 MP4를 선택하면 직접 재생합니다. 파일은 서버로 전송하지 않습니다.';
 const label=document.createElement('label');label.textContent='원본 MP4 1·2부 선택 ';
 const picker=document.createElement('input');picker.type='file';picker.multiple=true;
 picker.accept='.mp4,video/mp4,audio/mp4';picker.dataset.recordedAudio='files';label.append(picker);
 const info=document.createElement('p');info.dataset.recordedAudio='file-status';
 info.textContent='먼저 1부·2부 파일을 선택해 주세요. 원본 SHA-256을 확인합니다.';
 const toolbar=document.createElement('div');toolbar.className='claude-recorded-toolbar';
 function button(text,key){const b=document.createElement('button');b.type='button';b.textContent=text;b.dataset.recordedAudio=key;return b;}
 const p1=button('▶ 1부','part1'),p2=button('▶ 2부','part2'),
   prev=button('⏮ 이전 문단','prev'),next=button('다음 문단 ⏭','next'),halt=button('⏹ 정지','stop');
 toolbar.append(p1,p2,prev,next,halt);
 const audio=document.createElement('audio');audio.controls=true;audio.preload='metadata';audio.dataset.recordedAudio='element';
 const rateLabel=document.createElement('label');rateLabel.textContent='배속 ';
 const rate=document.createElement('select');rate.dataset.recordedAudio='rate';
 for(const n of [0.85,1,1.15,1.3,1.5]){const op=new Option(n+'배',String(n));rate.add(op);}
 rate.value='1';rateLabel.append(rate);
 const status=document.createElement('p');status.dataset.recordedAudio='status';status.setAttribute('role','status');
 status.textContent='원본 파일을 선택하신 다음 ▶ 1부를 누르세요.';
 const dock=document.createElement('div');dock.className='claude-recorded-dock';dock.hidden=true;
 const dockTitle=document.createElement('strong');dockTitle.textContent='🎧 원본 음성 재생 중';
 const toggle=button('⏸','dockPause'),dockStop=button('⏹ 정지','dockStop');dock.append(dockTitle,toggle,dockStop);
 box.append(title,guide,label,info,toolbar,audio,rateLabel,status,dock);
 const state={audio,dock,urls:[null,null],part:0,mark:null,last:-1};active=state;
 const styles=document.createElement('style');styles.textContent=
 '.claude-original-recorded{background:#f4faff;border:2px solid #aacade;border-radius:14px;padding:14px;margin:12px 0;color:#16344d;line-height:1.6}'+
 '.claude-original-recorded h3{font-size:17px;margin:0 0 8px}'+
 '.claude-original-recorded p{font-size:13px;margin:7px 0}'+
 '.claude-original-recorded input{max-width:100%;display:block;margin:7px 0}'+
 '.claude-recorded-toolbar{display:flex;gap:6px;flex-wrap:wrap;margin:10px 0}'+
 '.claude-recorded-toolbar button{border:1px solid #a8bdd0;border-radius:9px;background:#fff;padding:9px 11px;color:#173a54;font-weight:750}'+
 '.claude-original-recorded audio{display:block;width:100%;margin:12px 0}'+
 '.claude-original-recorded select{border:1px solid #acbdce;border-radius:7px;padding:8px}'+
 '.claude-recorded-dock[hidden]{display:none!important}'+
 '.claude-recorded-dock{position:fixed;z-index:150;bottom:max(10px,env(safe-area-inset-bottom));left:50%;transform:translateX(-50%);background:#183b58;color:#fff;border-radius:12px;padding:10px;display:flex;gap:8px;align-items:center;width:min(95vw,500px)}'+
 '.claude-recorded-dock strong{flex:1;font-size:12px}'+
 '.claude-recorded-dock button{padding:9px;border:0;border-radius:8px;background:#fff;color:#183b58;font-weight:bold}'+
 '.claude-recorded-now{outline:3px solid #e0ac47!important;background:#fff4c0!important}';
 document.head.append(styles);
 function indexAt(sec,part){let idx=-1;for(let i=0;i<cues.length;i++){const c=cues[i];if(c[0]!==part||c[2]<=c[1])continue;if(c[1]<=sec+0.05)idx=i;else if(idx>=0)break;}return idx;}
 function mark(i){if(i<0||state.last===i)return;state.last=i;state.mark?.classList.remove('claude-recorded-now');state.mark=shadow.querySelector('[data-i="'+i+'"]');
  if(state.mark){state.mark.classList.add('claude-recorded-now');state.mark.scrollIntoView({block:'center',behavior:'smooth'});}status.textContent='원본 '+(state.part+1)+'부 · '+(i+1)+'/671문단';}
 function playPart(part,sec=0,play=true){
  const url=state.urls[part];if(!url){status.textContent='원본 '+(part+1)+'부 파일을 먼저 선택해 주세요.';return;}
  audio.pause();state.part=part;state.last=-1;
  if(audio.src!==url){audio.src=url;audio.load();}
  const seek=()=>{try{audio.currentTime=sec;}catch{}};
  if(audio.readyState>=1)seek();else audio.addEventListener('loadedmetadata',seek,{once:true});
  audio.playbackRate=Number(rate.value)||1;
  if(play){window.LYSNativeAudio?.stop();audio.play().catch(e=>status.textContent='MP4 재생 실패: '+e.message);}
 }
 function go(i){for(let x=i;x<cues.length;x++){if(cues[x][2]>cues[x][1]){playPart(cues[x][0],cues[x][1]);mark(x);return;}}}
 picker.onchange=async()=>{
  picker.disabled=true;info.textContent='원본 파일의 SHA-256 확인 중…';
  try{
   const accepted=[];
   for(const file of picker.files){
    const i=LOCK.findIndex(x=>x.name===file.name);
    if(i<0||file.size!==LOCK[i].size)throw Error('원본 파일 이름·크기 불일치: '+file.name);
    const sha=[...new Uint8Array(await crypto.subtle.digest('SHA-256',await file.arrayBuffer()))].map(b=>b.toString(16).padStart(2,'0')).join('');
    if(sha!==LOCK[i].sha)throw Error('원본 파일 해시 불일치: '+file.name);
    const url=URL.createObjectURL(file);
    if(state.urls[i])URL.revokeObjectURL(state.urls[i]);state.urls[i]=url;accepted.push(i+1);
   }
   info.textContent='✓ 원본 MP4 '+accepted.join('·')+'부 검증 PASS · 서버 전송 없음';
   if(!audio.src&&state.urls[0])playPart(0,0,false);
  }catch(e){info.textContent='⚠ '+e.message;}
  finally{picker.value='';picker.disabled=false;}
 };
 p1.onclick=()=>playPart(0);
 p2.onclick=()=>playPart(1);
 prev.onclick=()=>{let i=indexAt(audio.currentTime,state.part)-1;while(i>=0){if(cues[i][2]>cues[i][1]){go(i);break;}i--;}};
 next.onclick=()=>go(Math.max(0,indexAt(audio.currentTime,state.part)+1));
 halt.onclick=()=>{stop();try{audio.currentTime=0;}catch{}};
 toggle.onclick=()=>{if(audio.paused)audio.play().catch(()=>{});else audio.pause();};
 dockStop.onclick=stop;
 rate.onchange=()=>audio.playbackRate=Number(rate.value);
 audio.onplay=()=>{window.LYSNativeAudio?.stop();dock.hidden=false;toggle.textContent='⏸';};
 audio.onpause=()=>toggle.textContent='▶';
 audio.ontimeupdate=()=>mark(indexAt(audio.currentTime,state.part));
 audio.onended=()=>{if(state.part===0&&state.urls[1])playPart(1);else{dock.hidden=true;status.textContent='✓ 원본 음성 파트 종료';}};
 shadow.addEventListener('click',event=>{
  const target=event.target.closest?.('[data-i]');
  if(!target||!isReady()||event.target.closest?.('a,button,summary'))return;
  const i=Number(target.dataset.i);if(Number.isInteger(i)&&cues[i])go(i);
 });
 return box;
}
window.LYSClaudeRecordedAudio=Object.freeze({mount,stop,isReady,timing});
})();
