# Muscle Atlas Current Handoff

Updated: 2026-09-29 KST

This document is the canonical handoff checkpoint for continuing development of **이윤석정형외과 근육**.

## 1. Repository / branch / release safety

- Repository: `husucabi69/muscle-atlas-chatgpt`
- Development branch: `preview/development`
- Production branch: `main`
- Production frozen SHA: `4ba8740ca6655ab1d4bebca84b26e39290c61bf7`
- **Never change or promote `main` without explicit user approval.**
- Latest verified baseline before the current research-queue checkpoint: `13950a56bf531a97eb68cd25f3d051e5e79e5919` — canonical handoff commit, Global QA run `36566509370` PASS.
- Latest implementation checkpoint before this handoff refresh: `2d4c5f6b8724dc96acb614b78e48f8bb40d3f71b` — remaining anatomy-gap research queue + QA gate.
- Current Preview app version remains `v11.61 · Pelvic Floor Representative Views`.
- Global QA run `36567102376` for the research-queue checkpoint was in progress at handoff refresh. The next session must check its final result before overlapping edits.

## 2. User communication contract

Always explain to a non-developer first.

Every progress/final report must be:
1. **뭘 했나**
2. **어떻게 됐나 — PASS / FAIL / BLOCKED**
3. **앞으로 뭘 할 건가**

Technical SHA / workflow / file names come after the easy explanation.

Manual chat work:
- target 15 minutes
- hard ceiling 18 minutes
- if CI is still running, stop at a safe checkpoint and let the next turn check the result

Scheduled overnight work:
- every day **00:00 through 08:00 KST, every hour**
- target about 45 minutes of real development per run
- 45–50 minutes is wrap-up only
- hard stop at 50 minutes even if CI is still running
- every run must re-check latest HEAD and previous results before editing to avoid duplicate/conflicting work

## 3. Highest development rules

Primary constitution: `docs/DEVELOPMENT_CONSTITUTION.md`

Do not hotfix around root causes.

Order:
`root cause → structural fix → focused regression → needed full regression → Preview verify`

Do not use TinyFish. Browser QA source of truth is GitHub Actions Playwright plus actual user-device Preview checks.

## 4. Anatomy UX contract — LOCKED

Visual/interaction baseline:
- `v11.14 · Stage 17 Precision Anatomy`
- baseline SHA: `e6dc0492a4d16d0536e15db3f6162b8ec57ee757`

Navigation:
`해부학 부위 → 근육 목록 → 근육 상세`

Inside muscle detail, preserve the same-screen five horizontal tabs:
`기본정보 | 해부도해 | 초음파 | 임상 | 심화·학습`

Do not create extra deep-history screens inside those five tabs.

Basic information must immediately expose O/I/F/N plus blood supply, palpation, clinical and ultrasound essentials.

## 5. Stage 23A / Stage 23B status

Stage 23A:
- CLOSED / USER PROCEED AUTHORIZED
- A5 Clinical, A6 Ultrasound, A7 Quiz, A8 Oral, A9 Personal Learning, A10 Home/Search all closed by explicit user progression
- do not retroactively claim device visual PASS where only progression was authorized

Stage 23B:
- **ACTIVE**
- user-approved final patient-exercise visual style = realistic human / photo-realistic clinical patient-education illustration
- not stick figure, not abstract SVG final, not chibi/fantasy
- one composite should clearly show `1 · 시작` and `2 · 끝`, same person, movement direction, support/fixation, common-error cue
- white clinical background, Korean labels, mobile-readable, A4 printable
- registry: `data/patient-exercise-realistic-assets-v1.json`
- current realistic asset status at handoff:
  - px009 squat = `STYLE_REFERENCE_APPROVED` only
  - px001–008, px010–018 = `PENDING_GENERATION`
  - no realistic composite URL is yet connected in the registry
- existing SVG remains migration fallback only, not final

## 6. Mandatory disease rehabilitation stage

`Stage 23B-Disease Rehab` is mandatory and blocks Stage 23C.

Registry:
`data/patient-rehab-disease-roadmap-v1.json`

Patient path target:
`환자교육 → 질환별 재활 → 해부학 부위 → 대표 질환 → 재활 프로그램`

Per-disease patient module must include:
- easy disease explanation
- who it is for / contraindications / red flags
- stretching
- strengthening
- lifestyle/activity modification
- common mistakes
- progression/phase when evidence supports it
- return/reassessment criteria
- evidence sources + last reviewed
- realistic exercise illustrations when needed
- mobile presentation + A4/PDF print

User specifically requested that disease modules may also use realistic illustrations when useful.

Examples explicitly preserved:
- adhesive capsulitis / 오십견
- rotator cuff / supraspinatus tendinopathy or tear
- supraspinatus-related stretching and strengthening
- osteoarthritis / degenerative joint disease
- user phrases `퇴행성 통증 증후군` and `연골 낭종` remain terminology-review items until normalized

## 7. Extensible content architecture

The app must remain continuously expandable.

