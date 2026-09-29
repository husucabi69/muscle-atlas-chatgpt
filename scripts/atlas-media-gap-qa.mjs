import fs from 'node:fs';

const audit=JSON.parse(fs.readFileSync('data/muscle-illustration-audit-v1.json','utf8'));
const media=JSON.parse(fs.readFileSync('data/media-v1.json','utf8'));
const gaps=JSON.parse(fs.readFileSync('data/atlas-media-gap-audit-v1.json','utf8'));
const globalUS=JSON.parse(fs.readFileSync('data/media-license-global-audit-v1.json','utf8'));

const checks=[];
const check=(name,pass,detail='')=>checks.push({name,pass:Boolean(pass),detail});

const sourceGaps=(audit.muscles||[]).filter(x=>x.status==='no_suitable_public_source');
const reviewed=(audit.muscles||[]).filter(x=>x.status==='reviewed');
const gray384=reviewed.filter(x=>/Gray384/i.test(String(x.representative_asset?.file||'')+' '+String(x.representative_asset?.sourcePage||'')));
const sourceGapIds=sourceGaps.map(x=>x.muscle_id).sort();
const ledgerSourceGapIds=(gaps.anatomy?.source_gaps||[]).map(x=>x.muscle_id).sort();

check('Gap ledger schema',gaps.schema_version==='1.0.0',gaps.schema_version);
check('Anatomy gap count matches Stage 17 audit',gaps.anatomy?.no_suitable_public_source===sourceGaps.length,`${gaps.anatomy?.no_suitable_public_source}/${sourceGaps.length}`);
check('Anatomy reviewed count matches',gaps.anatomy?.reviewed_representative===reviewed.length,`${gaps.anatomy?.reviewed_representative}/${reviewed.length}`);
check('Anatomy source-gap IDs match Stage 17 audit',ledgerSourceGapIds.join('|')===sourceGapIds.join('|'),`${ledgerSourceGapIds.length}/${sourceGapIds.length}`);
check('No Gray384 cross-section representative remains',gray384.length===0,gray384.map(x=>x.muscle_id).join(','));
check('m011 corrected to Gray389',media.muscles?.m011?.anatomy?.[0]?.file==='Gray389 Semispinalis capitis.png',media.muscles?.m011?.anatomy?.[0]?.file||'missing');
check('m003 corrected to Gray385',media.muscles?.m003?.anatomy?.[0]?.file==='Gray385 - Scalenus medius muscle.png',media.muscles?.m003?.anatomy?.[0]?.file||'missing');
check('m016 cervical intertransversarii promoted',media.muscles?.m016?.anatomy?.[0]?.file==='Sobo 1909 243.png',media.muscles?.m016?.anatomy?.[0]?.file||'missing');
check('m016 removed from active source gaps',!(gaps.anatomy?.source_gaps||[]).some(x=>x.muscle_id==='m016'));
check('m116 first dorsal interosseous promoted',media.muscles?.m116?.anatomy?.[0]?.file==='Wrist and hand deeper palmar dissection-numbers.svg',media.muscles?.m116?.anatomy?.[0]?.file||'missing');
check('m116 removed from active source gaps',!(gaps.anatomy?.source_gaps||[]).some(x=>x.muscle_id==='m116'));


