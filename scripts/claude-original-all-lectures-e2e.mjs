// Browser-level navigation smoke for every byte-preserved Claude HTML lecture.
// Runs against the local static server OR exact-SHA Cloudflare Preview when
// CLAUDE_E2E_LIVE=true. Neither mode claims real Android hardware or MP4 playback.
import fs from 'node:fs';
import path from 'node:path';
import { chromium } from 'playwright';

const isLive = process.env.CLAUDE_E2E_LIVE === 'true';
let base = process.env.ATLAS_E2E_BASE_URL || 'http://127.0.0.1:4173';
if (isLive) {
  const evidence = JSON.parse(fs.readFileSync(process.env.DEPLOY_GATE_EVIDENCE || '/tmp/deploy-safety-evidence.json', 'utf8'));
  const exact = evidence.cloudflare?.exact_preview_url;
  if (evidence.result !== 'PASS' || evidence.sha !== process.env.GITHUB_SHA ||
      !/^https:\/\/[0-9a-f]{8}\.muscle-atlas-chatgpt\.pages\.dev\/?$/.test(exact || '')) {
    throw new Error('Live Chromium E2E requires exact-SHA Cloudflare Preview PASS evidence');
  }
  base = exact.replace(/\/$/, '');
}
const manifest = JSON.parse(fs.readFileSync('data/claude-library-manifest-v1.json', 'utf8'));
const lectures = manifest.lectures;
if (lectures.length !== 87 || lectures.some(x => !String(x.hosting_status).startsWith('SELF_HOSTED_'))) {
  throw new Error('Expected exactly 87 internally hosted originals');
}
const byNumber = new Map(lectures.map(x => [x.number, x]));
if (byNumber.size !== 87) throw new Error('Duplicate lecture numbers');