Future user instructions such as:
- “이 질환 추가”
- “이 근육 운동 추가”
- “이 재활교육 추가”
- “이 초음파/X-ray/해부학 사진으로 교체”

must be handled without breaking existing routes by using:
- Stable IDs
- registry-driven content
- replaceable asset slots
- explicit source/license/last-reviewed metadata

Better anatomy, ultrasound, X-ray, rehab, or video assets may replace weaker current assets later.

## 8. Current anatomy representative-view quality track

User explicitly requires **whole-muscle representative anatomy views**, not merely any available picture.

Representative-view rule:
- prefer the view that shows overall belly/course/origin-insertion relationship and key landmarks
- axial/transverse/cross-section images are **not** acceptable as primary representative views when a whole-muscle view exists

Confirmed corrections already completed:
- m011 두반극근: old Gray384 C6 cross-section → `Gray389 Semispinalis capitis.png` posterior whole-course view
- m003 중사각근: old Gray384 C6 cross-section → `Gray385 - Scalenus medius muscle.png` lateral whole-course view
- automated QA now rejects Gray384 cross-section assets as representatives

Current audit ledgers:
- `data/muscle-illustration-audit-v1.json`
- `data/media-v1.json`
- `data/atlas-media-gap-audit-v1.json`
- QA: `scripts/muscle-illustration-audit-qa.mjs`
- QA: `scripts/atlas-media-gap-qa.mjs`

Latest state at the handoff baseline:
- canonical muscles: 205
- source gaps remaining: **18**
- manual visual re-audit candidates: **0**
- previously there were 28 gaps and 17 manual re-audit candidates; later work reduced these
- m056 Puborectalis was most recently updated to `Pelvic Muscles (Female Inferior).png`
- current baseline HEAD commit message: `QA: update required puborectalis representative asset`

Research order for those 18 is now explicitly stored in `data/atlas-media-gap-audit-v1.json`:
- **P1:** m120–m122 palmar interossei, m132 articularis genus, m137 adductor magnus hamstring part, m193 scalenus minimus, m197 spinalis cervicis, m205 articularis cubiti
- **P2:** m025–m028 thoracic deep segmental muscles and m039–m043 lumbar deep segmental muscles
- **P3:** m171 variable opponens digiti minimi of foot
- Each queue item has a stop rule so weak/group-level/cross-section substitutes are not promoted just to close the gap.
- m137 now has a documented public-domain research lead (Gerrish 1902 Fig.356 plus Gray whole-adductor plates) but remains a source gap because the hamstring/ischiocondylar part is not directly separated.

Remaining 18 anatomy source gaps:
- m025 흉다열근
- m026 흉회선근
- m027 흉극간근
- m028 흉횡돌기간근
- m039 요최장근
- m040 요극근
- m041 요다열근
- m042 요회선근
- m043 요극간근
- m120 제1수장골간근
- m121 제2수장골간근
- m122 제3수장골간근
- m132 무릎관절근
- m137 대내전근-햄스트링부
- m171 발 소지대립근(가변)
- m193 최소사각근
- m197 경극근
- m205 주관절근(articularis cubiti / subanconeus)

Do not fill a gap just to reach 205/205.
Only promote an asset when part-specific identity and reuse terms are sufficiently clear.
If no suitable reusable public representative exists, keep an explicit source-gap decision.

## 9. Ultrasound media status

Canonical ultrasound view source coverage:
- 131 / 131 actual-ultrasound source references
- unverified canonical source: 0

But direct in-app reusable visual coverage remains limited:
- embedded/reusable actual ultrasound: 5
- link-only actual-ultrasound reference: 126

Therefore “source exists” is not the same as “representative ultrasound is directly visible inside the app.”

Ongoing media-refresh objective:
- search academic / society / university / hospital / high-quality public educational sources
- verify it is actual ultrasound, not generated B-mode
- verify exact source/Figure/license/reuse conditions
- promote only when the new source is clearly better educationally and legally reusable
- otherwise preserve canonical link-only reference

Ultrasound/media searching must not stop the main development line.

## 10. Immediate next-work order

At the start of every new session:
1. fetch exact latest `preview/development` HEAD
2. check latest Global QA / runtime / Cloudflare status
3. compare with this handoff because overnight scheduled work may have changed the branch
4. do not repeat completed work

Immediate quality-track work:
1. continue the **18 remaining anatomy source gaps**, prioritizing clear whole-muscle reusable representative views
2. when a candidate is uncertain, keep the gap rather than force a weak image
3. keep `atlas-media-gap-audit-v1.json` synchronized
4. run focused anatomy/media QA and needed global regression

Then continue the main Stage 23B line:
1. generate/connect realistic patient-exercise illustrations
2. mobile + A4 visual QA
3. build Stage 23B-Disease Rehab
4. Stage 23C real-device integrated gate
5. only after explicit user approval, Stage 24 Production promotion

## 11. Production rule

**main stays frozen.**
No merge, promotion, production deployment, or release submission without explicit user instruction.
