import fs from 'node:fs';

export const REALISTIC_EDUCATION_FAMILIES=[
 {id:'PATIENT_EXERCISE_REALISTIC',title:'AI-assisted, human-reviewed realistic patient exercise education illustrations'},
 {id:'PHYSICAL_EXAM_REALISTIC',title:'AI-assisted, human-reviewed realistic physical examination education illustrations'}
];

export function ensureRealisticEducationFamilies(registry){
 if(!registry||!Array.isArray(registry.work_families)) throw new Error('work_families registry required');
 for(const family of REALISTIC_EDUCATION_FAMILIES){
   const existing=registry.work_families.find(x=>x.id===family.id);
   if(existing){ if(existing.title!==family.title) throw new Error('conflicting family title: '+family.id); continue; }
   registry.work_families.push({...family});
 }
 return registry;
}

if(process.argv[1]&&process.argv[1].endsWith('extend-realistic-ip-provenance-families.mjs')){
 const path='data/ip-provenance-v1.json';
 const registry=JSON.parse(fs.readFileSync(path,'utf8'));
 ensureRealisticEducationFamilies(registry);
 registry.updated_at=new Date().toISOString().slice(0,10);
 fs.writeFileSync(path,JSON.stringify(registry,null,2)+'\n');
 console.log('REALISTIC EDUCATION IP FAMILIES READY');
}
