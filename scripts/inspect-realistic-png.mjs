import fs from 'node:fs';
import crypto from 'node:crypto';
import zlib from 'node:zlib';

const MAGIC=Buffer.from([137,80,78,71,13,10,26,10]);
const TABLE=Array.from({length:256},(_,x)=>{
  let c=x;
  for(let k=0;k<8;k++)c=c&1?0xedb88320^(c>>>1):c>>>1;
  return c>>>0;
});

export function pngCRC32(data){
  let crc=0xffffffff;
  for(const b of data)crc=TABLE[(crc^b)&255]^(crc>>>8);
  return (crc^0xffffffff)>>>0;
}
function fail(message){throw new Error('PNG_INTEGRITY_'+message);}

function expectedRows(width,height,depth,type,interlace){
  const samples={0:1,2:3,3:1,4:2,6:4}[type];
  if(!samples||!({0:[1,2,4,8,16],2:[8,16],3:[1,2,4,8],4:[8,16],6:[8,16]}[type]?.includes(depth))){
    fail('UNSUPPORTED_COLOR_BIT_DEPTH');
  }
  const passes=interlace===0?[[0,0,1,1]]:
   [[0,0,8,8],[4,0,8,8],[0,4,4,8],[2,0,4,4],[0,2,2,4],[1,0,2,2],[0,1,1,2]];
  let total=0;
  const rows=[];
  for(const [startX,startY,stepX,stepY] of passes){
    const cols=Math.max(0,Math.ceil((width-startX)/stepX));
    const lines=Math.max(0,Math.ceil((height-startY)/stepY));
    if(cols===0||lines===0)continue;
    const lineBytes=Math.ceil(cols*samples*depth/8)+1;
    total+=lineBytes*lines;
    rows.push({lineBytes,lines});
  }
  return{total,rows};
}
export function inspectPNG(file){
  const b=fs.readFileSync(file);
  if(b.length<57||!b.subarray(0,8).equals(MAGIC))fail('SIGNATURE');
  let off=8,ihdr=null,idat=[],finished=false,idatEnded=false;
  while(off<b.length){
    if(off+12>b.length)fail('TRUNCATED_CHUNK_HEADER');
    const n=b.readUInt32BE(off);
    if(n>b.length-off-12)fail('TRUNCATED_CHUNK_DATA');
    const tag=b.subarray(off+4,off+8).toString('latin1');
    const end=off+12+n;
    const got=b.readUInt32BE(end-4);
    const want=pngCRC32(b.subarray(off+4,end-4));
    if(got!==want)fail('CRC_'+tag);
    if(ihdr===null && tag!=='IHDR')fail('IHDR_MUST_BE_FIRST');
    if(tag==='IHDR'){
      if(ihdr||n!==13)fail('INVALID_IHDR');
      const width=b.readUInt32BE(off+8),height=b.readUInt32BE(off+12),
        depth=b[off+16],type=b[off+17],compression=b[off+18],
        filter=b[off+19],interlace=b[off+20];
      if(!width||!height||width>10000||height>10000)fail('DIMENSIONS');
      if(compression!==0||filter!==0||![0,1].includes(interlace))fail('IHDR_METHOD');
      const expected=expectedRows(width,height,depth,type,interlace);
      if(expected.total>250_000_000)fail('TOO_LARGE');
      ihdr={width,height,depth,type,interlace,expected};
    }else if(tag==='IDAT'){
      if(idatEnded||finished)fail('NONCONTIGUOUS_IDAT');
      idat.push(b.subarray(off+8,end-4));
    }else if(tag==='IEND'){
      if(n!==0||idat.length===0||finished||end!==b.length)fail('INVALID_IEND');
      finished=true;
    }else if(!/^[a-z]/.test(tag) && tag!=='PLTE'){
      fail('UNKNOWN_CRITICAL_CHUNK_'+tag);
    }
    if(tag!=='IDAT'&&idat.length)idatEnded=true;
    off=end;
  }
  if(!finished||!idat.length)fail('MISSING_IDAT_OR_IEND');
  let raw;
  try{
    raw=zlib.inflateSync(Buffer.concat(idat),{maxOutputLength:ihdr.expected.total+1});
  }catch(e){fail('INVALID_ZLIB_'+String(e.code||e.message).slice(0,90));}
  if(raw.length!==ihdr.expected.total)fail('DECODED_BYTE_COUNT');
  let at=0;
  for(const p of ihdr.expected.rows){
    for(let n=0;n<p.lines;n++){
      if(raw[at]>4)fail('INVALID_SCANLINE_FILTER');
      at+=p.lineBytes;
    }
  }
  if(at!==raw.length)fail('INVALID_ADAM7_ROW_ALIGNMENT');
  return{file,width:ihdr.width,height:ihdr.height,bytes:b.length,
    sha256:crypto.createHash('sha256').update(b).digest('hex'),
    source_type:'PNG',idat_chunks:idat.length,decoded_bytes:raw.length};
}

if(process.argv[1]&&process.argv[1].endsWith('inspect-realistic-png.mjs')){
 try{
  if(!process.argv[2])fail('USAGE_NODE_SCRIPT_FILE');
  console.log(JSON.stringify(inspectPNG(process.argv[2]),null,2));
 }catch(e){console.error(String(e.message));process.exit(1);}
}
