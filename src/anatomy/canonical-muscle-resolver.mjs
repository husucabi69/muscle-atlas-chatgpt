/**
 * Canonical muscle resolver for LYSOS. Pure functions, browser and Node compatible.
 * Missing O/I/F/N must remain null, never synthesized from illustration captions.
 */
export function resolveMuscleAtlas(canonical, recovered) {
  if (!Array.isArray(canonical) || !Array.isArray(recovered?.records)) throw new TypeError('Invalid muscle source');
  const byId=new Map();
  for (const muscle of canonical) {
    if (!/^m\d{3}$/.test(muscle.id) || byId.has(muscle.id)) throw new Error('Invalid or duplicate canonical ID: '+muscle.id);
    byId.set(muscle.id,{...muscle,source:'data/muscles-v1.json',clinical_data_status:'EXISTING_UNREVIEWED'});
  }
  for (const record of recovered.records) {
    if (!/^m\d{3}$/.test(record.id) || byId.has(record.id)) throw new Error('Recovered ID collides with canonical: '+record.id);
    if (!record.ko || !record.en || record.anatomy_oinf_status!=='UNVERIFIED_IN_MUSCLES_V1') throw new Error('Invalid recovered identity: '+record.id);
    byId.set(record.id,{
      id:record.id,ko:record.ko,en:record.en,
      origin:null,insertion:null,function:null,nerve:null,blood:null,
      source:'data/m184-m205-recovery-inventory-v1.json',
      clinical_data_status:'IDENTITY_ONLY_NO_OIFN',
      illustration_audit_status:record.illustration_audit_status
    });
  }
  return [...byId.values()].sort((a,b)=>a.id.localeCompare(b.id));
}
export function clinicalDetailsAvailable(muscle) {
  return Boolean(muscle && muscle.clinical_data_status!=='IDENTITY_ONLY_NO_OIFN' &&
    ['origin','insertion','function','nerve'].every(key=>typeof muscle[key]==='string'&&muscle[key].trim()));
}
