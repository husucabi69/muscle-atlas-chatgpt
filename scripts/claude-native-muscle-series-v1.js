// Stage 24 expansion: native app reader for Claude Muscle Anatomy volumes 2–11.
// Exact canonical HTML SHA/bytes verified before DOM import; source files untouched.
// The existing volume-1 custom native lecture and every non-muscle course retain their routes.
(function(){
  'use strict';
  const ELIGIBLE=new Set([4,5,6,7,8,9,10,11,12,13]);
  const previousOpen=window.openClaudeOriginalLecture;
  const panel=document.getElementById('claudeNativePilotHost');
  const modeSwitch=document.getElementById('claudeNativeModeSwitch');
  const frame=document.getElementById('diseaseTraumaOriginalFrame');
  const view=document.getElementById('diseaseTraumaOriginalView');
  if(!panel||!frame||!view||typeof previousOpen!=='function')return;
  let generation=0;
  function clean(){
    generation++;
    window.LYSNativeAudio?.stop();
    window.LYSClaudeRecordedAudio?.stop();
    panel.hidden=true;panel.replaceChildren();
    if(modeSwitch)modeSwitch.hidden=true;
  }
  const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  function nextInSeries(number){
    const all=window.LYSClaudeLectureCatalog?.()||[];
    const current=all.find(x=>x.number===number);
    return all.find(x=>x.number===number+1&&x.series===current?.series)||null;
  }
  window.LYSClaudeSequence=Object.freeze({
    next(number){
      const next=nextInSeries(number);
      if(!next)return false;
      window.LYSClaudeAutostartNumber=next.number;
      window.openClaudeOriginalLecture(next.number,true);
      return true;
    },
    nextInSeries
  });
  async function showNative(item,token,autostart){
    const url='./claude-library/'+item.source_path;
    const response=await fetch(url,{cache:'no-store'});
    if(!response.ok)throw Error('우리 서버 원본 HTTP '+response.status);
    const bytes=await response.arrayBuffer();
    if(bytes.byteLength!==item.source_bytes)throw Error('원본 용량 검증 실패');
    const digest=await crypto.subtle.digest('SHA-256',bytes);
    const sha=[...new Uint8Array(digest)].map(x=>x.toString(16).padStart(2,'0')).join('');
    if(sha!==item.source_sha256)throw Error('원본 SHA-256 검증 실패');
    const doc=new DOMParser().parseFromString(new TextDecoder('utf-8').decode(bytes),'text/html');
    const source=doc.body?.querySelector(':scope > .wrap');
    const style=doc.head?.querySelector('style');
    if(!source||!style)throw Error('원본 학술본문 또는 디자인 누락');
    const originalCounts={
      sections:source.querySelectorAll('section').length,
      tables:source.querySelectorAll('table').length,
      figures:source.querySelectorAll('figure').length,
      images:source.querySelectorAll('img').length,
      paragraphs:source.querySelectorAll('[data-i]').length
    };
    // An interactive quiz that constructs its entire questions via scripts
    // must never be displayed as if its static shell were a complete lecture.
    if(originalCounts.sections<1||originalCounts.paragraphs<1)
      throw Error('원문 읽기 대상이 없는 동적 강의로서 원본 화면이 필요합니다');
    if(token!==generation)return;
    const lessonRoot=document.createElement('div');lessonRoot.className='claude-native-lesson';
    const shadow=lessonRoot.attachShadow({mode:'open'});
    const scopedStyle=document.createElement('style');
    scopedStyle.textContent=style.textContent.replace(/:root/g,':host')
      .replace(/\bbody\s*\{/g,'.native-original{')
      .replace(/\bhtml\s*\{/g,':host{')+
      '\n:host{display:block;max-width:100%;overflow-x:hidden;background:var(--bg,#FBF7EE);color:var(--ink,#1f1d1a)}'+
      '.native-original{max-width:100%;padding:0;margin:0;min-width:0}'+
      '.native-original .wrap{width:100%;max-width:760px;min-width:0;margin:auto;padding:0 12px}'+
      '.native-original .startall,.native-original .secplay,.native-original .player{display:none!important}'+
      '.native-original .tbl{max-width:100%;overflow-x:auto;-webkit-overflow-scrolling:touch}'+
      '.native-original table{max-width:100%}.native-original img,.native-original svg{max-width:100%;height:auto}'+
      '.native-original figure{max-width:100%}.claude-native-speaking{outline:3px solid #dd9e25!important;background:#fff1bf!important;border-radius:5px}';
    const full=document.importNode(source,true);
    if(full.textContent!==source.textContent)throw Error('원본 학술문장 누락');
    for(const t of full.querySelectorAll('table')){
      if(t.parentElement?.classList.contains('tbl'))continue;
      const wrap=document.createElement('div');wrap.className='tbl';t.replaceWith(wrap);wrap.append(t);
    }
    const page=document.createElement('div');page.className='native-original';
    page.append(full);shadow.append(scopedStyle,page);
    const nativeCounts={
      sections:shadow.querySelectorAll('section').length,
      tables:shadow.querySelectorAll('table').length,
      figures:shadow.querySelectorAll('figure').length,
      images:shadow.querySelectorAll('img').length,
      paragraphs:shadow.querySelectorAll('[data-i]').length
    };
    if(Object.keys(originalCounts).some(k=>originalCounts[k]!==nativeCounts[k]))
      throw Error('원본 그림·표·문단 수가 변했습니다.');
    const lead=document.createElement('div');lead.className='claude-native-lead';
    lead.innerHTML='<b>'+esc(item.title)+' · 우리 앱 통합 강의</b>'+
      '<p>원본 '+originalCounts.sections+'장 · 표 '+originalCounts.tables+'개 · 그림 '+originalCounts.figures+'개 · 음성용 문단 '+originalCounts.paragraphs+'개를 그대로 보존했습니다.</p>'+
      '<small>원문 용량과 SHA-256 검증 PASS · 휴대전화 무료 한국어 음성 사용</small>';
    const nav=document.createElement('div');nav.className='claude-native-navbar';
    const label=document.createElement('label');label.textContent='학습할 장 선택';
    const choose=document.createElement('select');choose.setAttribute('aria-label','강의 장 바로가기');
    const chapters=[...shadow.querySelectorAll('section[id]')].map(e=>({id:e.id,name:e.querySelector('.sechead h1,h1,h2')?.textContent?.trim()||e.id}));
    choose.innerHTML='<option value="">목차에서 장을 선택하세요</option>'+chapters.map(x=>'<option value="'+esc(x.id)+'">'+esc(x.name)+'</option>').join('');
    choose.addEventListener('change',()=>{
      const target=shadow.getElementById(choose.value);
      if(target)target.scrollIntoView({behavior:'smooth',block:'center'});
    });
    label.append(choose);nav.append(label);
    shadow.addEventListener('click',event=>{
      const anchor=event.target.closest?.('a[href^="#"]');
      if(!anchor)return;
      const id=decodeURIComponent(anchor.getAttribute('href').slice(1));
      const target=shadow.getElementById(id);
      if(target){event.preventDefault();target.scrollIntoView({behavior:'smooth',block:'center'});choose.value=id;}
    });
    const compare=document.createElement('button');compare.type='button';compare.className='pill';
    compare.textContent='원본 그대로 비교';
    compare.addEventListener('click',()=>{
      clean();previousOpen(item.number,false);
    });
    const compareRow=document.createElement('div');compareRow.className='claude-native-mode-switch';
    compareRow.append(compare);
    // Exact original educational content is already mounted; now initialize
    // the same free device-voice engine as volume 1 with variable source counts.
    const player=window.LYSNativeAudio.mount(shadow,{
      lectureNumber:item.number,title:item.title,expectedCount:originalCounts.paragraphs,
      autoStart:autostart,
      onComplete:()=>window.LYSClaudeSequence.next(item.number)
    });
    if(token!==generation)return;
    panel.replaceChildren(lead,compareRow,nav,player,lessonRoot);
    const status=document.getElementById('diseaseTraumaOriginalStatus');
    status.textContent='✓ 원본 '+item.title+' 내용·이미지·표 검증 PASS · 무료 한국어 음성';
    panel.dataset.claudeNativeLecture=String(item.number);
    // Runtime E2E reads these only AFTER original-count fidelity succeeded.
    panel.dataset.claudeNativeSections=String(originalCounts.sections);
    panel.dataset.claudeNativeTables=String(originalCounts.tables);
    panel.dataset.claudeNativeFigures=String(originalCounts.figures);
    panel.dataset.claudeNativeParagraphs=String(originalCounts.paragraphs);
  }
  async function openCourse(number,record=true){
    number=Number(number);
    if(!ELIGIBLE.has(number)){
      clean();
      return previousOpen(number,record);
    }
    clean();
    const all=window.LYSClaudeLectureCatalog?.()||[];
    const item=all.find(x=>x.number===number);
    if(!item)return previousOpen(number,record);
    selectedClaudeLectureNumber=item.number;
    document.getElementById('diseaseTraumaOriginalBreadcrumb').textContent=item.series+' › '+item.title;
    const fallback=document.getElementById('diseaseTraumaClaudeFallback');
    fallback.href=item.claude_artifact_url;fallback.hidden=true;
    document.getElementById('diseaseTraumaLoadIssue').hidden=true;
    frame.hidden=true;
    try{frame.contentWindow?.location.replace('about:blank');}catch{frame.removeAttribute('src');}
    if(modeSwitch)modeSwitch.hidden=true;
    panel.hidden=false;panel.dataset.claudeNativeLecture=String(number);
    panel.innerHTML='<div class="claude-native-loading" role="status">원본 강의의 내용·그림·표를 검증한 뒤 여는 중입니다...</div>';
    const token=++generation;
    const autoStart=window.LYSClaudeAutostartNumber===number;
    window.LYSClaudeAutostartNumber=null;
    setDiseaseTraumaView('original');
    if(record)pushAppNavigationState({lysPage:'diseaseTrauma',claudeLevel:'original',lectureNumber:number});
    try{await showNative(item,token,autoStart);}
    catch(error){
      if(token!==generation)return;
      // Fail closed: never show a shortened HTML shell as the completed course.
      panel.innerHTML='';
      const alert=document.createElement('div');alert.className='claude-native-error';
      const strong=document.createElement('strong');strong.textContent='원문 이식 검증이 완료되지 않았습니다.';
      const p=document.createElement('p');p.textContent=String(error?.message||error);
      const retry=document.createElement('button');retry.textContent='검증 가능한 원본 강의 화면으로 열기';
      retry.addEventListener('click',()=>{clean();previousOpen(number,false);});
      alert.append(strong,p,retry);panel.append(alert);
      document.getElementById('diseaseTraumaOriginalStatus').textContent='통합 이식 보류 · 원문 축약 없이 원본 비교 가능';
    }
  }
  window.LYSClaudeLectureCatalog=()=>claudeLibraryManifest?.lectures||[];
  window.openClaudeOriginalLecture=openCourse;
})();