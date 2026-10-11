// Preview-only LYSOS identity gate. A PWA rename must never cause an
// installed Android app to fork into a second installation identity.
import fs from 'node:fs';
import assert from 'node:assert/strict';
const html=fs.readFileSync('index.html','utf8');
const sw=fs.readFileSync('sw.js','utf8');
const icon=fs.readFileSync('assets/lysos-symbol.svg','utf8');
const manifest=JSON.parse(fs.readFileSync('manifest.webmanifest','utf8'));
const expected='이윤석정형외과 학술';
assert.equal(manifest.name,expected);
assert.equal(manifest.short_name,'이윤석정형외과');
assert.equal(manifest.id,'/muscle-atlas-chatgpt/','existing installed identity unchanged');
assert.equal(manifest.start_url,'./?source=pwa','existing installed start URL unchanged');
assert.equal(manifest.scope,'./','existing installed app scope unchanged');
assert.match(html,/<title>이윤석정형외과 학술<\/title>/);
assert.match(html,/<h1>이윤석정형외과 학술<\/h1>/);
assert.match(html,/id="appVersionLabel"/);
assert.match(html,/\.\/assets\/lysos-symbol\.svg/);
assert.ok(manifest.icons.some(x=>x.src==='assets/lysos-symbol.svg'&&x.type==='image/svg+xml'&&x.sizes==='any'&&String(x.purpose).includes('maskable')));
for (const sz of [192,512]) {
  const file='icon-'+sz+'.png';
  assert.ok(fs.statSync(file).size>1000,'legacy PNG fallback is retained for Android installability');
  assert.ok(manifest.icons.some(x=>x.src===file&&x.sizes===sz+'x'+sz),'must retain PNG fallback '+sz);
}
assert.match(icon,/<svg\b/);
assert.match(icon,/LYSOS/);
assert.ok(!/https?:\/\//.test(icon.replace('http://www.w3.org/2000/svg','')),'original SVG must not load an external logo');
assert.ok(sw.includes("'./assets/lysos-symbol.svg'"),'offline logo must be cached');
console.log('PASS | LYSOS academic app name, original brand SVG, stable installed-PWA identity and Android PNG fallback');
