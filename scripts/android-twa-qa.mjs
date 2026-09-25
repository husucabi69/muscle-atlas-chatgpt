import fs from 'node:fs';

const read = p => fs.readFileSync(p, 'utf8');
const failures = [];
const passes = [];
const check = (name, ok, detail='') => {
  (ok ? passes : failures).push({name, detail});
  console.log(`${ok ? 'PASS' : 'FAIL'} | ${name}${detail ? ' | ' + detail : ''}`);
};

const appGradle = read('android-twa/app/build.gradle');
const rootGradle = read('android-twa/build.gradle');
const manifest = read('android-twa/app/src/main/AndroidManifest.xml');
const strings = read('android-twa/app/src/main/res/values/strings.xml');
const readme = read('android-twa/README.md');

check('targetSdk 36', /targetSdk\s+36/.test(appGradle));
check('compileSdk 36', /compileSdk\s+36/.test(appGradle));
check('Application ID pinned', /applicationId\s+'kr\.co\.lysortho\.muscle'/.test(appGradle));
check('AGP 9.4.0 pinned', /version '9\.4\.0'/.test(rootGradle));
check('Android Browser Helper 2.7.3 pinned', /androidbrowserhelper:2\.7\.3/.test(appGradle));
check('AndroidX Browser 1.10.0 pinned', /androidx\.browser:browser:1\.10\.0/.test(appGradle));
check('HTTPS only', /usesCleartextTraffic="false"/.test(manifest));
check('LauncherActivity exported', /LauncherActivity[\s\S]*android:exported="true"/.test(manifest));
check('App link autoVerify enabled', /intent-filter android:autoVerify="true"/.test(manifest));
check('Expected GitHub Pages host', /android:host="husucabi69\.github\.io"/.test(manifest));
check('Expected project path prefix', /android:pathPrefix="\/muscle-atlas-chatgpt\/"/.test(manifest));
check('TWA launch URL', /https:\/\/husucabi69\.github\.io\/muscle-atlas-chatgpt\/\?source=twa/.test(strings));
check('Web asset statement present', /delegate_permission\/common\.handle_all_urls/.test(strings));
check('No native microphone permission', !/RECORD_AUDIO/.test(manifest), 'Web microphone remains browser-mediated');
check('No signing secret in project config', !/(storePassword|keyPassword|\.jks|\.keystore)/i.test(appGradle + rootGradle));
check('Root assetlinks blocker documented', /husucabi69\.github\.io\/\.well-known\/assetlinks\.json/.test(readme));

console.log('\n--- ANDROID TWA CONFIG QA SUMMARY ---');
console.log(`PASS=${passes.length} FAIL=${failures.length}`);
if (failures.length) {
  console.error(JSON.stringify(failures, null, 2));
  process.exit(1);
}
