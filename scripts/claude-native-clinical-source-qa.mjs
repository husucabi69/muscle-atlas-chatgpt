// Stage 24 clinical extension: strict source and narration identity gate.
// No original HTML edits, no invented recordings or unverified source metadata.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import crypto from 'node:crypto';

const manifest=JSON.parse(fs.readFileSync('data/claude-library-manifest-v1.json','utf8'));
const nativeReader=fs.readFileSync('scripts/claude-native-muscle-series-v1.js','utf8');
const evidence=[
 {number:14,sections:12,segments:194,tables:8,figures:0,images:0,parts:1,unsyncedCues:25},
 {number:15,sections:15,segments:500,tables:46,figures:15,images:5,parts:2,unsyncedCues:54},
 {number:16,sections:16,segments:361,tables:35,figures:13,images:5,parts:2,unsyncedCues:34},
 {number:17,sections:13,segments:282,tables:22,figures:8,images:3,parts:1,unsyncedCues:30}
];
assert.ok(nativeReader.includes('&&ELIGIBLE.has(x.number)'),
  'Auto-next must not claim native/auto TTS in an unported lesson');
assert.ok(nativeReader.includes("previousOpen(number,false)"),
  'Source-verification failure must preserve original course fallback');
assert.ok(nativeReader.includes("full.textContent!==source.textContent"),
  'Native viewer must reject altered or truncated canonical prose');
for(const spec of evidence){
 const item=manifest.lectures.find(x=>x.number===spec.number);
 assert.ok(item&&item.series==='이학적 검진·연관통', 'correct clinical lecture identity '+spec.number);
 const bytes=fs.readFileSync('claude-library/'+item.source_path);
 assert.equal(bytes.length,item.source_bytes, 'source byte identity '+spec.number);
 assert.equal(crypto.createHash('sha256').update(bytes).digest('hex'),item.source_sha256,
   'unchanged source SHA '+spec.number);
 const source=bytes.toString('utf8');
 const count=rx=>(source.match(rx)||[]).length;
 assert.equal(count(/<section\b/g),spec.sections,'source chapter identity '+spec.number);
 assert.equal(count(/<table\b/g),spec.tables,'source table identity '+spec.number);
 assert.equal(count(/<figure\b/g),spec.figures,'source figure identity '+spec.number);
 assert.equal(count(/<img\b/g),spec.images,'source image identity '+spec.number);
 if(spec.images)assert.equal(count(/<img\b[^>]*src="data:image\//g),spec.images,
    'clinical pictures must stay embedded in original HTML '+spec.number);
 const ids=[...source.matchAll(/\bdata-i="(\d+)"/g)].map(m=>Number(m[1]));
 assert.equal(ids.length,spec.segments,'original speech marker count '+spec.number);
 assert.ok(ids.every((id,i)=>id===i),'continuous original speech marker mapping '+spec.number);
 const sections=[...source.matchAll(/<section\b[^>]*id="([^"]+)"/g)].map(m=>m[1]);
 const toc=[...source.matchAll(/href="#(s\d+)"/g)].map(m=>m[1]);
 assert.equal(sections.length,spec.sections,'all chapter IDs preserved '+spec.number);
 assert.equal(toc.length,spec.sections,'each chapter visible in source TOC '+spec.number);
 assert.ok(toc.every(id=>sections.includes(id)),'all chapter links resolve '+spec.number);
 const inlineScripts=[...source.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/gi)];
 assert.equal(inlineScripts.length,spec.number===17?3:2,'unexpected dynamic quiz/assessment scripts require separate engine '+spec.number);
 if(spec.number===17)assert.equal(inlineScripts[0][1],inlineScripts[1][1],
   'wrist #17 duplicated voice map must be identical before native conversion');
 assert.ok(inlineScripts[0][1].startsWith('window.__AUD__='),
   'locked source audio map '+spec.number);
 assert.ok(inlineScripts.at(-1)[1].includes('var A=D.urls.map'),
   'only original MP4 player script may be removed from the app-owned reader '+spec.number);
 const audioMatch=inlineScripts[0][1].match(/^window\.__AUD__\s*=\s*(\{[^\n]+?\})\s*;/);
 assert.ok(audioMatch,'parseable original cue sheet '+spec.number);
 const audio=JSON.parse(audioMatch[1]);
 assert.equal(audio.urls?.length,spec.parts,'original MP4 part count '+spec.number);
 assert.equal(audio.t?.length,spec.segments,'original cue-to-markup 1:1 identity '+spec.number);
 // Do not silently inflate original MP4 coverage: some source timestamps
 // have zero duration. They are exact original placeholders, NOT synced audio.
 assert.ok(audio.t.every(t=>Array.isArray(t)&&t.length===3&&
   Number.isInteger(t[0])&&t[0]>=0&&t[0]<spec.parts&&
   Number.isFinite(t[1])&&Number.isFinite(t[2])&&t[1]>=0&&t[2]>=t[1]),
   'no malformed, reverse or out-of-range original MP4 cues '+spec.number);
 const unsynced=audio.t.filter(t=>t[2]===t[1]).length;
 assert.equal(unsynced,spec.unsyncedCues,'original missing timed narration documented '+spec.number);
 console.log('PASS | Clinical native '+spec.number+': '+spec.sections+
   ' sections, '+spec.segments+' source/cue markers, '+spec.tables+
   ' tables, '+spec.figures+' figures, '+spec.images+' embedded images, '+
   spec.parts+' original MP4 parts, '+spec.unsyncedCues+
   ' untimed source cues. Free device TTS still covers all source text; R2 playback NOT claimed');
}
console.log('CLAUDE CLINICAL NATIVE SOURCE QA | 4/4 original SHA, source cue gaps audited, TOC, academic content and image identity PASS; real Android/MP4 not claimed');
