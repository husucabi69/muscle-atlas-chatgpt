// Diagnostic only: originals #1, #2 are larger, interactive, and use a
// different DOM vocabulary than #3. Read the browser DOM before modifying it.
import {chromium} from 'playwright';
const browser=await chromium.launch({headless:true});
try{
 const page=await browser.newPage({viewport:{width:390,height:844},isMobile:true,deviceScaleFactor:1});
 await page.goto('http://127.0.0.1:4173/',{waitUntil:'domcontentloaded'});
 await page.locator('.tab[data-page="diseaseTrauma"]').click();
 await page.waitForSelector('[data-claude-academic-category="0"]');
 await page.locator('[data-claude-academic-category="0"]').click();
 for(const n of [1,2]){
   await page.locator('[data-claude-academic-lecture="'+n+'"]').click();
   await page.waitForFunction(()=>{
     const f=document.getElementById('diseaseTraumaOriginalFrame');
     return !f?.hidden&&f?.contentDocument?.readyState==='complete'&&
         f.contentDocument.body?.textContent?.length>3000;
   },null,{timeout:30000});
   const r=await page.locator('#diseaseTraumaOriginalFrame').evaluate(f=>{
     const d=f.contentDocument,w=f.contentWindow;const body=d.body;
     const counts=selector=>d.querySelectorAll(selector).length;
     const top=[...body.children].slice(0,12).map(x=>({tag:x.tagName,cls:x.className,rect:Math.round(x.getBoundingClientRect().width)}));
     const headings=[...d.querySelectorAll('h1,h2,h3')].slice(0,9).map(x=>x.textContent.slice(0,90));
     const css=getComputedStyle(body);
     return {src:f.getAttribute('src'),bodyChars:body.textContent.length,
       ready:d.readyState,top,headings,bodyHeight:body.scrollHeight,iframeHeight:f.clientHeight,
       bodyWidth:body.scrollWidth,iframeWidth:f.clientWidth,
       viewport:d.documentElement.clientWidth,bodyFont:css.fontSize,
       bodyFontFamily:css.fontFamily,docScrollHeight:d.documentElement.scrollHeight,
       counts:Object.fromEntries(['p','h1,h2,h3,h4','li','table','section','article','button','input','img','svg','[data-i]','script','[role="button"]'].map(k=>[k,counts(k)])),
       images:d.querySelectorAll('img').length,
       textSample:body.textContent.replace(/\s+/g,' ').slice(0,700),
       outsideScrollY:window.scrollY,sourceStyles:[...d.styleSheets].length};
   });
   console.log('COMPENDIUM ORIGINAL DOM #'+n+' '+JSON.stringify(r));
   await page.locator('#diseaseTraumaOriginalView .region-back').click();
 }
 console.log('COMPENDIUM ORIGINAL #1/2 LIVE SOURCE DOM INSPECTION PASS');
}finally{await browser.close()}
