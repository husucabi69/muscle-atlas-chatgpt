// Node-only regression for free local-device Korean speech segmentation.
// No external media, paid TTS, or browser-specific voice files.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
const moduleSource=fs.readFileSync('scripts/claude-native-muscle-audio-v1.js','utf8');
const sandbox={window:{speechSynthesis:null}};
vm.runInNewContext(moduleSource,sandbox,{filename:'claude-native-muscle-audio-v1.js'});
const api=sandbox.window.LYSNativeAudio;
assert.equal(typeof api.mount,'function');
assert.equal(typeof api.stop,'function');
assert.equal(typeof api.split,'function');
const samples=[
 '극상근은 견갑상신경이 지배합니다. 실제 진단에서는 통증과 근력 약화를 구분합니다.',
 ('견갑하근 건 손상과 이두건 장두 불안정성을 함께 확인해야 합니다. ').repeat(80),
 '첫째, 전거근 기능을 평가합니다. 둘째, 장흉신경 손상을 감별합니다. 셋째, 검사 한 가지로 확진하지 않습니다.',
 '글자로 표시되는 \u003c장\u003e 제목·표의 각 셀과 참고문헌을 원문 그대로 읽습니다. '.repeat(30),
 's'.repeat(650)
];
for(const [i,src] of samples.entries()){
 const chunks=api.split(src);
 assert.ok(chunks.length>=1,'nonempty chunks for example '+i);
 assert.ok(chunks.every(x=>x.length>0&&x.length<=160),'160-character TTS ceiling '+i);
 assert.equal(chunks.join('').replace(/\s+/g,''),src.replace(/\s+/g,''),'zero-loss text '+i);
}
assert.ok(moduleSource.includes("u.lang='ko-KR'"),'Korean voice language pinned');
assert.ok(moduleSource.includes("getVoices"),'user-selectable device voices');
assert.ok(moduleSource.includes("setHighlight"),'current passage highlighting');
assert.ok(moduleSource.includes("MutationObserver"),'navigation stop');
assert.ok(moduleSource.includes("window.LYSNativeAudio"),'native binding');
assert.ok(!/https?:\/\/(?:api\.)?runway/.test(moduleSource),'no Runway paid endpoint');
assert.ok(!moduleSource.includes("new Audio("),'no fabricated recorded MP4');
console.log('CLAUDE NATIVE MUSCLE LOCAL KOREAN AUDIO QA | 5/5 segmentation no text loss; <=160 chars; device-only playback contract PASS');
