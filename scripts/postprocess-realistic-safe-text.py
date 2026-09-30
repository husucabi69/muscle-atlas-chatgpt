from pathlib import Path
import argparse
import subprocess
import tempfile
from PIL import Image, ImageDraw, ImageFont

SAFE_COPY={
  "px002":{
    "title":"안전하게 따라 하세요",
    "lines":[
      "• 머리를 들지 않고 턱을 작게 끄덕이듯 당깁니다.",
      "• 목 앞쪽 큰 근육에 과하게 힘주거나 숨을 참지 않습니다.",
      "• 낮은 부하에서 정확한 조절을 우선합니다."
    ],
    "stop":[
      "팔 저림·심한 어지럼·시야 이상·새 근력저하가",
      "생기면 즉시 중단하고 평가를 받습니다."
    ]
  },
  "px003":{
    "title":"안전하게 따라 하세요",
    "lines":[
      "• 목과 허리를 중립으로 유지합니다.",
      "• 팔꿈치를 뒤로 보내며 견갑을 부드럽게 모읍니다.",
      "• 어깨를 으쓱하거나 허리를 젖혀 당기지 않습니다."
    ],
    "stop":[
      "통증이 뚜렷하게 늘거나 다음날 악화가 지속되면",
      "강도를 낮추고 반응을 다시 확인합니다."
    ]
  },
  "px004":{
    "title":"안전하게 따라 하세요",
    "lines":[
      "• 팔꿈치를 몸통 옆에 두고 전완만 바깥으로 돌립니다.",
      "• 몸통 회전과 어깨 으쓱을 줄입니다.",
      "• 통증 허용 범위에서 개인별 부하로 진행합니다."
    ],
    "stop":[
      "날카로운 어깨 통증이나 밤새 악화되는 통증이",
      "생기면 중단하고 다시 평가합니다."
    ]
  },
  "px005":{
    "title":"안전하게 따라 하세요",
    "lines":[
      "• 전완을 문틀에 가볍게 지지합니다.",
      "• 허리를 젖히지 않고 몸통을 조금 이동합니다.",
      "• 가슴 앞이 부드럽게 늘어나는 범위에서 시행합니다."
    ],
    "stop":[
      "날카로운 어깨 통증이나 팔 저림이 생기면",
      "즉시 중단하고 다시 평가합니다."
    ]
  },
  "px006":{
    "title":"안전하게 따라 하세요",
    "lines":[
      "• 전완과 팔꿈치를 테이블에 안정적으로 지지합니다.",
      "• 손목을 목표 방향으로 천천히 움직입니다.",
      "• 통증과 다음날 반응에 맞춰 부하를 조절합니다."
    ],
    "stop":[
      "통증이 과도하게 누적되거나 다음날 뚜렷이 악화되면",
      "부하를 줄이고 반응을 다시 확인합니다."
    ]
  }
}

def find_font(bold=False):
    candidates=[
      "/usr/share/fonts/opentype/noto/NotoSansCJK-Bold.ttc" if bold else "/usr/share/fonts/opentype/noto/NotoSansCJK-Regular.ttc",
      "/usr/share/fonts/truetype/nanum/NanumBarunGothicBold.ttf" if bold else "/usr/share/fonts/truetype/nanum/NanumBarunGothic.ttf",
      "/usr/share/fonts/truetype/nanum/NanumGothic.ttf",
    ]
    return next((p for p in candidates if Path(p).exists()),None)

def main():
    ap=argparse.ArgumentParser()
    ap.add_argument("--profile",required=True,choices=sorted(SAFE_COPY))
    args=ap.parse_args()
    profile=args.profile
    source=Path(f"assets/patient-exercise-realistic/{profile}.webp")
    if not source.exists():
        raise SystemExit(f"{profile} source asset missing")

    try:
        img=Image.open(source).convert("RGB")
    except OSError:
        # Some earlier mobile-preview WebP candidates are valid in browsers
        # but use a bitstream Pillow/libwebp cannot decode directly.
        # Normalize through the reference libwebp decoder instead of
        # regenerating or silently replacing the illustration.
        with tempfile.TemporaryDirectory() as td:
            png=Path(td)/f"{profile}.png"
            subprocess.run(["dwebp",str(source),"-o",str(png)],check=True)
            img=Image.open(png).convert("RGB")
    w,h=img.size
    if w<320 or h<400 or h<=w:
        raise SystemExit(f"unexpected candidate dimensions: {w}x{h}")
    sx=w/320.0
    sy=h/400.0
    # Existing generated posters use the same portrait template. Keep the
    # approved realistic start/end visual above 58% height and replace the
    # lower generated prose where unsupported fixed dosage may appear.
    y0=round(232*sy)

    regular=find_font(False)
    bold=find_font(True)
    if not regular or not bold:
        raise SystemExit("Korean font unavailable")

    draw=ImageDraw.Draw(img)
    head=ImageFont.truetype(bold,round(15*sx))
    body=ImageFont.truetype(regular,round(11*sx))
    small=ImageFont.truetype(regular,round(10*sx))

    def box(coords,radius,fill,outline,width=1):
        draw.rounded_rectangle(
          [round(coords[0]*sx),round(coords[1]*sy),round(coords[2]*sx),round(coords[3]*sy)],
          radius=round(radius*sx),fill=fill,outline=outline,width=max(1,round(width*sx))
        )

    blue=(22,76,145); red=(180,45,35); ink=(32,42,55)
    box((4,232,316,396),6,(250,252,255),(205,220,238))
    copy=SAFE_COPY[profile]
    draw.text((round(14*sx),round(242*sy)),copy["title"],font=head,fill=blue)

    y=266
    for line in copy["lines"]:
        draw.text((round(14*sx),round(y*sy)),line,font=body,fill=ink)
        y+=19

    box((10,326,310,389),5,(255,247,235),(238,198,124))
    draw.text((round(18*sx),round(334*sy)),"중단 신호",font=head,fill=red)
    draw.text((round(18*sx),round(356*sy)),copy["stop"][0],font=small,fill=ink)
    draw.text((round(18*sx),round(373*sy)),copy["stop"][1],font=small,fill=ink)

    img.save(source,"WEBP",quality=88,method=6)
    print("SAFE_TEXT_CORRECTION_OK",profile,source,img.size,y0)

if __name__=="__main__":
    main()