const outDir = isLive ? 'qa-artifacts/claude-preview-live' : 'qa-artifacts/claude-all-lectures';
fs.mkdirSync(outDir, { recursive: true });
const browser = await chromium.launch({ headless: true });
const results = [];
let categoryCounts = [];
try {
  // Every lecture is opened by the same category -> lecture -> iframe route
  // that an Android/PWA user uses, at a phone-sized viewport.
  // Run one shard per independent GitHub Actions runner, never many heavy
  // browser contexts on the same small runner. Coverage is partitioned exactly.
  // An unset shard means the legacy full 87-lecture test remains available.
  const shardCount=Number(process.env.CLAUDE_E2E_SHARD_COUNT||1);
  const shardIndex=Number(process.env.CLAUDE_E2E_SHARD_INDEX||0);
  if(!Number.isSafeInteger(shardCount)||shardCount<1||shardCount>12||
     !Number.isSafeInteger(shardIndex)||shardIndex<0||shardIndex>=shardCount)
    throw new Error('Invalid Claude E2E shard configuration '+shardIndex+'/'+shardCount);
  const viewports=[
    {label:'mobile390',width:390,height:844,isMobile:true,all:true,shardIndex,shardCount},
    ...(shardIndex===0?[{label:'desktop1280',width:1280,height:800,isMobile:false,all:false}]:[])
  ];
  for(const viewport of viewports) {
    const context = await browser.newContext({
      viewport: { width: viewport.width, height: viewport.height },
      isMobile: viewport.isMobile,
      deviceScaleFactor: 1,
      serviceWorkers: 'block'
    });
    const page = await context.newPage();
    // Scripted device-TTS stub proves our UI actually sends Korean text to a
    // speech engine. It is NOT an acoustic-quality or physical Android test.
    if (viewport.all) await page.addInitScript(() => {
      window.__lysNativeSpeechQA = [];
      let stopped=false;
      const speech={
        getVoices:()=>[{name:'QA Korean Voice',lang:'ko-KR',localService:true,default:true}],
        addEventListener:()=>{},
        cancel:()=>{stopped=true;},
        pause:()=>{},
        resume:()=>{},
        speak:u=>{
          stopped=false;
          window.__lysNativeSpeechQA.push({text:u.text,lang:u.lang,rate:u.rate});
          setTimeout(()=>{if(!stopped)u.onend?.({});},90);
        }
      };
      Object.defineProperty(window,'speechSynthesis',{value:speech,configurable:true});
      Object.defineProperty(window,'SpeechSynthesisUtterance',{
        value:class{constructor(text){this.text=text;this.lang='';this.rate=1;}},
        configurable:true
      });
    });
    const failedRequests=[];
    page.on('requestfailed',request=>{
      if(request.url().includes('/claude-library/'))failedRequests.push({url:request.url(),failure:request.failure()});
    });
    page.setDefaultTimeout(15000);
    await page.goto(base + '/', { waitUntil: 'domcontentloaded' });
    await page.locator('.tab[data-page="diseaseTrauma"]').click();
    await page.waitForFunction(() =>
      document.querySelectorAll('#claudeAcademicCategoryChooser [data-claude-academic-category]').length === 10
    );
    const seen = new Set();
    const counts = [];
    for (let category = 0; category < 10; category++) {
      await page.locator('[data-claude-academic-category="' + category + '"]').click();
      await page.waitForFunction(() => !document.getElementById('diseaseTraumaCategoryView').hidden);
      const ids = await page.locator('#claudeAcademicCourseList [data-claude-academic-lecture]')
        .evaluateAll(nodes => nodes.map(n => Number(n.dataset.claudeAcademicLecture)));
      if (!ids.length || ids.some(id => !byNumber.has(id)))
        throw new Error('Category ' + category + ' has empty or unknown items');
      counts.push(ids.length);
      for (const number of viewport.all ?
        ids.filter(number => (number-1)%viewport.shardCount===viewport.shardIndex) :
        [ids[0]]) {
        if (seen.has(number)) throw new Error('Duplicate lecture across category lists: ' + number);
        seen.add(number);
        const row = byNumber.get(number);
        console.log('CHECK | Claude lecture '+number+' shard '+shardIndex+'/'+shardCount+' start');
        const tile = page.locator('#claudeAcademicCourseList [data-claude-academic-lecture="' + number + '"]');
        if (!(await tile.textContent()).includes('우리 서버 원본'))
          throw new Error('Self-hosted status missing from tile ' + number);
        await tile.click();
        const expectedPath = '/claude-library/' + row.source_path;
        const nativePilot = number === 3;
        const nativeSeries = number >= 4 && number <= 51; // #28–51 source-locked disease/trauma native batch
        const nativeLesson = nativePilot || nativeSeries;
        try {
          if (nativePilot) {
            await page.waitForFunction(() => {
              const host=document.getElementById('claudeNativePilotHost');
              const shadow=host?.querySelector('.claude-native-lesson')?.shadowRoot;
              return !host?.hidden && shadow?.querySelectorAll('section').length===19 &&
                shadow.querySelectorAll('table').length===49 &&
                shadow.querySelectorAll('figure').length===18 &&
                shadow.querySelectorAll('img').length===18 &&
                shadow.querySelectorAll('[data-i]').length===671 &&
                shadow.querySelectorAll('.claude-native-teaching').length===5 &&
                host.querySelector('[data-recorded-audio="player"]') &&
                host.querySelector('[data-recorded-audio="files"]') &&
                host.querySelector('[data-recorded-audio="element"]') &&
                host.querySelector('[data-native-audio="player"]') &&
                host.querySelector('[data-native-audio="play"]') &&
                host.querySelector('[data-native-audio="voice"]') &&
                host.querySelector('[data-native-audio="status"]')?.textContent.includes('기기') &&
                document.getElementById('diseaseTraumaOriginalFrame').hidden &&
                document.getElementById('diseaseTraumaLoadIssue').hidden &&
                !document.getElementById('diseaseTraumaOriginalView').hidden;
            },null,{timeout:isLive?38000:20000});
          } else if(nativeSeries) {
            await page.waitForFunction(number=>{
              const host=document.getElementById('claudeNativePilotHost');
              const shadow=host?.querySelector('.claude-native-lesson')?.shadowRoot;
              return !host?.hidden&&Number(host.dataset.claudeNativeLecture)===number&&
                Number(host.dataset.claudeNativeSections)>0&&
                Number(host.dataset.claudeNativeParagraphs)>0&&
                shadow?.querySelectorAll('section').length===Number(host.dataset.claudeNativeSections)&&
                shadow.querySelectorAll('table').length===Number(host.dataset.claudeNativeTables)&&
                shadow.querySelectorAll('figure').length===Number(host.dataset.claudeNativeFigures)&&
                shadow.querySelectorAll('[data-i]').length===Number(host.dataset.claudeNativeParagraphs)&&
                !!host.querySelector('[data-native-audio="play"]')&&
                !!host.querySelector('[data-native-audio="punctuation"]')&&
                !!host.querySelector('[data-native-audio="repeat-toggle"]')&&
                !!host.querySelector('[data-native-audio="auto-next"]')&&
                document.getElementById('diseaseTraumaOriginalFrame').hidden&&
                !document.getElementById('diseaseTraumaOriginalView').hidden;
            },number,{timeout:isLive?45000:30000});
          } else await page.waitForFunction(expected => {
            try {
              const iframe = document.getElementById('diseaseTraumaOriginalFrame');
              const w = iframe.contentWindow;
              const actual=decodeURIComponent(w.location.pathname);
              return (actual===expected||actual===expected.replace(/\.html$/i,'')) &&
                !!w.document.body && (w.document.body.innerText || w.document.body.textContent || '').trim().length >= 30 &&
                w.document.title !== '원본 강의 확인 필요' &&
                !iframe.hidden && document.getElementById('diseaseTraumaLoadIssue').hidden &&
                !document.getElementById('diseaseTraumaOriginalView').hidden;
            } catch { return false; }
          }, expectedPath, { timeout: isLive ? 38000 : 20000 });
        } catch (error) {
          await page.screenshot({
            path: path.join(outDir, 'failure-' + viewport.label + '-lecture-' + number + '.png')
          }).catch(() => {});
          const details=await page.evaluate(()=>{
            const frame=document.getElementById('diseaseTraumaOriginalFrame');
            let detail={path:null,title:null,readyState:null,bodyChars:null};
            try{
              detail.path=frame?.contentWindow?.location?.pathname;
              detail.title=frame?.contentDocument?.title;
              detail.readyState=frame?.contentDocument?.readyState;
              detail.bodyChars=(frame?.contentDocument?.body?.innerText||'').length;
            }catch(e){detail.readError=String(e);}
            return {...detail,frameHidden:frame?.hidden,frameSrc:frame?.src,
              issue:document.getElementById('diseaseTraumaLoadIssue')?.innerText,
              status:document.getElementById('diseaseTraumaOriginalStatus')?.innerText};
          });
          throw new Error('Lecture ' + number + ' (' + row.title + ') failed original iframe load at ' +
            expectedPath + ': ' + String(error)+'; diagnostics='+JSON.stringify(details)+
            '; failedRequests='+JSON.stringify(failedRequests.slice(-6)));
        }
        const details = nativeLesson ? await page.locator('#claudeNativePilotHost').evaluate((host,expected)=>{
          const shadow=host.querySelector('.claude-native-lesson').shadowRoot;
          const content=shadow.querySelector('.native-original');
          return {
            pathname:'native:'+expected,title:document.getElementById('diseaseTraumaOriginalBreadcrumb')?.textContent?.trim()||'통합 강의',
            bodyCharacters:content.textContent.length,
            documentWidth:host.scrollWidth,viewportWidth:host.clientWidth,
            horizontalOverflow:host.scrollWidth>host.clientWidth+8,
            nativeIntegration:true,
            sections:shadow.querySelectorAll('section').length,
            figures:shadow.querySelectorAll('figure').length,
            tables:shadow.querySelectorAll('table').length,
            addedExplanations:shadow.querySelectorAll('.claude-native-teaching').length
          };
        },expectedPath) : await page.locator('#diseaseTraumaOriginalFrame').evaluate(frame => ({
          pathname: decodeURIComponent(frame.contentWindow.location.pathname),
          title: frame.contentDocument.title,
          bodyCharacters: (frame.contentDocument.body.innerText || frame.contentDocument.body.textContent || '').length,
          documentWidth: frame.contentDocument.documentElement.scrollWidth,
          viewportWidth: frame.contentWindow.innerWidth,
          horizontalOverflow: frame.contentDocument.documentElement.scrollWidth > frame.contentWindow.innerWidth + 8
        }));
        const fallback = await page.locator('#diseaseTraumaClaudeFallback').getAttribute('href');
        if (fallback !== row.claude_artifact_url) throw new Error('Wrong source fallback for ' + number);
        const status = await page.locator('#diseaseTraumaOriginalStatus').innerText();
        // "No original MP4" does not mean "no free device voice". The
        // original interactive compendium #1/2 now has an app-owned Korean
        // speech reader, while the original MP4 is still absent.
        if (row.audio === '없음') {
          if([1,2].includes(number)){
            // The 3.2 MB interactive source is loaded in the iframe first;
            // its separate verified responsive/voice adapter initializes
            // asynchronously only after SHA-256 verification completes.
            await page.waitForFunction(()=>{
              const host=document.getElementById('claudeCompendiumReaderHost');
              return !!host&&!host.hidden&&!!host.querySelector('[data-native-audio="play"]')&&
                +host.dataset.compendiumVoiceSegments>0;
            },null,{timeout:isLive?45000:30000});
            const hostedReader=await page.locator('#claudeCompendiumReaderHost').evaluate(host=>
              !host.hidden&&!!host.querySelector('[data-native-audio="play"]')&&
              +host.dataset.compendiumVoiceSegments>0);
            const nowStatus=await page.locator('#diseaseTraumaOriginalStatus').innerText();
            if(!hostedReader||!nowStatus.includes('무료 한국어 음성'))
              throw new Error('Compendium '+number+' needs verified interactive large reader and free voice, not fake MP4');
            // Exact-SHA live Preview must exercise REAL text zoom and reveal
            // the original, not merely check that a button was rendered.
            const controls=page.locator('#claudeCompendiumReaderHost .claude-compendium-actions button');
            const capture=()=>page.locator('#claudeCompendiumReaderHost').evaluate(host=>{
              const f=document.getElementById('diseaseTraumaOriginalFrame'),d=f.contentDocument;
              return {font:parseFloat(d.defaultView.getComputedStyle(d.body).fontSize),
                cssMedia:d.getElementById('lys-compendium-native-layout-v1')?.media,
                expanded:host.dataset.compendiumExpanded,
                margin:parseFloat(f.style.scrollMarginTop)||0,
                frameTop:f.getBoundingClientRect().top,
                sticky:document.querySelector('.header')?.getBoundingClientRect().height||0};
            });
            await controls.nth(1).click();
            const originalSize=await capture();
            await controls.nth(2).click();
            const enlarged=await capture();
            if(originalSize.cssMedia!=='not all'||originalSize.expanded!=='false'||
               enlarged.cssMedia!=='all'||enlarged.expanded!=='true'||
               !(enlarged.font>originalSize.font)||
               enlarged.margin<enlarged.sticky+10||
               enlarged.frameTop<enlarged.sticky-8||
               enlarged.frameTop>enlarged.sticky+80)
              throw new Error('Compendium '+number+' real font zoom or scroll FAIL: '+
                JSON.stringify({originalSize,enlarged}));
            await page.screenshot({path:path.join(outDir,viewport.label+'-compendium-'+number+'-large-text.png')});
            console.log('PASS | Compendium '+number+' font zoom and header-safe scroll'+
              (isLive?' exact Cloudflare Preview':' local')+
              ': '+originalSize.font+'px → '+enlarged.font+'px');
          }else if(!status.includes('원본에 음성 파일 없음'))
            throw new Error('No-original-MP4 source improperly presented for ' + number);
        }
        if (row.audio !== '없음' && row.hosting_status === 'SELF_HOSTED_HTML_MEDIA_PENDING' && !(nativePilot?status.includes('MP4 직접 선택 재생 시범'):nativeSeries?status.includes('무료 한국어 음성'):status.includes('음성 연결 대기')))
          throw new Error('Audio-pending disclaimer missing for ' + number);
        results.push({
          number, series: row.series, title: row.title, viewport: viewport.label,
          expectedSha256: row.source_sha256, fallbackMatches: true, ...details
        });
        console.log('CHECK | Claude lecture '+number+' shard '+shardIndex+'/'+shardCount+' loaded; checking audio and images');
        if (nativeLesson) {
          if(nativePilot && viewport.all){
            const recordedPicker=page.locator('#claudeNativePilotHost [data-recorded-audio="files"]');
            await recordedPicker.setInputFiles({name:'not-a-claude-source.mp4',mimeType:'video/mp4',buffer:Buffer.from('invalid original mp4')});
            await page.waitForFunction(()=>document.querySelector('#claudeNativePilotHost [data-recorded-audio="file-status"]')?.textContent.includes('⚠'));
            const recordedAudioState=await page.locator('#claudeNativePilotHost [data-recorded-audio="element"]').evaluate(a=>({paused:a.paused,src:a.getAttribute('src')}));
            if(!recordedAudioState.paused||recordedAudioState.src)
              throw new Error('Invalid MP4 must never become playable: '+JSON.stringify(recordedAudioState));
            const audioPlay=page.locator('#claudeNativePilotHost [data-native-audio="play"]');
            await audioPlay.click();
            await page.waitForFunction(()=>window.__lysNativeSpeechQA?.length>0);
            const speechQA=await page.evaluate(()=>window.__lysNativeSpeechQA[0]);
            if(!speechQA?.text||speechQA.lang!=='ko-KR'||speechQA.text.length>160)
              throw Error('Native Korean lecture audio did not send valid <=160-character Korean utterance: '+JSON.stringify(speechQA));
            await page.locator('#claudeNativePilotHost [data-native-audio="dock-stop"]').click();
            const stopped=await page.locator('#claudeNativePilotHost [data-native-audio="status"]').innerText();
            if(!stopped.includes('정지'))throw Error('Native audio stop did not update player status');
          }
          // The first non-muscle native conversion must actually speak through
          // the same local Korean voice engine; source HTML is left untouched.
          if(nativeSeries && viewport.all && (number>=14&&number<=27)){
            const prior=await page.evaluate(()=>window.__lysNativeSpeechQA?.length||0);
            await page.locator('#claudeNativePilotHost [data-native-audio="play"]').click();
            await page.waitForFunction(previous=>(window.__lysNativeSpeechQA?.length||0)>previous,prior);
            const spoken=await page.evaluate(()=>window.__lysNativeSpeechQA.at(-1));
            if(!spoken?.text||spoken.lang!=='ko-KR'||spoken.text.length>160)
              throw Error('Clinical native lecture '+number+' failed Korean TTS segment playback: '+JSON.stringify(spoken));
            await page.locator('#claudeNativePilotHost [data-native-audio="dock-stop"]').click();
            if(number===14){
              // If a valid original MP4 was previously selected in volume 1,
              // the new clinical reader must STILL allow passage-tap TTS.
              const priorTap=await page.evaluate(()=>window.__lysNativeSpeechQA?.length||0);
              await page.locator('#claudeNativePilotHost').evaluate(host=>{
                const original=window.LYSClaudeRecordedAudio;
                try{
                  window.LYSClaudeRecordedAudio={...original,isReady:()=>true,isReadyFor:()=>false};
                  host.querySelector('.claude-native-lesson').shadowRoot.querySelector('[data-i]').click();
                }finally{window.LYSClaudeRecordedAudio=original;}
              });
              await page.waitForFunction(before=>(window.__lysNativeSpeechQA?.length||0)>before,priorTap);
              await page.locator('#claudeNativePilotHost [data-native-audio="dock-stop"]').click();
            }
          }
          if(nativeSeries && viewport.all && (number>=14&&number<=27)){
            const controls=await page.locator('#claudeNativePilotHost').evaluate(host=>{
              const label=host.querySelector('.claude-native-auto-next');
              const switcher=label?.querySelector('input');
              return {hidden:label?.hidden,cssDisplay:label?getComputedStyle(label).display:null,disabled:switcher?.disabled};
            });
            if(number===27 && (!controls.hidden||controls.cssDisplay!=='none'||!controls.disabled))
              throw Error('End-of-batch clinical lecture 27 must not auto-open disease/trauma #28: '+JSON.stringify(controls));
            if(number!==27 && (controls.hidden||controls.cssDisplay==='none'||controls.disabled))
              throw Error('Clinical lecture '+number+' should offer the next native lecture: '+JSON.stringify(controls));
            if(number>=15&&number<=19){
              const visual=await page.locator('#claudeNativePilotHost').evaluate(async host=>{
                const imgs=[...host.querySelector('.claude-native-lesson').shadowRoot.querySelectorAll('img')];
                // Imported source may use loading=lazy. decode() for an image
                // far below the viewport can remain pending indefinitely;
                // force eager loading in this disposable QA DOM ONLY and cap
                // the decode check so a failed asset cannot stall CI 19 minutes.
                imgs.forEach(img=>{img.loading='eager';});
                const result=await Promise.race([
                  Promise.allSettled(imgs.map(img=>img.decode())).then(states=>({
                    timedOut:false,
                    rejected:states.filter(state=>state.status==='rejected').length
                  })),
                  new Promise(resolve=>setTimeout(()=>resolve({timedOut:true,rejected:-1}),12000))
                ]);
                return {total:imgs.length,timedOut:result.timedOut,
                  rejected:result.rejected,
                  broken:imgs.filter(img=>!img.complete||!img.naturalWidth).length,
                  sources:imgs.filter(img=>!img.complete||!img.naturalWidth).map(img=>img.currentSrc||img.src)};
              });
              if(visual.total!==({15:5,16:5,17:3,18:1,19:2}[number])||visual.timedOut||visual.rejected||visual.broken)
                throw Error('Clinical native embedded source figures failed image decode for '+number+': '+JSON.stringify(visual));
            }
          }
          const screenshot=path.join(outDir,viewport.label+'-native-muscle-'+number+'.png');
          await page.screenshot({path:screenshot,fullPage:nativePilot});
          if(details.horizontalOverflow)throw Error('Native muscle 1 overflows mobile/desktop width: '+JSON.stringify(details));
        }
        if (number === ids[0]) {
          await page.screenshot({
            path: path.join(outDir, viewport.label + '-category-' + String(category + 1).padStart(2, '0') + '.png')
          });
        }
        if (viewport.all && category === 0 && number === ids[0]) {
          // Test browser/PWA Back once; other cases use the visible return button.
          await page.goBack({ waitUntil: 'domcontentloaded' });
        } else {
          // Native audio highlights may scroll the long lecture far down.
          // Center the actual return button below the app's sticky header.
          await page.locator('#diseaseTraumaOriginalView .region-back').evaluate(el=>el.scrollIntoView({block:'center',behavior:'instant'}));
          await page.locator('#diseaseTraumaOriginalView .region-back').click();
        }
        await page.waitForFunction(() => !document.querySelector('#diseaseTraumaCategoryView').hidden);
        console.log('PASS | Claude lecture '+number+' shard '+shardIndex+'/'+shardCount+' full interaction');
      }
      // The next category tile lives on the preceding screen, not below
      // this list: return to the ten-category root before continuing.
      await page.locator('#diseaseTraumaCategoryView .region-back').click();
      await page.waitForFunction(() => !document.querySelector('#diseaseTraumaRootView').hidden);
    }
    if (viewport.all) {
      categoryCounts = counts;
      if (counts.reduce((a, b) => a + b, 0) !== 87)
        throw new Error('Category index incomplete: counts=' + counts.join(','));
      const expected = lectures.filter(row => (row.number-1)%viewport.shardCount===viewport.shardIndex).length;
      if (seen.size !== expected)
        throw new Error('Mobile shard '+viewport.shardIndex+' incomplete: '+seen.size+'/'+expected);
    }
    await context.close();
  }
  // A passing shard must contain exactly its assigned original lecture IDs.
  // In the matrix, every shard must PASS before the deployment gate can run.
  const mobileResults=results.filter(x=>x.viewport==='mobile390');
  const mobileIds=new Set(mobileResults.map(x=>x.number));
  const expectedIds=lectures.filter(row=>(row.number-1)%shardCount===shardIndex).map(row=>row.number);
  const desktopResults=results.filter(x=>x.viewport==='desktop1280');
  if(mobileResults.length!==expectedIds.length ||
     mobileIds.size!==expectedIds.length ||
     expectedIds.some(number=>!mobileIds.has(number)) ||
     desktopResults.length!==(shardIndex===0?10:0) ||
     new Set(desktopResults.map(x=>x.number)).size!==desktopResults.length) {
    throw new Error('Shard coverage failed: '+JSON.stringify({
      shardIndex,shardCount,expected:expectedIds,
      opened:mobileResults.map(x=>x.number),desktop:desktopResults.map(x=>x.number)
    }));
  }
  const report = {
    test: (isLive ? 'exact-SHA live Cloudflare Preview' : 'local static server') + ' Chromium category -> original iframe navigation',
    sourceCommit: process.env.GITHUB_SHA || null,
    shardIndex,shardCount,
    expectedMobileLectures:expectedIds.length,
    checkedAt: new Date().toISOString(),
    mobileLecturesOpened: results.filter(x => x.viewport === 'mobile390').length,
    desktopRepresentativeLecturesOpened: results.filter(x => x.viewport === 'desktop1280').length,
    categoryCounts,
    remotePreviewVerified: isLive,
    physicalAndroidVerified: false,
    originalMp4PlaybackVerified: false,
    knownHorizontalOverflows: results.filter(x => x.horizontalOverflow).map(x => ({
      number: x.number, viewport: x.viewport, documentWidth: x.documentWidth, viewportWidth: x.viewportWidth
    })),
    results
  };
  fs.writeFileSync(path.join(outDir, 'report.json'), JSON.stringify(report, null, 2) + '\n');
  console.log('PASS | Claude original ' + (isLive ? 'exact-SHA live Preview' : 'local') + ' browser navigation: ' + report.mobileLecturesOpened +
    '/'+report.expectedMobileLectures+' mobile (shard '+shardIndex+'/'+shardCount+') + ' + report.desktopRepresentativeLecturesOpened +
    '/10 desktop representative; categories=' + categoryCounts.join(','));
  console.log('INFO | Inner-HTML horizontal overflows: ' + report.knownHorizontalOverflows.length +
    ' (recorded, not claimed to be repaired)');
} finally {
  await browser.close();
}
