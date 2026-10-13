import fs from 'node:fs';
import crypto from 'node:crypto';
import assert from 'node:assert/strict';
const data=JSON.parse(fs.readFileSync('data/lysos-global-academic-search-v1.json','utf8'));
const catalog=JSON.parse(fs.readFileSync('data/claude-library-manifest-v1.json','utf8'));
assert.equal(data.schema,'lysos-global-academic-search-v1');
assert.equal(data.rows.filter(x=>!x.section).length,87);
assert.equal(data.indexedLectureNumbers.length,78,'78 static academic originals exactly indexed');
assert.equal(data.rows.filter(x=>x.section).length,769,'769 exact source sections');
assert.deepEqual(catalog.lectures.map(x=>x.number).filter(n=>!data.indexedLectureNumbers.includes(n)),[1,2,59,60,61,62,63,68,74],
 'interactive original pages require type-specific target adapters, not fake sections');
assert.equal(new Set(data.rows.map(x=>x.id)).size,data.rows.length);
for(const n of data.indexedLectureNumbers){
 const item=catalog.lectures.find(x=>x.number===n);
 const buffer=fs.readFileSync('claude-library/'+item.source_path);
 assert.equal(buffer.length,item.source_bytes);
 assert.equal(crypto.createHash('sha256').update(buffer).digest('hex'),item.source_sha256);
 const source=buffer.toString('utf8');
 const rows=data.rows.filter(x=>x.number===n&&x.section);
 assert.equal(rows.length,(source.match(/<section\b/gi)||[]).length,'section coverage #'+n);
 for(const row of rows){
  assert.ok(source.includes('<section id="'+row.section+'">'),'real original section '+row.id);
  assert.ok(row.title&&row.body.length>=35);
 }
}
assert.ok(data.rows.some(x=>x.number===19&&x.section&&x.body.toLowerCase().includes('hoffmann')));
const app=fs.readFileSync('index.html','utf8'),script=fs.readFileSync('scripts/lysos-global-academic-search-v1.js','utf8');
assert.ok(app.includes('option value="academic_section"')&&app.includes('LYSOSAcademicSearch?.hits')&&app.includes('LYSOSAcademicSearch?.open'));
assert.ok(script.includes('checkNative')&&script.includes('checkOriginal')&&script.includes('scrollIntoView')&&script.includes('history.back()'));
assert.ok(script.includes('function exactTarget(')&&script.includes('section td')&&script.includes('lysos-search-match'),
 'indexed clinical terms should focus and mark their actual visible source paragraph or table cell');
assert.ok(script.includes('nativeBack.textContent=\'← 검색 결과\''),
 'native lecture Back must return to the search results instead of the course contents');
assert.ok(fs.readFileSync('sw.js','utf8').includes('./data/lysos-global-academic-search-v1.json'));
assert.ok(fs.readFileSync('scripts/claude-native-muscle-v1.js','utf8').includes('panel.dataset.claudeNativeLecture=String(PILOT_NUMBER)'),
 'volume #3 must signal its rendered chapter to the global search observer');
assert.ok(script.includes('lysosSearchVolumeOneToolbar')&&script.includes('volumeOneRestore'),
 'volume #3 search must use a full-width focused reader and restore the page on Back');
