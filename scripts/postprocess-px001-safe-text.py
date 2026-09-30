from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

SOURCE=Path("assets/patient-exercise-realistic/px001.webp")
if not SOURCE.exists():
    raise SystemExit("px001 source asset missing")

img=Image.open(SOURCE).convert("RGB")
if img.size!=(320,400):
    raise SystemExit(f"px001 expected 320x400 mobile candidate, got {img.size}")

font_candidates=[
    "/usr/share/fonts/opentype/noto/NotoSansCJK-Bold.ttc",
    "/usr/share/fonts/opentype/noto/NotoSansCJK-Regular.ttc",
    "/usr/share/fonts/truetype/nanum/NanumGothic.ttf",
]
font_bold=next((p for p in font_candidates if "Bold" in p and Path(p).exists()),None)
font_regular=next((p for p in font_candidates if "Regular" in p and Path(p).exists()),None)
if not font_regular:
    font_regular=next((p for p in font_candidates if Path(p).exists()),None)
if not font_bold:
    font_bold=font_regular
if not font_regular:
    raise SystemExit("Korean font unavailable")

draw=ImageDraw.Draw(img)
head=ImageFont.truetype(font_bold,15)
body=ImageFont.truetype(font_regular,11)
small=ImageFont.truetype(font_regular,10)

blue=(22,76,145)
red=(180,45,35)
ink=(32,42,55)

# Preserve the user-approved realistic two-panel visual.
# Replace only the lower generated instruction block where unsupported
# fixed duration/repetition text existed.
draw.rounded_rectangle([4,232,316,396],radius=6,fill=(250,252,255),outline=(205,220,238),width=1)
draw.text((14,242),"안전하게 따라 하세요",font=head,fill=blue)

safe_lines=[
    "• 목과 어깨 힘을 빼고 천천히 움직입니다.",
    "• 손은 머리에 가볍게 얹고 당기지 않습니다.",
    "• 통증 없는 범위에서만 부드럽게 시행합니다.",
]
y=266
for line in safe_lines:
    draw.text((14,y),line,font=body,fill=ink)
    y+=19

draw.rounded_rectangle([10,326,310,389],radius=5,fill=(255,247,235),outline=(238,198,124),width=1)
draw.text((18,334),"중단 신호",font=head,fill=red)
draw.text((18,356),"팔 저림·심한 어지럼·시야 이상·새 근력저하가",font=small,fill=ink)
draw.text((18,373),"생기면 즉시 중단하고 평가를 받습니다.",font=small,fill=ink)

img.save(SOURCE,"WEBP",quality=88,method=6)
print("PX001_SAFE_TEXT_CORRECTION_OK",SOURCE,img.size)
