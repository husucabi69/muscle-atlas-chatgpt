# muscle-atlas-chatgpt

> 개발 정본(canonical roadmap): `docs/NEXT_UPGRADE_ROADMAP.md`  
> 새 기능·사용자 피드백·release gate는 이 정본에 먼저 반영하고, 명시적 승인 전 Production `main`은 변경하지 않습니다.


MSK Muscle Anatomy & Ultrasound Atlas - ChatGPT

## Deployment model

Repository-side Cloudflare Pages readiness is enabled.

- Production branch: `main`
- Preview: every non-production branch / pull request
- Build command: `exit 0`
- Build output directory: `.`
- Root directory: repository root
- GitHub Pages remains the fallback/stable origin until Cloudflare Production + Preview are both verified.

Current GitHub Pages fallback:
https://husucabi69.github.io/muscle-atlas-chatgpt/

Cloudflare Dashboard setup:
`docs/CLOUDFLARE_PAGES_SETUP.md`

Deployment rule:
**branch → PR → Global QA → Cloudflare Preview visual verification → main merge → Cloudflare Production verification.**
