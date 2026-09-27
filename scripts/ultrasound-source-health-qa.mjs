import fs from 'node:fs';

const audit=JSON.parse(fs.readFileSync('data/media-license-global-audit-v1.json','utf8'));
const urls=(audit.sources||[]).map(x=>x.source_page).filter(Boolean);
const unique=[...new Set(urls)];
const expected=55;

async function request(url,method='HEAD'){
  const controller=new AbortController();
  const timer=setTimeout(()=>controller.abort(),12000);
  try{
    return await fetch(url,{
      method,
      redirect:'follow',
      signal:controller.signal,
      headers:{
        'user-agent':'LYS-Muscle-Atlas-SourceHealth/1.0 (+https://github.com/husucabi69/muscle-atlas-chatgpt)',
        'accept':'text/html,application/pdf,image/*,video/*;q=0.8,*/*;q=0.5',
        ...(method==='GET'?{'range':'bytes=0-4095'}:{})
      }
    });
  }finally{clearTimeout(timer);}
}
async function checkUrl(url){
  let res=null,error='';
  try{
    res=await request(url,'HEAD');
    if(!res.ok && ![404,410].includes(res.status)){
      try{res=await request(url,'GET');}catch(e){error=String(e?.name||e?.message||e);}
    }
  }catch(e){
    error=String(e?.name||e?.message||e);
    try{res=await request(url,'GET');error='';}catch(e2){error=String(e2?.name||e2?.message||e2);}
  }
  if(res){
    const status=res.status;
    if(status>=200&&status<400)return{url,state:'healthy',status,final_url:res.url||url};
    if(status===404||status===410)return{url,state:'broken',status,final_url:res.url||url};
    return{url,state:'transient',status,final_url:res.url||url,error};
  }
  return{url,state:'transient',status:0,final_url:url,error:error||'network error'};
}
async function pool(items,limit=8){
  const out=new Array(items.length);let next=0;
  async function worker(){
    while(true){
      const i=next++;if(i>=items.length)return;
      out[i]=await checkUrl(items[i]);
    }
  }
  await Promise.all(Array.from({length:Math.min(limit,items.length)},()=>worker()));
  return out;
}

if(unique.length!==expected){
  console.error('FAIL | Unique ultrasound source count | '+unique.length+' expected '+expected);
  process.exit(1);
}
const results=await pool(unique,8);
let healthy=0,transient=0,broken=0;
for(const r of results){
  if(r.state==='healthy')healthy++;
  else if(r.state==='broken')broken++;
  else transient++;
  console.log(r.state.toUpperCase()+' | '+r.status+' | '+r.url+(r.final_url!==r.url?' -> '+r.final_url:'')+(r.error?' | '+r.error:''));
}
console.log('\n--- STAGE 20 ULTRASOUND SOURCE HEALTH ---');
console.log('TOTAL='+results.length+' HEALTHY='+healthy+' TRANSIENT='+transient+' BROKEN='+broken);
if(broken>0)process.exit(1);
