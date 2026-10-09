// Browser-level navigation smoke for every byte-preserved Claude HTML lecture.
// Runs against the local static server in runtime-navigation-e2e; does NOT claim
// that remote Cloudflare Preview, real Android hardware or MP4 playback passed.
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
  for (const viewport of [
    { label: 'mobile390', width: 390, height: 844, isMobile: true, all: true },
    { label: 'desktop1280', width: 1280, height: 800, isMobile: false, all: false }
  ]) {
    const context = await browser.newContext({
      viewport: { width: viewport.width, height: viewport.height },
      isMobile: viewport.isMobile,
      deviceScaleFactor: 1,
      serviceWorkers: 'block'
    });
    const page = await context.newPage();
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
      const ids = await page.locator('#claudeAcademicCourseList [data-claude-academic-lecture]')
        .evaluateAll(nodes => nodes.map(n => Number(n.dataset.claudeAcademicLecture)));
      if (!ids.length || ids.some(id => !byNumber.has(id)))
        throw new Error('Category ' + category + ' has empty or unknown items');
      counts.push(ids.length);
      for (const number of viewport.all ? ids : [ids[0]]) {
        if (seen.has(number)) throw new Error('Duplicate lecture across category lists: ' + number);
        seen.add(number);
        const row = byNumber.get(number);
        const tile = page.locator('#claudeAcademicCourseList [data-claude-academic-lecture="' + number + '"]');
        if (!(await tile.textContent()).includes('우리 서버 원본'))
          throw new Error('Self-hosted status missing from tile ' + number);
        await tile.click();
        const expectedPath = '/claude-library/' + row.source_path;
        await page.waitForFunction(expected => {
          try {
            const iframe = document.getElementById('diseaseTraumaOriginalFrame');
            const w = iframe.contentWindow;
            return decodeURIComponent(w.location.pathname) === expected &&
              !!w.document.body && (w.document.body.innerText || w.document.body.textContent || '').trim().length >= 30 &&
              !document.getElementById('diseaseTraumaOriginalView').hidden;
          } catch { return false; }
        }, expectedPath, { timeout: 20000 });
        const details = await page.locator('#diseaseTraumaOriginalFrame').evaluate(frame => ({
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
        if (row.audio === '없음' && !status.includes('원본에 음성 파일 없음'))
          throw new Error('No-audio source improperly presented for ' + number);
        if (row.audio !== '없음' && row.hosting_status === 'SELF_HOSTED_HTML_MEDIA_PENDING' && !status.includes('음성 연결 대기'))
          throw new Error('Audio-pending disclaimer missing for ' + number);
        results.push({
          number, series: row.series, title: row.title, viewport: viewport.label,
          expectedSha256: row.source_sha256, fallbackMatches: true, ...details
        });
        if (number === ids[0]) {
          await page.screenshot({
            path: path.join(outDir, viewport.label + '-category-' + String(category + 1).padStart(2, '0') + '.png')
          });
        }
        if (viewport.all && category === 0 && number === ids[0]) {
          // Test browser/PWA Back once; other cases use the visible return button.
          await page.goBack({ waitUntil: 'domcontentloaded' });
        } else {
          await page.locator('#diseaseTraumaOriginalView .region-back').click();
        }
        await page.waitForFunction(() => !document.querySelector('#diseaseTraumaRootView').hidden);
      }
    }
    if (viewport.all) {
      categoryCounts = counts;
      if (seen.size !== 87 || counts.reduce((a, b) => a + b, 0) !== 87)
        throw new Error('Category coverage incomplete: ' + seen.size + '/87; counts=' + counts.join(','));
    }
    await context.close();
  }
  const report = {
    test: (isLive ? 'exact-SHA live Cloudflare Preview' : 'local static server') + ' Chromium category -> original iframe navigation',
    sourceCommit: process.env.GITHUB_SHA || null,
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
  console.log('PASS | Claude original local browser navigation: ' + report.mobileLecturesOpened +
    '/87 mobile + ' + report.desktopRepresentativeLecturesOpened +
    '/10 desktop representative; categories=' + categoryCounts.join(','));
  console.log('INFO | Inner-HTML horizontal overflows: ' + report.knownHorizontalOverflows.length +
    ' (recorded, not claimed to be repaired)');
} finally {
  await browser.close();
}
