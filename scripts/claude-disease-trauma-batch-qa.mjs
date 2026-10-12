// B3 disease/trauma originals #28–51. Never infer conversion from source inventory alone.
import fs from 'node:fs';
import crypto from 'node:crypto';
import assert from 'node:assert/strict';
const manifest=JSON.parse(fs.readFileSync('data/claude-library-manifest-v1.json','utf8'));
const reader=fs.readFileSync('scripts/claude-native-muscle-series-v1.js','utf8');
const counts={28:[10,103,3,9,6],29:[10,88,2,8,9],30:[12,126,3,8,6],31:[11,90,1,6,6],32:[11,86,2,8,6],33:[11,77,1,6,6],34:[10,80,2,8,7],35:[12,71,1,10,8],
  36:[11,104,2,9,6],37:[11,94,4,8,6],38:[9,69,1,8,4],39:[10,62,2,8,4],40:[9,73,2,8,3],41:[8,60,2,4,1],42:[9,62,3,5,2],
  43:[8,56,3,4,1],44:[8,53,1,6,3],45:[8,55,1,5,2],
  46:[8,55,1,5,2],47:[8,43,1,5,3],48:[8,39,1,3,1],
  49:[7,47,1,5,1],50:[10,101,3,9,4],51:[8,79,3,10,5]};
const fullView=reader.match(/const FULL_VIEW_PILOT=new Set\\(\\[([\\d,]+)\\]\\)/)?.[1].split(',').map(Number);
assert.ok(fullView&&Array.from({length:24},(_,i)=>i+28).every(id=>fullView.includes(id)),
  'all disease/trauma originals must remain immersive when B4 adds new courses');
for(const [id,expected] of Object.entries(counts)){
  const item=manifest.lectures.find(x=>x.number===Number(id));
  assert.ok(item&&item.series==='질환·외상',id+' manifest category');
  const data=fs.readFileSync('claude-library/'+item.source_path);
  assert.equal(data.byteLength,item.source_bytes,'original bytes #'+id);
  assert.equal(crypto.createHash('sha256').update(data).digest('hex'),item.source_sha256,'original SHA #'+id);
  const s=data.toString('utf8');
  assert.ok(s.includes('<div class="wrap">')&&s.includes('<style>')&&s.includes('window.__AUD__='),'academic source shape #'+id);
  assert.equal((s.match(/<script\b/g)||[]).length,2,'source scripts must remain original audio only #'+id);
  const actual=[/<section\b/g,/\bdata-i="/g,/<table\b/g,/<figure\b/g,/<img\b/g].map(re=>(s.match(re)||[]).length);
  assert.deepEqual(actual,expected,'original sections/paragraphs/tables/figures/images #'+id);
  console.log('PASS | Disease Trauma original #'+id+' '+item.title+' '+actual.join('/')+' SHA identity');
}
console.log('LYSOS B3 01–24 exact HTML source count and SHA: 24/24 PASS; installed Android pending');
