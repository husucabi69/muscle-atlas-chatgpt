#!/usr/bin/env node
/** 3D coordinate contract sanity check before any original m009 mesh exists. */
import {strict as assert} from 'node:assert';
import {readFileSync} from 'node:fs';
const spec=readFileSync('docs/anatomy/m009-3d-master-build-spec-v1.md','utf8');
assert(spec.includes('+X patient right'),'patient X laterality wrong');
assert(spec.includes('+Y cranial/superior'),'Y up convention wrong');
assert(spec.includes('+Z posterior'),'Z depth convention wrong');
assert(spec.includes('X×Y=Z'),'right-handed requirement absent');
const cross=(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]];
assert.deepEqual(cross([1,0,0],[0,1,0]),[0,0,1],'right-handed axes');
const view=[0,0,-1],up=[0,1,0];
assert.deepEqual(cross(view,up),[1,0,0],'posterior view screen-right must be patient-right');
const rasToEngine=([R,A,S])=>[R,S,-A];
const lpsToEngine=([L,P,S])=>[-L,S,P];
assert.deepEqual(rasToEngine([1,2,3]),[1,3,-2],'RAS mapping');
assert.deepEqual(lpsToEngine([-1,-2,3]),[1,3,-2],'LPS mapping');
assert(spec.includes('[R,S,-A]')&&spec.includes('[-L,S,P]'),'medical image coordinate conversion absent');
console.log(JSON.stringify({test:'m009-coordinate-convention',status:'PASS',right_handed:true,posterior_view_patient_right_on_screen_right:true,mesh_review:'PENDING'}));
