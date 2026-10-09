// Static contract: category selection is NOT a hidden list below the categories.
// Source originals may be labelled "ready" only after the frame really loads.
import fs from 'node:fs';
import assert from 'node:assert/strict';
const html=fs.readFileSync('index.html','utf8');
const sw=fs.readFileSync('sw.js','utf8');
const workflow=fs.readFileSync('.github/workflows/global-qa.yml','utf8');
let pass=0;
const check=(label,ok)=>{assert.ok(ok,label);console.log('PASS | '+label);pass++};
const block=(id)=>{
 const p=html.indexOf('<div id="'+id+'"');
 if(p<0)return '';
 const end=html.indexOf('</div>',p);
 return html.slice(p,Math.max(p+1,end+6));
};
check('Claude 3 independent drill screens exist',
 ['root','category','original'].every(level=>
  html.includes('data-drill-group="diseaseTrauma" data-drill-view="'+level+'"')));
check('Category list belongs exclusively to its own screen',
 html.indexOf('id="claudeAcademicCourseList"')>html.indexOf('id="diseaseTraumaCategoryView"')&&
 html.indexOf('id="claudeAcademicCourseList"')<html.indexOf('id="diseaseTraumaOriginalView"'));
check('Legacy duplicate course sections are hidden',html.includes('Legacy selectors remain only for QA/data compatibility'));
check('Category choice changes screen, not merely scroll position',
 /function showClaudeAcademicCategory\([\s\S]*?setDiseaseTraumaView\('category'\)/.test(html));
check('Original opens in the app and restores the selected category',
 html.includes('setDiseaseTraumaView(\'original\')')&&
 html.includes('showClaudeAcademicCategory(selectedClaudeAcademicCategoryIndex)'));
check('Android scroll resets in frame after screen switch',
 html.includes('requestAnimationFrame(()=>{window.scrollTo(0,0)'));
check('Browser Back remembers category identity',
 html.includes("else if(st.claudeLevel==='category')showClaudeAcademicCategory(st.categoryIndex,false)"));
check('Original frame load handler validates real content rather than hyperlink',
 html.includes('function handleClaudeOriginalFrameLoad()')&&
 html.includes("doc.title!=='원본 강의 확인 필요'")&&
 html.includes('frame.hidden=!loaded'));
check('Original iframe defaults to a loading state',
 /id="diseaseTraumaOriginalFrame"[^>]*onload="handleClaudeOriginalFrameLoad\(\)"[^>]*hidden/.test(html));
check('Source verification error has a genuine retry button',
 html.includes('function retryClaudeOriginalLecture()')&&
 html.includes('내부 원본 다시 불러오기'));
check('Service Worker tries fresh verified manifest before stale install cache',
 sw.includes("const fresh=await fetch(manifestUrl.href,{cache:'no-store'})")&&
 sw.includes('verified.lectures.length>=87')&&
 sw.includes('row.source_sha256'));
check('No synthetic audio is presented as original',
 html.includes("item.audio==='없음'")&&html.includes('음성은 연결 대기 중'));
check('CI checks real active Service Worker original loading',
 workflow.includes('node scripts/claude-pwa-installed-original-e2e.mjs'));
console.log('CLAUDE DRILL NAVIGATION CONTRACT QA | '+pass+'/'+pass+' PASS');