check('m044 lumbar medial intertransversarii resolved',media.muscles?.m044?.anatomy?.[0]?.file==='Sobo 1909 244.png',media.muscles?.m044?.anatomy?.[0]?.file||'missing');
check('m045 lumbar lateral intertransversarii resolved',media.muscles?.m045?.anatomy?.[0]?.file==='Sobo 1909 244.png',media.muscles?.m045?.anatomy?.[0]?.file||'missing');
check('Resolved lumbar gaps removed from source-gap list',
  !sourceGaps.some(x=>['m044','m045'].includes(x.muscle_id)),
  sourceGaps.filter(x=>['m044','m045'].includes(x.muscle_id)).map(x=>x.muscle_id).join(',')
);
check('Ultrasound total matches global audit',gaps.ultrasound?.canonical_views===globalUS.summary?.ultrasound_views_total,`${gaps.ultrasound?.canonical_views}/${globalUS.summary?.ultrasound_views_total}`);
check('Ultrasound embedded count matches global audit',gaps.ultrasound?.embedded_actual_ultrasound===globalUS.summary?.embedded_reuse_with_attribution,`${gaps.ultrasound?.embedded_actual_ultrasound}/${globalUS.summary?.embedded_reuse_with_attribution}`);
check('Ultrasound link-only count matches global audit',gaps.ultrasound?.link_only_actual_ultrasound_reference===globalUS.summary?.link_only_reference_views,`${gaps.ultrasound?.link_only_actual_ultrasound_reference}/${globalUS.summary?.link_only_reference_views}`);
check('Ultrasound canonical source missing is zero',gaps.ultrasound?.canonical_source_missing===0,String(gaps.ultrasound?.canonical_source_missing));
check('Special-view audit resolved final manual re-audits',
  (gaps.anatomy?.accepted_special_views||[]).length===16 &&
  (gaps.anatomy?.manual_visual_reaudit_candidates||[]).length===0,
  `accepted=${(gaps.anatomy?.accepted_special_views||[]).length}; reaudits=${(gaps.anatomy?.manual_visual_reaudit_candidates||[]).map(x=>x.muscle_id).join(',')}`
);
check('m056 puborectalis upgraded to labelled whole-pelvic-floor view',
  media.muscles?.m056?.anatomy?.[0]?.file==='Pelvic Muscles (Female Inferior).png',
  media.muscles?.m056?.anatomy?.[0]?.file||'missing'
);
check('m203 external urethral sphincter confirmed on comparative labelled view',
  media.muscles?.m203?.anatomy?.[0]?.file==='Anatomytool Male and female urinary tract English.jpg',
  media.muscles?.m203?.anatomy?.[0]?.file||'missing'
);
check('Group-level candidates are not falsely promoted',
  (gaps.anatomy?.candidate_sources_not_promoted||[]).every(x=>['NOT_PROMOTED','RESEARCH_ONLY','REFERENCE_ONLY'].includes(x.decision)),
  (gaps.anatomy?.candidate_sources_not_promoted||[]).map(x=>x.decision).join(',')
);
check('New Gray389 erector-spinae gaps resolved',
  ['m021','m022','m038'].every(id=>!sourceGaps.some(x=>x.muscle_id===id)) &&
  ['m021','m022','m038'].every(id=>media.muscles?.[id]?.anatomy?.[0]?.file==='Gray389.png'),
  ['m021','m022','m038'].filter(id=>sourceGaps.some(x=>x.muscle_id===id)||media.muscles?.[id]?.anatomy?.[0]?.file!=='Gray389.png').join(',')
);
check('Dorsal interossei II-IV resolved with directly labelled Sobotta plate',
  ['m117','m118','m119'].every(id=>
    !sourceGaps.some(x=>x.muscle_id===id) &&
    media.muscles?.[id]?.anatomy?.[0]?.file==='Sobo 1909 285.png'
  )
);
check('Remaining part-specific source-gap candidates remain gaps',
  ['m025','m039','m041','m120','m121','m122','m197'].every(id=>
    sourceGaps.some(x=>x.muscle_id===id)
  )
);
check('Manual visual re-audits are explicitly resolved',
  (gaps.anatomy?.manual_visual_reaudit_candidates||[]).length===0 &&
  ['m056','m203'].every(id=>(gaps.anatomy?.resolved_manual_visual_reaudits||[]).some(x=>x.muscle_id===id && x.reviewed_on==='2026-09-29'))
);
check('Source research ledger records rejected candidates',
  (gaps.anatomy?.candidate_sources_not_promoted||[]).length>=7,
  String((gaps.anatomy?.candidate_sources_not_promoted||[]).length)
);

const researchQueue=gaps.anatomy?.research_priority_queue||[];
const researchQueueIds=researchQueue.flatMap(x=>x.muscle_ids||[]);
check('Research priority queue covers every remaining anatomy gap exactly once',
  researchQueueIds.length===sourceGapIds.length &&
  new Set(researchQueueIds).size===sourceGapIds.length &&
  [...new Set(researchQueueIds)].sort().join('|')===sourceGapIds.join('|'),
  `queue=${researchQueueIds.length}; unique=${new Set(researchQueueIds).size}; gaps=${sourceGapIds.length}`
);
check('Research priority queue has explicit stop rules',
  researchQueue.length>0 && researchQueue.every(x=>typeof x.stop_rule==='string'&&x.stop_rule.length>15),
  researchQueue.filter(x=>!x.stop_rule||x.stop_rule.length<=15).map(x=>x.label_ko).join(',')
);
check('Research priority values valid',
  researchQueue.every(x=>['P1','P2','P3'].includes(x.priority)),
  researchQueue.filter(x=>!['P1','P2','P3'].includes(x.priority)).map(x=>x.priority).join(',')
);
check('m137 research candidate is retained but not promoted',
  (gaps.anatomy?.candidate_sources_not_promoted||[]).some(x=>(x.muscle_ids||[]).includes('m137')&&x.decision==='RESEARCH_ONLY') &&
  sourceGaps.some(x=>x.muscle_id==='m137'),
  media.muscles?.m137?.anatomy?.[0]?.file||'source-gap retained'
);

let failed=0;
for(const x of checks){
  console.log(`${x.pass?'PASS':'FAIL'} | ${x.name}${x.detail?' | '+x.detail:''}`);
  if(!x.pass)failed++;
}
console.log('\n--- ATLAS MEDIA GAP QA ---');
console.log(`PASS=${checks.length-failed} FAIL=${failed}`);
if(failed)process.exit(1);
