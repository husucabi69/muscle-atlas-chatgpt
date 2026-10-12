import fs from 'node:fs';
import crypto from 'node:crypto';
import assert from 'node:assert/strict';
const data=JSON.parse(fs.readFileSync('data/lysos-global-academic-search-v1.json','utf8'));
const catalog=JSON.parse(fs.readFileSync('data/claude-library-manifest-v1.json','utf8'));
assert.equal(data.schema,'lysos-global-academic-search-v1');
assert.equal(data.rows.filter(x=>!x.section).length,87);
assert.deepEqual(data.indexedLectureNumbers,[3,15,19,28,49,52]);
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
assert.ok(fs.readFileSync('sw.js','utf8').includes('./data/lysos-global-academic-search-v1.json'));
console.log('LYSOS GLOBAL ACADEMIC SEARCH QA PASS | 87 titles, 70 exact source chapters, 6/87 original books deep-indexed');
