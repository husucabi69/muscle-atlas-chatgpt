import assert from 'node:assert/strict';
import {verifyCt086RunwayUrl,recoverCt086ExistingRunwayPNG,RUNWAY_BAN_CODE} from './ct086-runway-asset-recover.mjs';
let networkCalls=0;
assert.throws(()=>verifyCt086RunwayUrl('https://example.com'),{message:RUNWAY_BAN_CODE});
console.log('PASS | Runway URL use forbidden');
await assert.rejects(recoverCt086ExistingRunwayPNG({
  signedUrl:'https://example.com',
  fetchImpl:async()=>{networkCalls++;throw new Error('forbidden network');}
}),{message:RUNWAY_BAN_CODE});
console.log('PASS | Runway image retrieval forbidden');
assert.equal(networkCalls,0);
console.log('PASS | No network calls');
console.log('SUMMARY | 3/3 PASS');