// Four dynamically rendered originals: deep-link by source question index
// without changing original quiz HTML, stored answers, options or explanations.
const questionIndex=JSON.parse(fs.readFileSync('data/lysos-interactive-question-search-v1.json','utf8'));
assert.equal(questionIndex.schema,'lysos-interactive-question-search-v1');
assert.equal(questionIndex.source.length,4);
assert.equal(questionIndex.rows.length,120);
assert.equal(new Set(questionIndex.rows.map(x=>x.id)).size,120);
for(const record of questionIndex.source){
 assert.ok([59,60,61,62].includes(record.number));
 const item=catalog.lectures.find(x=>x.number===record.number);
 assert.equal(record.source_path,item.source_path);
 const raw=fs.readFileSync('claude-library/'+item.source_path);
 assert.equal(raw.length,record.source_bytes);
 assert.equal(crypto.createHash('sha256').update(raw).digest('hex'),record.source_sha256);
 const m=raw.toString('utf8').match(/const Q=(\[[\s\S]*?\]);\s*const KEY=/);
 assert.ok(m,'quiz must embed plain JSON Q in protected original '+record.number);
 const original=JSON.parse(m[1]);
 assert.equal(original.length,record.question_count);
 const rows=questionIndex.rows.filter(x=>x.number===record.number);
 assert.equal(rows.length,original.length);
 original.forEach((q,i)=>{
  assert.equal(rows[i].id,'claude:'+record.number+':q'+i);
  assert.equal(rows[i].question,q.s);assert.equal(rows[i].category,q.c);
  assert.deepEqual(rows[i].options,q.o);
 });
}
assert.ok(script.includes('function checkQuestion()')&&script.includes('lysos-search-qfocus')&&script.includes('questionLookup'));
assert.ok(fs.readFileSync('sw.js','utf8').includes('./data/lysos-interactive-question-search-v1.json'));
const oralIndex=JSON.parse(fs.readFileSync('data/lysos-interactive-case-search-v1.json','utf8'));
assert.equal(oralIndex.schema,'lysos-interactive-case-search-v1');
assert.equal(oralIndex.rows.length,30);
const oralItem=catalog.lectures.find(x=>x.number===74);
assert.equal(oralIndex.source.source_path,oralItem.source_path);
const oralRaw=fs.readFileSync('claude-library/'+oralItem.source_path);
assert.equal(oralRaw.length,oralIndex.source.source_bytes);
assert.equal(crypto.createHash('sha256').update(oralRaw).digest('hex'),oralIndex.source.source_sha256);
const oralScript=oralRaw.toString('utf8').match(/const C=(\[[\s\S]*?\]);\s*const AREAS=/);
assert.ok(oralScript,'unaltered original 74 has extractable case C data');
const oralCases=JSON.parse(oralScript[1]);assert.equal(oralCases.length,30);
oralCases.forEach((x,i)=>{
 const row=oralIndex.rows[i];
 assert.equal(row.id,'claude:74:case-v'+x.v+'-n'+x.n);
 assert.equal(row.title,x.title);assert.equal(row.area,x.area);
 assert.equal(row.prompt,x.q);
});
assert.ok(script.includes('function checkCase()')&&script.includes('caseLookup')&&script.includes('lysos-search-casefocus'));
assert.ok(fs.readFileSync('sw.js','utf8').includes('./data/lysos-interactive-case-search-v1.json'));
const audioIndex=JSON.parse(fs.readFileSync('data/lysos-interactive-audio-list-search-v1.json','utf8'));
assert.equal(audioIndex.schema,'lysos-interactive-audio-list-search-v1');
assert.equal(audioIndex.rows.length,75);
const audioItem=catalog.lectures.find(x=>x.number===68);
const audioRaw=fs.readFileSync('claude-library/'+audioItem.source_path);
assert.equal(audioRaw.length,audioIndex.source.source_bytes);
assert.equal(crypto.createHash('sha256').update(audioRaw).digest('hex'),audioIndex.source.source_sha256);
const sourceList=audioRaw.toString('utf8').match(/const D=(\{[\s\S]*?\});\s*const au=/);
assert.ok(sourceList,'source audio-list D dataset missing');
const sourceItems=JSON.parse(sourceList[1]);
assert.equal(sourceItems.items.length,75);
sourceItems.items.forEach((x,i)=>{
 const r=audioIndex.rows[i];assert.equal(r.id,'claude:68:audio-'+i);
 assert.equal(r.name,x.name);assert.equal(r.key,x.k);
});
assert.ok(script.includes('checkAudioList')&&script.includes('audioLookup')&&script.includes('원본 MP4 서버 재생 검증 전'));
assert.ok(fs.readFileSync('sw.js','utf8').includes('./data/lysos-interactive-audio-list-search-v1.json'));
console.log('LYSOS AUDIO LIST SEARCH QA PASS | 75 named tracks exact list focus, not falsely counted as hosted MP4');
console.log('LYSOS ORAL CASE DEEP LINK QA PASS | all 30/30 case titles and prompts source-locked, original exam scoring preserved');
console.log('LYSOS QUIZ QUESTION DEEP LINK QA PASS | 59-62 original quizzes, 120 verified question ids and preserved answer engines');
console.log('LYSOS GLOBAL ACADEMIC SEARCH QA PASS | 87 titles, 769 exact source chapters, 78/87 original books deep-indexed; 3 interactive source adapters pending; 59-62,68,74 source lists supported; 4 quiz banks + oral cases now supported; 4 quiz banks support 120 questions');
