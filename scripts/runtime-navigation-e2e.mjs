import { chromium } from 'playwright';

const base=process.env.E2E_BASE_URL||'http://127.0.0.1:4173/';
const browser=await chromium.launch({headless:true});
const context=await browser.newContext({
  viewport:{width:390,height:844},
  locale:'ko-KR'
});
const page=await context.newPage();

const pageErrors=[];
const consoleErrors=[];
page.on('pageerror',e=>pageErrors.push(String(e?.stack||e)));
page.on('console',msg=>{if(msg.type()==='error')consoleErrors.push(msg.text());});

function fail(message,detail=''){
  console.error('FAIL | '+message+(detail?' | '+detail:''));
  throw new Error(message+(detail?' | '+detail:''));
}
function pass(message,detail=''){
  console.log('PASS | '+message+(detail?' | '+detail:''));
}
async function visible(selector){
  const loc=page.locator(selector);
  if(await loc.count()!==1)return false;
  return await loc.isVisible();
}

try{
  await page.goto(base,{waitUntil:'domcontentloaded',timeout:30000});
  await page.waitForFunction(()=>document.querySelectorAll('#regionChooser .region-choice').length>0,{timeout:20000});
  pass('App loads and anatomy region chooser is populated',String(await page.locator('#regionChooser .region-choice').count()));

  await page.locator('.tab[data-page="regions"]').click();
  await page.waitForTimeout(100);
  if(!await visible('#regionChooserView'))fail('Anatomy root view visible after tab entry');

  const regions=await page.locator('#regionChooser .region-choice').evaluateAll(btns=>btns.map(b=>({
    label:b.querySelector('b')?.textContent?.trim()||'',
    expected:Number((b.querySelector('small')?.textContent||'').match(/(\d+)/)?.[1]||0)
  })));
  if(regions.length<10)fail('Anatomy region count unexpectedly small',String(regions.length));
  pass('Anatomy region buttons captured',String(regions.length));

  for(const region of regions){
    const choice=page.locator('#regionChooser .region-choice').filter({has:page.locator('b',{hasText:region.label})}).first();
    await choice.click();
    await page.waitForTimeout(60);

    if(!await visible('#regionMusclesView')){
      const diag=await page.evaluate(()=>({
        activePages:[...document.querySelectorAll('.page.active')].map(x=>x.id),
        rootHidden:document.getElementById('regionChooserView')?.hidden,
        rootDisplay:getComputedStyle(document.getElementById('regionChooserView')).display,
        musclesHidden:document.getElementById('regionMusclesView')?.hidden,
        musclesDisplay:getComputedStyle(document.getElementById('regionMusclesView')).display,
        muscleCount:document.querySelectorAll('#selectedRegionList .region-muscle').length,
        title:document.getElementById('selectedRegionTitle')?.textContent||'',
        countText:document.getElementById('selectedRegionCount')?.textContent||'',
        drillGroup:document.documentElement.dataset.activeDrillGroup||'',
        drillView:document.documentElement.dataset.activeDrillView||'',
        page:document.documentElement.dataset.appPage||'',
        targetRect:(()=>{
          const el=document.getElementById('regionMusclesView'),r=el?.getBoundingClientRect();
          return r?{x:r.x,y:r.y,width:r.width,height:r.height}:null;
        })(),
        targetVisibility:getComputedStyle(document.getElementById('regionMusclesView')).visibility,
        targetOpacity:getComputedStyle(document.getElementById('regionMusclesView')).opacity,
        ancestors:(()=>{
          const rows=[];let el=document.getElementById('regionMusclesView');
          while(el&&rows.length<8){
            const cs=getComputedStyle(el),r=el.getBoundingClientRect();
            rows.push({tag:el.tagName,id:el.id||'',class:el.className||'',hidden:!!el.hidden,display:cs.display,visibility:cs.visibility,opacity:cs.opacity,width:r.width,height:r.height});
            el=el.parentElement;
          }
          return rows;
        })()
      }));
      console.error('DIAG | '+JSON.stringify(diag));
      if(pageErrors.length)console.error('PAGEERRORS | '+pageErrors.join(' || '));
      if(consoleErrors.length)console.error('CONSOLEERRORS | '+consoleErrors.join(' || '));
      fail('Region muscle screen is visible',region.label);
    }
    if(await visible('#regionChooserView'))fail('Region chooser must be hidden after selection',region.label);
    const rootInvariant=await page.evaluate(()=>({
      hidden:document.documentElement.hidden,
      drillGroupAttr:document.documentElement.hasAttribute('data-drill-group'),
      drillViewAttr:document.documentElement.hasAttribute('data-drill-view'),
      activeGroup:document.documentElement.dataset.activeDrillGroup||'',
      activeView:document.documentElement.dataset.activeDrillView||''
    }));
    if(rootInvariant.hidden)fail('HTML root must never be hidden by drill navigation',region.label);
    if(rootInvariant.drillGroupAttr||rootInvariant.drillViewAttr)fail('HTML root must not be registered as a drill screen',JSON.stringify(rootInvariant));
    if(rootInvariant.activeGroup!=='anatomy'||rootInvariant.activeView!=='muscles')fail('Runtime drill state matches anatomy muscles',JSON.stringify(rootInvariant));

    const title=(await page.locator('#selectedRegionTitle').textContent()||'').trim();
    const count=await page.locator('#selectedRegionList .region-muscle').count();
    if(title!==region.label)fail('Selected region title matches clicked region',region.label+' -> '+title);
    if(count!==region.expected)fail('Rendered muscle count matches region chooser count',region.label+' expected='+region.expected+' actual='+count);
    if(count===0)fail('Region contains visible muscle cards',region.label);

    const first=page.locator('#selectedRegionList .region-muscle').first();
    const firstName=(await first.locator('b').textContent()||'').trim();
    await first.click();
    await page.waitForTimeout(60);

    if(!await visible('#regionDetailView'))fail('Muscle hub visible',region.label+' / '+firstName);

    const hubTabs=page.locator('#regionMuscleHubTabs .anatomy-detail-tab');
    const hubTabCount=await hubTabs.count();
    if(hubTabCount!==5)fail('v11.14 muscle hub has five horizontal tabs',region.label+' / '+firstName+' count='+hubTabCount);
    const labels=await hubTabs.allTextContents();
    const expectedLabels=['기본정보','해부도해','초음파','임상','심화·학습'];
    if(JSON.stringify(labels.map(x=>x.trim()))!==JSON.stringify(expectedLabels)){
      fail('v11.14 muscle hub tab labels preserved',region.label+' / '+JSON.stringify(labels));
    }
    const legacyMenuCount=await page.locator('#regionDetailView .drill-menu-item').count();
    if(legacyMenuCount!==0)fail('Vertical learning-menu cards removed from anatomy muscle hub',region.label+' / '+firstName);

    const topics=region===regions[0].label?['basic','anatomy','ultrasound','clinical','learning']:['basic'];
    for(const topic of topics){
      await page.locator('#regionMuscleHubTabs .anatomy-detail-tab[data-anatomy-detail-tab="'+topic+'"]').click();
      await page.waitForFunction(()=>!document.querySelector('#regionDeepView')?.hidden,{timeout:3000});
      if(!await visible('#regionDeepView'))fail('Anatomy topic opens independent deep screen',region.label+' / '+firstName+' / '+topic);

      const deepHead=(await page.locator('#regionMuscleDeepHead h2').textContent()||'').trim();
      if(deepHead!==firstName)fail('Deep screen preserves selected muscle header',region.label+' / '+topic+' / '+deepHead);

      const deepTabs=page.locator('#regionMuscleDeepTabs .anatomy-detail-tab');
      if(await deepTabs.count()!==5)fail('Deep screen preserves five horizontal tabs',region.label+' / '+topic);
      const active=page.locator('#regionMuscleDeepTabs .anatomy-detail-tab.active');
      if(await active.count()!==1)fail('Exactly one anatomy tab active in deep screen',region.label+' / '+topic);
      if(await active.getAttribute('data-anatomy-detail-tab')!==topic)fail('Selected anatomy tab remains active',region.label+' / '+topic);

      const detailText=(await page.locator('#regionMuscleDetailContent').textContent()||'').trim();
      if(!detailText)fail('Independent anatomy topic has visible content',region.label+' / '+topic);

      await page.locator('#regionDeepView .region-back').click();
      await page.waitForFunction(()=>!document.querySelector('#regionDetailView')?.hidden,{timeout:3000});
      if(!await visible('#regionDetailView'))fail('Deep back returns to same muscle hub',region.label+' / '+topic);
    }

    await page.locator('#regionDetailView .region-back').click();
    await page.waitForFunction(()=>!document.querySelector('#regionMusclesView')?.hidden,{timeout:3000});
    if(!await visible('#regionMusclesView'))fail('Back returns to region muscle list',region.label);

    await page.locator('#regionMusclesView .region-back').click();
    await page.waitForFunction(()=>!document.querySelector('#regionChooserView')?.hidden,{timeout:3000});
    if(!await visible('#regionChooserView'))fail('Back returns to anatomy regions',region.label);

    pass('Anatomy drill flow',region.label+' / '+count+' muscles');
  }

  if(pageErrors.length)fail('No uncaught page errors',pageErrors.join(' || '));
  if(consoleErrors.length)fail('No console errors',consoleErrors.join(' || '));
  pass('No runtime errors during full anatomy click sweep');

  console.log('\n--- RUNTIME NAVIGATION E2E ---');
  console.log('PASS | all anatomy regions -> muscle list -> first muscle -> back');
}finally{
  await browser.close();
}
