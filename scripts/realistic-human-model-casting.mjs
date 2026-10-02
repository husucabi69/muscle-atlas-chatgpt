export const REALISTIC_MODEL_CASTING_RULE_VERSION='2026-10-03';

export function realisticModelCastingForStableId(stableId){
  const m=String(stableId||'').match(/(\d+)$/);
  if(!m)return null;
  const n=Number(m[1]),mod=n%4;
  const table={
    0:{patient:'여성형',examiner:'남성형'},
    1:{patient:'남성형',examiner:'여성형'},
    2:{patient:'여성형',examiner:'여성형'},
    3:{patient:'남성형',examiner:'남성형'}
  };
  return{...table[mod],rule_version:REALISTIC_MODEL_CASTING_RULE_VERSION,mod,numeric_id:n};
}

export function realisticPatientPresentationForStableId(stableId){
  return realisticModelCastingForStableId(stableId)?.patient||null;
}
