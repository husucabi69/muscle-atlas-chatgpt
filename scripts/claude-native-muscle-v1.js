// Stage 24 pilot: first Muscle Anatomy lecture as a REAL app-owned learning view.
// Canonical HTML remains immutable; this viewer never embeds the page in an iframe.
(function(){
  'use strict';
  const PILOT_NUMBER=3;
  const TITLE='근육학 1권 — 어깨·견갑대';
  const originalOpen=window.openClaudeOriginalLecture;
  if(typeof originalOpen!=='function')throw Error('Claude original router unavailable');
  const originalFrame=document.getElementById('diseaseTraumaOriginalFrame');
  if(!originalFrame)throw Error('Claude original host missing');
  const view=document.getElementById('diseaseTraumaOriginalView');
  const modeSwitch=document.createElement('div');
  modeSwitch.id='claudeNativeModeSwitch';
  modeSwitch.className='claude-native-mode-switch';
  modeSwitch.hidden=true;
  modeSwitch.innerHTML='<button type="button" class="primary" data-native-mode="app">우리 앱 통합 강의</button>'+
    '<button type="button" data-native-mode="original">원본 그대로 비교</button>';
  const panel=document.createElement('div');
  panel.id='claudeNativePilotHost';
  panel.className='claude-native-pilot';
  panel.hidden=true;
  panel.innerHTML='<div class="claude-native-loading" role="status">우리 앱 통합 강의를 준비하고 있습니다...</div>';
  originalFrame.before(modeSwitch);
  originalFrame.before(panel);

  let inNativeMode=false,renderToken=0;
  function switchMode(mode){
    [...modeSwitch.querySelectorAll('button')].forEach(btn=>{
      const active=btn.dataset.nativeMode===mode;
      btn.classList.toggle('active',active);
      btn.setAttribute('aria-pressed',active?'true':'false');
    });
  }
  function showError(message){
    panel.innerHTML='';
    const error=document.createElement('div');
    error.className='claude-native-error';
    const heading=document.createElement('strong');
    heading.textContent='통합 강의의 원본 검증을 완료하지 못했습니다.';
    const p=document.createElement('p');p.textContent=message;
    const btn=document.createElement('button');
    btn.textContent='검증된 원본 화면으로 보기';
    btn.onclick=()=>showOriginalComparison();
    error.append(heading,p,btn);panel.append(error);
    const status=document.getElementById('diseaseTraumaOriginalStatus');
    status.textContent='통합 강의 확인 실패 — 학습 내용을 임의로 축약하지 않고 원본 대조를 지원합니다.';
  }
  function escapeHtml(s){
    return String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  }
  // Add ONLY rigorously source-consistent explanatory reading notes.
  // These supplement source text; they do not change medical claims or evidence grades.
  const teaching={
    s1:['극상근을 임상에서 해석하는 순서','어깨 외전 때 통증과 근력 약화를 발견했다면, 먼저 통증 때문에 힘을 못 주는 상황과 실제 회전근개 기능저하를 구분해야 합니다. Empty can 또는 Full can 검사 하나가 양성이라는 이유만으로 극상근 전층파열이라고 확정할 수는 없습니다. 외회전 근력, 통증궁, 수동 운동범위와 외상 여부를 함께 본 다음, 파열이 의심되면 초음파 또는 자기공명영상을 이용해 건의 연속성과 크기를 확인합니다. 이는 아래 원문에 기술된 검사·감별·영상 평가 순서를 이해하기 쉽게 연결한 설명입니다.'],
    s4:['견갑하근의 기능과 이두건을 함께 확인하는 이유','견갑하근은 상완골두를 앞쪽에서 안정화하고 어깨의 내회전에 관여합니다. 특히 위쪽 건이 손상되면 이두건 장두를 고랑 안에 유지하는 구조도 영향을 받을 수 있습니다. 따라서 Belly-press, Bear-hug 검사에서 이상을 보았다면 이두건의 위치와 움직임을 초음파에서 함께 확인하는 것이 좋습니다. 반대로 내회전 검사에 통증만 있고 힘은 유지된다면 그 소견만으로 파열 범위를 단정하지 않아야 합니다.'],
    s8:['승모근 통증과 신경 손상을 구분하는 진찰 흐름','어깨가 처져 있고 견갑골이 정상적으로 돌지 않는 환자를 만났다면 목·어깨 통증만으로 근막통이라고 끝내지 않습니다. 목 뒤 삼각부 수술 또는 외상 병력이 있는지 묻고, 어깨 으쓱하기와 팔 외전 시 견갑골 움직임을 좌우 비교합니다. 척수부신경 손상이 의심되면 전거근·장흉신경 이상과 구별하고 필요할 때 전기진단검사를 고려합니다.'],
    s11:['익상견갑을 발견했을 때 다음 질문','벽을 밀 때 견갑골 안쪽 모서리가 돌출된다면 전거근의 기능저하를 먼저 생각할 수 있습니다. 그러나 익상견갑이 보인다는 사실만으로 장흉신경 마비가 확진되는 것은 아닙니다. 어깨를 들어 올릴 때의 견갑골 방향, 승모근과 능형근 기능, 외상·수술 병력을 함께 확인하고, 신경 병변이 의심되면 근전도검사 등으로 병변 위치를 평가합니다.'],
    s17:['진단에서 중요한 것은 한 근육이 아니라 약화의 조합','같은 어깨 근력 약화라도 극상근과 극하근이 함께 약한지, 극하근만 약한지, 삼각근까지 약한지에 따라 의심할 신경의 위치가 달라집니다. 먼저 근육별 운동기능과 감각·반사 변화를 확인하고, 신경근병증·개별 말초신경 손상·통증에 의한 억제를 구별하는 순서로 생각해 보세요. 아래 원본 표는 이러한 해부학적 국소화의 출발점이며, 단독으로 진단을 확정하는 표는 아닙니다.']
  };
  function addExpandedNotes(content){
    for(const [id,[title,body]] of Object.entries(teaching)){
      const section=content.querySelector('section#'+id);
      const heading=section?.querySelector('.sechead');
      if(!section||!heading)continue;
      const details=document.createElement('details');
      details.className='claude-native-teaching';
      if(id==='s1')details.open=true;
      const summary=document.createElement('summary');
      summary.textContent='🔎 원본 보강 해설 · '+title;
      const paragraph=document.createElement('p');
      paragraph.textContent=body;
      const foot=document.createElement('small');
      foot.textContent='이 해설은 해당 장의 기존 설명을 임상 사고 순서로 풀어쓴 보충 문장입니다. 새로운 근거 검증이나 단독 확진 기준을 뜻하지 않습니다.';
      details.append(summary,paragraph,foot);
      heading.after(details);
    }
  }
  async function renderNativePilot(item,token){
    const sourceUrl=claudeSelfHostedUrl(item);
    const fetched=await fetch(sourceUrl,{cache:'no-store'});
    if(!fetched.ok)throw Error('저장된 HTML HTTP '+fetched.status);
    const bytes=await fetched.arrayBuffer();
    if(bytes.byteLength!==item.source_bytes)throw Error('원본 바이트 길이 불일치');
    const digest=await crypto.subtle.digest('SHA-256',bytes);
    const hash=Array.from(new Uint8Array(digest),b=>b.toString(16).padStart(2,'0')).join('');
    if(hash!==item.source_sha256)throw Error('원본 SHA-256 불일치');
    const doc=new DOMParser().parseFromString(new TextDecoder('utf-8').decode(bytes),'text/html');
    const sourceWrap=doc.body?.querySelector(':scope > .wrap');
    const style=doc.head?.querySelector('style');
    if(!sourceWrap||!style)throw Error('원본 학술본문 또는 디자인 규칙을 찾지 못했습니다');
    const required={sections:19,tables:49,figures:18,images:18,paragraphs:671};
    const sourceCounts={
      sections:sourceWrap.querySelectorAll('section').length,
      tables:sourceWrap.querySelectorAll('table').length,
      figures:sourceWrap.querySelectorAll('figure').length,
      images:sourceWrap.querySelectorAll('img').length,
      paragraphs:sourceWrap.querySelectorAll('[data-i]').length
    };
    if(Object.keys(required).some(k=>sourceCounts[k]!==required[k]))
      throw Error('원본 교육요소 수가 기준과 다릅니다: '+JSON.stringify(sourceCounts));
    if(token!==renderToken)return;

    const lessonRoot=document.createElement('div');
    lessonRoot.className='claude-native-lesson';
    const shadow=lessonRoot.attachShadow({mode:'open'});
    const nativeStyle=document.createElement('style');
    // Scoped source style: :root/body rules must not alter the surrounding app.
    // The canonical source's 49 tables remain whole and become horizontally scrollable.
    nativeStyle.textContent=style.textContent.replace(/:root/g,':host')
      .replace(/\bbody\s*\{/g,'.native-original{')+
      '\n:host{display:block;background:var(--bg,#FBF7EE);color:var(--ink,#1f1d1a)}'+
      '.native-original{max-width:100%;padding:0 0 22px;margin:0}'+
      '.native-original .wrap{max-width:760px;width:100%;min-width:0;padding:0 12px;margin:auto}'+
      '.native-original .openx,.native-original .startall,.native-original .secplay{display:none!important}'+
      '.native-original .tbl{max-width:100%;overflow-x:auto;-webkit-overflow-scrolling:touch}'+
      '.native-original table{max-width:100%;}'+
      '.native-original figure{max-width:100%}'+
      '.native-original img,.native-original svg{max-width:100%;height:auto}'+
      '.claude-native-teaching{padding:16px 18px;border:1px solid #bbd6d0;border-radius:14px;background:#f0fbf8;color:#163e39;margin:18px 0;line-height:1.85}'+
      '.claude-native-teaching summary{cursor:pointer;font-weight:800;font-size:16px}'+
      '.claude-native-teaching p{margin:12px 0 8px}'+
      '.claude-native-teaching small{color:#375a54}'+
      '.claude-native-speaking{outline:3px solid #dd9e25!important;outline-offset:3px;background:#fff1bf!important;border-radius:5px}';
    const page=document.createElement('div');
    page.className='native-original';
    const originalBody=document.importNode(sourceWrap,true);
    // Full original educational prose (including tables, captions and citations)
    // must be exactly preserved before supplement-only teaching notes are added.
    if(originalBody.textContent!==sourceWrap.textContent)
      throw Error('원본 교육문장 텍스트 보존 검사 실패');
    for(const table of [...originalBody.querySelectorAll('table')]){
      if(!table.parentElement?.classList.contains('tbl')){
        const scroller=document.createElement('div');scroller.className='tbl';
        table.replaceWith(scroller);scroller.append(table);
      }
    }
    addExpandedNotes(originalBody);
    page.append(originalBody);
    shadow.append(nativeStyle,page);
    // The imported original's scripts are NOT executed; audio is currently
    // pending, so misleading legacy "play" controls are suppressed, not faked.
    const nav=document.createElement('div');nav.className='claude-native-navbar';
    const intro=document.createElement('div');
    intro.className='claude-native-lead';
    intro.innerHTML='<b>근육학 1권 · 우리 앱 통합 시범</b>'+
      '<p>원본 19장 · 표 49개 · 그림 18개 · 학습 구간 671개 전부 보존, 임상 설명형 해설 5개 추가</p>'+
      '<small>원본 SHA-256 동일성 검증 완료 · 아래 무료 기기 한국어 음성으로 듣기 · MP4 연결 대기</small>';
    const label=document.createElement('label');label.textContent='학습할 근육 또는 장 선택';
    const sel=document.createElement('select');sel.setAttribute('aria-label','강의 장 바로가기');
    const chapters=[...shadow.querySelectorAll('section[id]')].map(el=>({id:el.id,title:el.querySelector('.sechead h1')?.textContent?.trim()||el.id}));
    sel.innerHTML='<option value="">19개 장 중에서 선택하세요</option>'+chapters.map(x=>'<option value="'+escapeHtml(x.id)+'">'+escapeHtml(x.title)+'</option>').join('');
    sel.addEventListener('change',()=>{
      const target=shadow.getElementById(sel.value);
      if(target)target.scrollIntoView({behavior:'smooth',block:'start'});
    });
    label.append(sel);nav.append(label);
    // Original TOC navigation works inside Shadow DOM with app-owned handlers.
    shadow.addEventListener('click',e=>{
      const a=e.target.closest?.('a[href^="#"]');
      if(!a)return;
      let section;
      try{section=shadow.querySelector(a.getAttribute('href'));}catch{}
      if(section){e.preventDefault();section.scrollIntoView({behavior:'smooth',block:'start'});sel.value=section.id;}
    });
    if(token!==renderToken)return;
    const audioPlayer=window.LYSNativeAudio.mount(shadow);
    panel.replaceChildren(intro,nav,audioPlayer,lessonRoot);
    const countImported={
      sections:shadow.querySelectorAll('section').length,
      tables:shadow.querySelectorAll('table').length,
      figures:shadow.querySelectorAll('figure').length,
      images:shadow.querySelectorAll('img').length,
      paragraphs:shadow.querySelectorAll('[data-i]').length
    };
    if(Object.keys(required).some(k=>countImported[k]!==required[k]))
      throw Error('이식 후 원본 교육요소 수가 달라졌습니다');
    const st=document.getElementById('diseaseTraumaOriginalStatus');
    st.textContent='✓ 우리 앱 통합보기 · 원본 동일성 검증 완료 · 기기 한국어 음성 읽기 제공 · MP4 연결 대기';
  }
  async function openPilot(number,record=true){
    if(Number(number)!==PILOT_NUMBER){
      window.LYSNativeAudio?.stop();
      inNativeMode=false;renderToken++;panel.hidden=true;modeSwitch.hidden=true;
      return originalOpen(number,record);
    }
    const item=(claudeLibraryManifest?.lectures||[]).find(x=>x.number===PILOT_NUMBER);
    if(!item){return originalOpen(number,record);}
    window.LYSNativeAudio?.stop();
    inNativeMode=true;
    selectedClaudeLectureNumber=PILOT_NUMBER;
    document.getElementById('diseaseTraumaOriginalBreadcrumb').textContent='근육학 › '+TITLE;
    const fallback=document.getElementById('diseaseTraumaClaudeFallback');
    fallback.href=item.claude_artifact_url;
    fallback.hidden=true;
    const status=document.getElementById('diseaseTraumaOriginalStatus');
    const issue=document.getElementById('diseaseTraumaLoadIssue');issue.hidden=true;
    originalFrame.hidden=true;
    // Stop the original HTML's own audio if the user was comparing original
    // and now returns to the native lecture. Hidden iframes can keep playing.
    try{originalFrame.contentWindow?.location.replace('about:blank');}
    catch{originalFrame.removeAttribute('src');}
    modeSwitch.hidden=false;panel.hidden=false;switchMode('app');
    setDiseaseTraumaView('original');
    status.textContent='우리 앱 통합 근육학 1권을 여는 중입니다. 원본 SHA-256을 검증합니다.';
    if(!panel.querySelector('.claude-native-lesson')){
      panel.innerHTML='<div class="claude-native-loading" role="status">1권 원본 19개 장과 49개 표·18개 그림을 무손실 검증하고 있습니다...</div>';
      const token=++renderToken;
      try{await renderNativePilot(item,token);}
      catch(err){if(token===renderToken)showError(String(err?.message||err));}
    }
    if(!inNativeMode)return;
    setDiseaseTraumaView('original');
    if(record)pushAppNavigationState({lysPage:'diseaseTrauma',claudeLevel:'original',lectureNumber:PILOT_NUMBER});
    if(panel.querySelector('.claude-native-lesson'))status.textContent='✓ 우리 앱 통합보기 · 원본 동일성 검증 완료 · 기기 한국어 음성 읽기 제공 · MP4 연결 대기';
  }
  function showOriginalComparison(){
    window.LYSNativeAudio?.stop();
    inNativeMode=false;renderToken++;
    panel.hidden=true;modeSwitch.hidden=false;switchMode('original');
    originalOpen(PILOT_NUMBER,false);
  }
  modeSwitch.querySelector('[data-native-mode="app"]').addEventListener('click',()=>openPilot(PILOT_NUMBER,false));
  modeSwitch.querySelector('[data-native-mode="original"]').addEventListener('click',showOriginalComparison);
  window.openClaudeOriginalLecture=openPilot;
  window.addEventListener('popstate',event=>{
    if(event.state?.claudeLevel!=='original'){window.LYSNativeAudio?.stop();panel.hidden=true;}
  });
})();