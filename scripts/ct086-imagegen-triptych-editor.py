#!/usr/bin/env python3
"""ct086 review-only compositing record. Never approves/edits canonical assets.
Requires Pillow. No external provider calls. Reconstructs a 1024x1536 3-panel
image layout from a separately preserved ImageGen synthetic source. This is an
editing-process example, not a medical correctness/copyright ownership claim.
"""
import argparse
import hashlib
from pathlib import Path
from PIL import Image,ImageDraw,ImageFont,ImageOps,ImageFilter

SOURCE_SHA256="1217a8fcecbcca209a274757591d078a2eb12704513b6671aa38f88eac071663"
SOURCE=Path("assets/physical-exam-realistic/drafts/ct086-imagegen-source-20261017.png")
def composite(src:Path,out:Path):
    if hashlib.sha256(src.read_bytes()).hexdigest()!=SOURCE_SHA256:
        raise SystemExit("REFUSE: source bytes not the locked synthetic original")
    im=Image.open(src).convert("RGB")
    if im.size!=(1214,1295):raise SystemExit("REFUSE: unexpected source pixels")
    w,h=1024,1536
    result=Image.new("RGB",(w,h),"#edf4f8")
    d=ImageDraw.Draw(result)
    font_path=Path("/usr/share/fonts/truetype/nanum/NanumGothicBold.ttf")
    if not font_path.exists():font_path=Path("/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf")
    font=ImageFont.truetype(str(font_path),38)
    titles=["1  중립 자세","2  좌우 능동 회전","3  회전 제한 · 보상 확인"]
    regions=[im.crop(x) for x in [(20,170,380,733),(402,170,780,443),(402,451,780,732),(803,170,1168,735)]]
    for row in range(3):
        y=row*512
        d.rounded_rectangle((12,y+9,1012,y+505),radius=28,fill="white",outline="#d0e1e9",width=2)
        d.rounded_rectangle((28,y+25,996,y+91),radius=17,fill="#114f78")
        d.text((55,y+37),titles[row],fill="white",font=font)
        top=y+103
        if row==1:
            for col,photo in enumerate((regions[1],regions[2])):
                fitted=ImageOps.fit(photo,(476,393),Image.Resampling.LANCZOS,centering=(.5,.48))
                result.paste(fitted,(28+col*492,top))
        else:
            photo=regions[0 if row==0 else 3]
            background=ImageOps.fit(photo,(966,393),Image.Resampling.LANCZOS,centering=(.5,.42)).filter(ImageFilter.GaussianBlur(34))
            background=Image.blend(background,Image.new("RGB",(966,393),"#edf5fa"),.59)
            result.paste(background,(29,top))
            photo=photo.crop((0,25,photo.width,460))
            foreground=ImageOps.fit(photo,(660,393),Image.Resampling.LANCZOS,centering=(.5,.09))
            result.paste(foreground,(182,top))
            d.line((182,top,182,top+393),fill="#c4d8e4",width=2)
            d.line((842,top,842,top+393),fill="#c4d8e4",width=2)
    if out.exists():raise SystemExit("REFUSE: existing review draft cannot be silently overwritten")
    result.save(out,format="PNG",optimize=True)
    print("CT086_REVIEW_ONLY; NOT_CLINICALLY_APPROVED; SHA256="+hashlib.sha256(out.read_bytes()).hexdigest())
if __name__=="__main__":
    ap=argparse.ArgumentParser()
    ap.add_argument("--source",type=Path,default=SOURCE)
    ap.add_argument("--output",type=Path,required=True,help="Write NEW path only, no overwrites")
    args=ap.parse_args()
    composite(args.source,args.output)
