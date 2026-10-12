// LYSOS P0 global academic search. Source section ids never modify original HTML.
(function(){
'use strict';
const state={rows:[],lookup:new Map(),coverage:'LOADING',pending:null};
const norm=s=>String(s||'').toLowerCase().normalize('NFKC').replace(/\s+/g,'').replace(/[·\-_/(){}[\].,:;'"]/g,'');
const aliases={
 '호프만':['hoffmann','hoffman'],'hoffmann':['호프만','hoffman'],
 'acl':['전방십자인대','anteriorcruciateligament'],
 '전방십자인대':['acl','anteriorcruciateligament'],
 '족저근막염':['plantarfasciitis'],'plantarfasciitis':['족저근막염'],
 '극상근':['supraspinatus'],'supraspinatus':['극상근'],
 'rotatorcuff':['회전근개'],'회전근개':['rotatorcuff']
};
function hits(query,filter){
 if(filter!=='all'&&filter!=='academic_section')return[];
 const q=norm(query);if(q.length<2)return[];
 const words=[q,...(aliases[q]||[]).map(norm)],out=[];
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
function closeFocus(){bar.hidden=true;frame?.classList.remove('lysos-search-iframe')}
function checkNative(){
 const p=state.pending;if(!p||!p.section||!panel||panel.hidden)return false;
 if(Number(panel.dataset.claudeNativeLecture)!==p.number)return false;
 const sh=panel.querySelector('.claude-native-lesson')?.shadowRoot;
 const section=sh?.getElementById(p.section);
 const select=panel.querySelector('.claude-native-navbar select');
 if(!section||!select)return false;
 state.pending=null;select.value=p.section;select.dispatchEvent(new Event('change',{bubbles:true}));
 const needle=norm(p.query),targets=[...section.querySelectorAll('h1,h2,h3,h4,[data-i]')];
 const target=targets.find(el=>norm(el.textContent).includes(needle))||
  targets.find(el=>norm(el.textContent).includes(norm(p.title)))||section;
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
 const needle=norm(p.query),target=[...section.querySelectorAll('h1,h2,h3,h4,[data-i]')]
  .find(x=>norm(x.textContent).includes(needle))||section;
 requestAnimationFrame(()=>{frame.hidden=false;target.scrollIntoView({behavior:'instant',block:'start'});frame.dataset.lysosSearchTarget=p.id});
 return true;
}
if(panel)new MutationObserver(()=>{if(state.pending)checkNative()}).observe(panel,
 {childList:true,attributes:true,attributeFilter:['data-claude-native-lecture','hidden']});
frame?.addEventListener('load',()=>{if(state.pending)checkOriginal()});
if(academicView)new MutationObserver(()=>{if(academicView.hidden)closeFocus()}).observe(academicView,{attributes:true,attributeFilter:['hidden']});
window.addEventListener('popstate',()=>{if(academicView?.hidden)closeFocus()});
function open(id){
 const row=state.lookup.get(id);if(!row||!window.LYSClaudeLectureCatalog?.()?.some(x=>x.number===row.number))return false;
 if(document.documentElement.dataset.appPage==='home')ensureCurrentHomeHistory();
 closeFocus();state.pending=row.section?{id:row.id,number:row.number,section:row.section,title:row.title,
  query:document.getElementById('searchBox')?.value||row.title}:null;
 showPage('diseaseTrauma');
 const item=window.LYSClaudeLectureCatalog().find(x=>x.number===row.number);
 const category=claudeAcademicCategories.findIndex(x=>x.matches(item));
 if(category>=0)showClaudeAcademicCategory(category,false);
 window.openClaudeOriginalLecture(row.number,true);
 return true;
}
window.LYSOSAcademicSearch={hits,open,get coverage(){return state.coverage},
 get indexedLectures(){return [...new Set(state.rows.filter(x=>x.section).map(x=>x.number))]}};
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
 const count=new Set(state.rows.filter(x=>x.section).map(x=>x.number)).size;
 const info=document.getElementById('lysosAcademicSearchCoverage');
 if(info)info.textContent=state.coverage==='INDEX_UNAVAILABLE'?
  '학술 색인을 열지 못했습니다. 기존 근육·이학검사 검색은 계속 사용 가능합니다.':
  '학술 원문 세부검색 '+count+'/87강 · 87강 제목검색 가능 · 나머지 세부검색 확대 중';
 renderUnifiedSearch();
})();
})();
