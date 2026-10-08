import fs from 'node:fs';

const json=p=>JSON.parse(fs.readFileSync(p,'utf8'));
const odt=json('data/orthopedic-disease-trauma-v1.json');
const core=json('data/knowledge-core-v1.json');
const failures=[],passes=[];
const check=(name,ok,detail='')=>{
  (ok?passes:failures).push({name,detail});
  console.log(`${ok?'PASS':'FAIL'} | ${name}${detail?' | '+detail:''}`);
};

const volumes=odt.volumes||[];
const native=odt.native_content||{};
const nativeKeys=Object.keys(native);
check('ODT fixed inventory = 24',volumes.length===24,String(volumes.length));
check('ODT volume IDs unique',new Set(volumes.map(v=>v.stable_id)).size===volumes.length);
check('ODT native count matches migration policy',nativeKeys.length===odt.migration_policy?.native_preview_volumes,`${nativeKeys.length}/${odt.migration_policy?.native_preview_volumes}`);
check('ODT pending count matches migration policy',volumes.filter(v=>v.native_status!=='NATIVE_PREVIEW').length===odt.migration_policy?.source_verified_pending_volumes);

const targets={
  muscle:new Set((core.muscles||[]).map(x=>x.muscle_id)),
  diagnosis_concept:new Set((core.diagnosis_concepts||[]).map(x=>x.diagnosis_concept_id)),
  clinical_test:new Set((core.clinical_tests||[]).map(x=>x.clinical_test_id)),
  ultrasound_view:new Set((core.ultrasound_views||[]).map(x=>x.ultrasound_view_id))
};
const volumeById=new Map(volumes.map(v=>[v.stable_id,v]));
for(const v of volumes){
  const has=!!native[v.stable_id];
  check(`ODT ${v.stable_id} status/content agreement`,v.native_status==='NATIVE_PREVIEW'?has:!has,v.native_status);
}
for(const [id,n] of Object.entries(native)){
  const v=volumeById.get(id);
  check(`${id} registry exists`,!!v);
  check(`${id} stable ID matches`,n.stable_id===id,String(n.stable_id||''));
  check(`${id} source SHA-256`,/^[0-9a-f]{64}$/.test(String(n.source_sha256||'')),String(n.source_sha256||''));
  check(`${id} source bytes positive`,Number(n.source_bytes)>0,String(n.source_bytes||0));
  check(`${id} audio fail-closed`,n.audio_status==='MIGRATION_PENDING_SOURCE_MP4_NOT_INCLUDED_IN_ARCHIVE',String(n.audio_status||''));

  const chapters=n.chapters||[],chapterIds=chapters.map(x=>x.id);
  check(`${id} chapters present`,chapters.length>0,String(chapters.length));
  check(`${id} chapter IDs unique`,new Set(chapterIds).size===chapterIds.length);
  check(`${id} chapter count metadata`,n.chapter_count===chapters.length,`${n.chapter_count}/${chapters.length}`);
  check(`${id} chapter order contiguous`,chapters.every((x,i)=>x.order===i),JSON.stringify(chapters.map(x=>x.order)));

  const refs=n.references||[],refIds=new Set(refs.map(x=>x.id));
  check(`${id} reference IDs unique`,refIds.size===refs.length);
  if(Number.isInteger(n.reference_count))check(`${id} reference count metadata`,n.reference_count===refs.length,`${n.reference_count}/${refs.length}`);

  const figures=n.figures||[],figIds=figures.map(x=>x.id);
  check(`${id} figure IDs unique`,new Set(figIds).size===figIds.length);
  if(Number.isInteger(n.visual_provenance_count))check(`${id} visual provenance count metadata`,n.visual_provenance_count===figures.length,`${n.visual_provenance_count}/${figures.length}`);
  for(const f of figures){
    check(`${id} ${f.id} chapter resolves`,chapterIds.includes(f.chapter_id),String(f.chapter_id||''));
    if(f.source_page){
      check(`${id} ${f.id} external license metadata`,!!String(f.license||'').trim(),String(f.license||''));
      check(`${id} ${f.id} source-link-only before promotion`,String(f.render_mode||'').includes('SOURCE_LINK_ONLY'),String(f.render_mode||''));
    }
  }

  for(const ch of chapters){
    for(const ref of ch.evidence_ref_ids||[])check(`${id} ${ch.id} evidence ref ${ref}`,refIds.has(ref));
    for(const link of ch.cross_links||[]){
      const set=targets[link.type];
      check(`${id} ${ch.id} cross-link ${link.type}:${link.id}`,!!set&&set.has(link.id));
    }
  }
}
const serialized=JSON.stringify(odt);
check('ODT Claude runtime URLs absent',!serialized.includes('claude.ai/artifact')&&!serialized.includes('/_blob/'));
check('ODT runtime dependency flags off',odt.migration_policy?.claude_runtime_dependency===false&&odt.migration_policy?.external_artifact_dependency===false);

console.log(`SUMMARY | ${passes.length}/${passes.length+failures.length} PASS`);
if(failures.length){console.error(JSON.stringify(failures,null,2));process.exit(1);}
