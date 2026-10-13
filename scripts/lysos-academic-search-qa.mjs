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
 const m=raw.toString('utf8').match(/const Q=(\\[[\\s\\S]*?\\]);\\s*const KEY=/);
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
console.log('LYSOS QUIZ QUESTION DEEP LINK QA PASS | 59-62 original quizzes, 120 verified question ids and preserved answer engines');
console.log('LYSOS GLOBAL ACADEMIC SEARCH QA PASS | 87 titles, 769 exact source chapters, 78/87 original books deep-indexed; 9 interactive source adapters pending');
