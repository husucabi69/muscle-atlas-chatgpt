// LYSOS P0 global academic search. Source section ids never modify original HTML.
(function(){
'use strict';
const state={rows:[],lookup:new Map(),questionRows:[],questionLookup:new Map(),coverage:'LOADING',questionCoverage:'LOADING',pending:null};
const norm=s=>String(s||'').toLowerCase().normalize('NFKC').replace(/\s+/g,'').replace(/[·\-_/(){}[\].,:;'"]/g,'');
const aliases={
 '호프만':['hoffmann','hoffman'],'hoffmann':['호프만','hoffman'],
 'acl':['전방십자인대','anteriorcruciateligament'],
 '전방십자인대':['acl','anteriorcruciateligament'],
 '족저근막염':['plantarfasciitis'],'plantarfasciitis':['족저근막염'],
 '극상근':['supraspinatus'],'supraspinatus':['극상근'],
 'rotatorcuff':['회전근개'],'회전근개':['rotatorcuff']
};
function terms(query){const q=norm(query);return [...new Set([q,...(aliases[q]||[]).map(norm)])].filter(Boolean)}
// Prefer the smallest visible source element instead of landing at an entire chapter
// when the search match occurs in a table, caption, nested paragraph, or alias.
function exactTarget(section,query,title){
 const nodes=[...section.querySelectorAll('h1,h2,h3,h4,[data-i],p,li,td,th,figcaption,dt,dd,blockquote')];
 const items=nodes.map((el,i)=>({el,i,value:norm(el.textContent)}));
 for(const term of terms(query)){
  const candidates=items.filter(x=>x.value.includes(term));
  if(candidates.length)return candidates.sort((a,b)=>a.value.length-b.value.length||a.i-b.i)[0].el;
 }
 return items.find(x=>x.value.includes(norm(title)))?.el||section;
}
function markTarget(section,target){
 section.querySelectorAll('.lysos-search-match').forEach(el=>el.classList.remove('lysos-search-match'));
 target.classList.add('lysos-search-match');
}
function hits(query,filter){
 if(filter!=='all'&&filter!=='academic_section')return[];
 const q=norm(query);if(q.length<2)return[];
 const words=terms(query),out=[];
 for(const r of state.rows){
  const body=norm(r.body),title=norm(r.title);
  const match=words.find(t=>t&&body.includes(t));
  if(!match)continue;
  const heading=(r.heads||[]).find(h=>words.some(t=>norm(h).includes(t)))||'';
  const t=heading||r.title,score=12+(heading?105:0)+(words.some(x=>title.includes(x))?65:0)+
    (r.section?20:0)+(words.some(x=>title===x||norm(heading)===x)?110:0);
  const at=body.indexOf(match);
  const snippet=r.body.slice(Math.max(0,at-20),Math.min(r.body.length,at+105));
  out.push({type:'academic_section',id:r.id,title:t,
    subtitle:'강의 '+r.number+'번 · '+(r.section||'원본 전체')+
     (r.section?' · 해당 원문 바로가기':' · 세부 위치 이동 미지원')+' · '+snippet,score});
 }
 for(const r of state.questionRows){
  const stem=norm(r.question),choiceText=norm((r.options||[]).join(' '));
  if(!words.some(t=>stem.includes(t)||choiceText.includes(t)))continue;
  const priority=words.some(t=>stem.includes(t));
  const starts=words.some(t=>stem.startsWith(t));
  out.push({type:'academic_section',id:r.id,
   title:'문제은행 '+(r.number-58)+'권 · '+(r.index+1)+'번 · '+r.question,
   subtitle:'강의 '+r.number+'번 · '+r.category+' · 실제 문제로 바로가기 · 원본 자동채점·해설 유지',
   score:45+(priority?80:0)+(starts?55:0)});
 }
 return out.sort((a,b)=>b.score-a.score||a.id.localeCompare(b.id)).slice(0,35);
}
const style=document.createElement('style');style.textContent=
 '.lysos-search-focusbar[hidden]{display:none!important}'+
 '.lysos-search-focusbar{position:fixed;top:0;left:0;right:0;min-height:58px;z-index:121;background:#102d42;color:#fff;padding:6px 10px;display:flex;align-items:center;gap:10px}'+
 '.lysos-search-focusbar button{background:#fff;color:#102d42;border:0;border-radius:9px;padding:10px;min-height:40px}'+
 '.lysos-search-focusbar strong{min-width:0;flex:1;overflow:hidden;white-space:nowrap;text-overflow:ellipsis}'+
 '#diseaseTraumaOriginalFrame.lysos-search-iframe{position:fixed!important;inset:58px 0 0!important;z-index:120!important;width:100vw!important;height:calc(100dvh - 58px)!important;border:0!important;border-radius:0!important}'+
 '.claude-native-chapter-focus .native-original h1,.claude-native-chapter-focus .native-original h2,.claude-native-chapter-focus .native-original h3,.claude-native-chapter-focus .native-original [data-i]{scroll-margin-top:158px!important}';
document.head.append(style);
const bar=document.createElement('div');bar.id='lysosSearchFocusbar';bar.className='lysos-search-focusbar';
bar.hidden=true;const back=document.createElement('button');back.textContent='← 검색 결과';back.type='button';
back.addEventListener('click',()=>history.back());const label=document.createElement('strong');bar.append(back,label);document.body.append(bar);
const panel=document.getElementById('claudeNativePilotHost'),frame=document.getElementById('diseaseTraumaOriginalFrame');
const academicView=document.getElementById('diseaseTraumaOriginalView');
let volumeOneRestore=null;
// Original quiz JS owns answer state and grading. We only focus its existing
// question element, never recreate answer buttons or rewrite the source HTML.
function checkQuestion(){
 const p=state.pending;if(!p||p.kind!=='question'||!frame)return false;
 let doc;
 try{
  doc=frame.contentDocument;
  const item=(window.LYSClaudeLectureCatalog?.()||[]).find(x=>x.number===p.number);
  const actual=decodeURI(frame.contentWindow.location.pathname);
  const expected='/claude-library/'+item?.source_path;
  if(!doc||!item||(actual!==expected&&actual!==expected.replace(/\.html$/i,'')))return false;
  // Filter controls only change which cards are displayed; grading answers
  // remain inside the original quiz localStorage and are never overwritten.
  const all=doc.querySelector('#filters .chip[data-c="전체"]');
  if(all&&all.getAttribute('aria-pressed')!=='true')all.click();
  const wrong=doc.getElementById('wrongOnly');
  if(wrong?.getAttribute('aria-pressed')==='true')wrong.click();
  const findCard=()=>[...doc.querySelectorAll('#list .q')].find(x=>
   x.querySelector('.qn')?.textContent?.trim()===(p.index+1)+'번');
  const card=findCard();if(!card)return false;
  if(!doc.getElementById('lysosSearchQuestionStyle')){
   const st=doc.createElement('style');st.id='lysosSearchQuestionStyle';
   st.textContent='.lysos-search-qfocus{outline:4px solid #d99427!important;outline-offset:3px;border-radius:12px!important;scroll-margin-top:12px!important}';
   doc.head.append(st);
  }
  doc.querySelectorAll('.lysos-search-qfocus').forEach(x=>x.classList.remove('lysos-search-qfocus'));
  card.classList.add('lysos-search-qfocus');
  state.pending=null;label.textContent='문제은행 '+(p.number-58)+'권 · '+(p.index+1)+'번';
  bar.hidden=false;frame.classList.add('lysos-search-iframe');
  requestAnimationFrame(()=>{
   if(!frame.isConnected)return;
   frame.hidden=false;card.scrollIntoView({behavior:'instant',block:'start'});
   frame.dataset.lysosSearchTarget=p.id;
  });
  return true;
 }catch(e){console.warn('LYSOS quiz source focus unavailable',e);return false}
}

function closeFocus(){
 bar.hidden=true;frame?.classList.remove('lysos-search-iframe');
 if(volumeOneRestore){
  panel?.classList.remove('claude-native-chapter-focus','claude-native-chapter-voice-open');
  panel?.querySelector('#lysosSearchVolumeOneToolbar')?.remove();
  document.documentElement.style.overflow=volumeOneRestore.html;
  document.body.style.overflow=volumeOneRestore.body;
  volumeOneRestore=null;
 }
}
function checkNative(){
 const p=state.pending;if(!p||!p.section||!panel||panel.hidden)return false;
 if(Number(panel.dataset.claudeNativeLecture)!==p.number)return false;
 const sh=panel.querySelector('.claude-native-lesson')?.shadowRoot;
 const section=sh?.getElementById(p.section);
 const select=panel.querySelector('.claude-native-navbar select');
 // Shadow-root styles are separate from outer CSS. Keep the exact hit visible
 // below the app-owned 53px focus bar and 53px chapter selector.
 if(sh&&!sh.getElementById('lysosSearchScrollMargin')){
  const st=document.createElement('style');st.id='lysosSearchScrollMargin';
  st.textContent='section h1,section h2,section h3,section h4,section [data-i],section p,section li,section td,section th,section figcaption,section dt,section dd{scroll-margin-top:158px!important}'+
   '.lysos-search-match{outline:3px solid #d99427!important;outline-offset:3px;border-radius:4px}';
  sh.append(st);
 }
 if(!section||!select)return false;
 // The approved #3 reader predates the #4–58 fullscreen toolbar; give search
 // hits an equally direct full-width reading route without touching source HTML.
 if(p.number===3&&!volumeOneRestore){
  volumeOneRestore={html:document.documentElement.style.overflow,body:document.body.style.overflow};
  document.documentElement.style.overflow='hidden';document.body.style.overflow='hidden';
  panel.classList.add('claude-native-chapter-focus');
  const toolbar=document.createElement('div');toolbar.id='lysosSearchVolumeOneToolbar';
  toolbar.className='claude-native-chapter-focusbar';
  const exit=document.createElement('button');exit.type='button';exit.textContent='← 검색 결과';
  const title=document.createElement('strong');title.textContent='검색: '+p.query;
  const voice=document.createElement('button');voice.type='button';voice.textContent='🔊 음성';
  voice.addEventListener('click',()=>{
   const opened=panel.classList.toggle('claude-native-chapter-voice-open');
   voice.textContent=opened?'✕ 음성 접기':'🔊 음성';
   if(opened)panel.querySelector('.claude-native-audio')?.scrollIntoView({behavior:'instant',block:'start'});
  });
  toolbar.append(exit,title,voice);panel.prepend(toolbar);
 }
 state.pending=null;select.value=p.section;select.dispatchEvent(new Event('change',{bubbles:true}));
 const target=exactTarget(section,p.query,p.title);
 markTarget(section,target);
 // A result opened from Search should return to Search, not to the course TOC.
 const nativeBack=panel.querySelector('.claude-native-chapter-focusbar button');
 if(nativeBack&&!nativeBack.dataset.lysosSearchBack){
  nativeBack.dataset.lysosSearchBack='1';nativeBack.textContent='← 검색 결과';
  nativeBack.addEventListener('click',event=>{
   event.preventDefault();event.stopImmediatePropagation();history.back();
  },{capture:true});
 }
 requestAnimationFrame(()=>{
  if(panel.hidden||Number(panel.dataset.claudeNativeLecture)!==p.number)return;
  target.scrollIntoView({behavior:'instant',block:'start'});
  panel.dataset.lysosSearchTarget=p.id;
 });
 return true;
}
function checkOriginal(){
 const p=state.pending;if(!p||!p.section||!frame)return false;
 let doc,section;
 try{
  doc=frame.contentDocument;section=doc?.getElementById(p.section);
  const item=(window.LYSClaudeLectureCatalog?.()||[]).find(x=>x.number===p.number);
  const actual=decodeURI(frame.contentWindow.location.pathname),expected='/claude-library/'+item?.source_path;
  if(!section||!doc.body||doc.title==='원본 강의 확인 필요'||
   (actual!==expected&&actual!==expected.replace(/\.html$/i,'')))return false;
 }catch{return false}
 state.pending=null;label.textContent=p.title;bar.hidden=false;frame.classList.add('lysos-search-iframe');
 if(doc.head&&!doc.getElementById('lysosSearchIframeStyle')){
  const st=doc.createElement('style');st.id='lysosSearchIframeStyle';
  st.textContent='h1,h2,h3,h4,[data-i],p,li,td,th,figcaption,dt,dd{scroll-margin-top:80px!important}'+
   '.lysos-search-match{outline:3px solid #d99427!important;outline-offset:3px;border-radius:4px}';
  doc.head.append(st);
 }
 const target=exactTarget(section,p.query,p.title);
 markTarget(section,target);
 requestAnimationFrame(()=>{frame.hidden=false;target.scrollIntoView({behavior:'instant',block:'start'});frame.dataset.lysosSearchTarget=p.id});
 return true;
}
if(panel)new MutationObserver(()=>{if(state.pending)checkNative()}).observe(panel,
 {childList:true,attributes:true,attributeFilter:['data-claude-native-lecture','hidden']});
frame?.addEventListener('load',()=>{if(state.pending){checkQuestion();checkOriginal()}});
if(academicView)new MutationObserver(()=>{if(academicView.hidden)closeFocus()}).observe(academicView,{attributes:true,attributeFilter:['hidden']});
window.addEventListener('popstate',event=>{
 if(event.state?.lysPage!=='diseaseTrauma'||academicView?.hidden)closeFocus();
});
function open(id){
 const row=state.lookup.get(id)||state.questionLookup.get(id);
 if(!row||!window.LYSClaudeLectureCatalog?.()?.some(x=>x.number===row.number))return false;
 if(document.documentElement.dataset.appPage==='home')ensureCurrentHomeHistory();
 closeFocus();state.pending=state.questionLookup.has(id)?{
  kind:'question',id:row.id,number:row.number,index:row.index,question:row.question
 }:row.section?{id:row.id,number:row.number,section:row.section,title:row.title,
  query:document.getElementById('searchBox')?.value||row.title}:null;
 showPage('diseaseTrauma');
 const item=window.LYSClaudeLectureCatalog().find(x=>x.number===row.number);
 const category=claudeAcademicCategories.findIndex(x=>x.matches(item));
 if(category>=0)showClaudeAcademicCategory(category,false);
 window.openClaudeOriginalLecture(row.number,true);
 return true;
}
window.LYSOSAcademicSearch={hits,open,get coverage(){return state.coverage},
 get indexedLectures(){return [...new Set(state.rows.filter(x=>x.section).map(x=>x.number))]},
 get indexedQuestions(){return state.questionRows.length}};
(async()=>{
 try{
  const response=await fetch('./data/lysos-global-academic-search-v1.json',{cache:'no-cache'});
  if(!response.ok)throw Error('HTTP '+response.status);
  const data=await response.json();
  if(data.schema!=='lysos-global-academic-search-v1'||!Array.isArray(data.rows)||
     data.rows.filter(x=>!x.section).length!==87||
     new Set(data.rows.map(x=>x.id)).size!==data.rows.length)throw Error('incomplete academic index');
  state.rows=data.rows;state.lookup=new Map(data.rows.map(x=>[x.id,x]));state.coverage=data.coverage;
 }catch(e){state.coverage='INDEX_UNAVAILABLE';console.warn('Academic index not ready',e)}
 try{
  const qr=await fetch('./data/lysos-interactive-question-search-v1.json',{cache:'no-cache'});
  if(!qr.ok)throw Error('Question index HTTP '+qr.status);
  const q=await qr.json();
  if(q.schema!=='lysos-interactive-question-search-v1'||q.rows?.length!==120||q.source?.length!==4||
   new Set(q.rows.map(x=>x.id)).size!==120)throw Error('Incomplete question source index');
  state.questionRows=q.rows;state.questionLookup=new Map(q.rows.map(x=>[x.id,x]));
  state.questionCoverage='59-62 / 120';
 }catch(e){state.questionCoverage='UNAVAILABLE';console.warn('Quiz question index unavailable',e)}
 const count=new Set(state.rows.filter(x=>x.section).map(x=>x.number)).size;
 const info=document.getElementById('lysosAcademicSearchCoverage');
 if(info)info.textContent=state.coverage==='INDEX_UNAVAILABLE'?
  '학술 색인을 열지 못했습니다. 기존 근육·이학검사 검색은 계속 사용 가능합니다.':
  '학술 원문 세부검색 '+count+'/87강 · 문제은행 개별문항 '+state.questionRows.length+'/120개 · 87강 제목검색 가능';
 renderUnifiedSearch();
})();
})();
