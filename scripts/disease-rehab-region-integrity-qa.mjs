import fs from 'node:fs';

const read=path=>JSON.parse(fs.readFileSync(path,'utf8'));
const rehab=read('data/patient-rehab-disease-content-v1.json');
const coverage=read('data/patient-rehab-disease-coverage-v1.json');
const byId=new Map();
const failures=[];
for(const condition of rehab.conditions||[]){
  if(byId.has(condition.stable_id))failures.push('duplicate condition '+condition.stable_id);
  byId.set(condition.stable_id,condition);
}
const seenRegions=new Set();
const seenConditions=new Set();
for(const region of coverage.regions||[]){
  if(seenRegions.has(region.region_id))failures.push('duplicate region '+region.region_id);
  seenRegions.add(region.region_id);
  const ids=region.condition_ids||[];
  if(region.status==='PENDING'&&ids.length)failures.push('pending region has conditions '+region.region_id);
  if(region.status==='SEEDED'&&!ids.length)failures.push('seeded region empty '+region.region_id);
  for(const id of ids){
    if(seenConditions.has(id))failures.push('condition assigned twice '+id);
    seenConditions.add(id);
    const condition=byId.get(id);
    if(!condition)failures.push('unknown condition '+id);
    else if(condition.region_id!==region.region_id)failures.push('wrong region '+id);
  }
}
for(const id of byId.keys())if(!seenConditions.has(id))failures.push('unassigned condition '+id);
if(failures.length){console.error(failures.join('\n'));process.exit(1);}
console.log('PASS: Disease Rehab region/condition coverage integrity, '+byId.size+' conditions');
