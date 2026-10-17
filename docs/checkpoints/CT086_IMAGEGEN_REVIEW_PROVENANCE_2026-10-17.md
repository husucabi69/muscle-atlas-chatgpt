# 2026-10-17 ct086 — OpenAI ImageGen 합성 사진형 3장면 구도, 원본+편집본 보존
상태: **NOT CLINICALLY REVIEWED / NOT APPROVED / NOT CANONICAL / COPYRIGHT GATE PENDING**
작업 ID: `EXAM-REAL-001 / ct086`
사용 금지 도구: Runway (조회 포함 0회)
기존 승인/데이터 변경: 없음
사용자 확인 경로: 앱 → 임상 모듈 → 경추 → Physical Examination → ct086 → 사진형 3장면 시안 크게 보기

## 실제 바이너리 (모두 GitHub 개발브랜치 원본 그대로 포함)
1. OpenAI ChatGPT ImageGen output (비-Runway): `assets/physical-exam-realistic/drafts/ct086-imagegen-source-20261017.png`
   - ImageGen `gen_id=a8ebfc48-ced5-4bea-a08b-b55f9703603e` (도구 출력 기록)
   - 1214×1295 RGB PNG; **1,943,231 bytes**.
   - SHA256 `1217a8fcecbcca209a274757591d078a2eb12704513b6671aa38f88eac071663`
   - Git blob SHA1 `bf76f9673e3e6b6900da7c27fb2932e073f0d99e`
   - 백업: 구글 드라이브 '의학' 폴더, 원본 `19r-Lt8p49-jZIOustX7q7bD0GhvNoqnh`.
2. Assistant-composited **review-only** 3-panel poster: `assets/physical-exam-realistic/drafts/ct086-imagegen-triptych-review-20261017.png`
   - 1024×1536 RGB PNG; **1,033,313 bytes**.
   - SHA256 `a86ec3f07765e7dfc87fdbaa39f19f6f31f48fa6ee457b8408845e001bb5d3a3`
   - Git blob SHA1 `277f2edb965f3c89e047a8fc52b959b2b1b3bad2`
   - 편집: 원본 각 사진에서 중립/좌회전/우회전/범위 제한 사진을 분할하여 세로 3장면에 배치. 1/3패널은 머리와 어깨가 모바일에서도 보이도록 확대·잘라내기. 2패널은 좌/우 능동 회전 사진을 나란히 배치. 흰색/청색 디자인과 정확한 세 장면 제목을 독자적으로 덧붙임. **개별 원본 장면 자체가 1024×1536 네이티브 사진이라는 뜻이 아니며**, 확대 결과를 2K 원본이라고 표현하는 행위 금지.
   - 백업: 구글 드라이브 '의학' 폴더, 편집본 `1ZmSrLm4fFVcQvMozf4tMRIzEwPZm13Cf`.

## 사진 내용에 관한 필수 미완료 검수
- 생성된 인물은 사진처럼 보이는 **AI 합성 인물**이며 실제 환자/검사자를 촬영한 사진이 아니다. 동일한 두 사람이 3패널에서 실제로 동일 인물인지 직접 확인하기 전에는 `SAME_IDENTITIES_ALL_PANELS` **PENDING**.
- 좌우 능동 회전, 회전 제한, 보상 운동은 이미지가 **사람의 임상 검수에 합격했다고 표시하지 않는다**. 검사자 얼굴·손 위치·좌우 방향·화살표·보상선·원본에 생성된 임베디드 설명의 정확성도 **PENDING**. 중립 패널은 환자와 검사자가 보이는 상체 중심 클로즈업이며 의자 전체는 잘려 있다.
- 원본 이미지에는 생성된 텍스트가 여러 개 포함되어 있다. 3패널 편집본에도 일부 원본 라벨이 남아 있으며 '세 허용 제목만' 계약을 만족한 것으로 **판정 불가**. 향후 의료진의 수정/교정과 원본 임상 시각검수 필수.
- SVG 벡터 시안(`ct086-original-pose-layout-review-20261015.svg`)과 기존 Stable-ID 도해는 계속 보존. 이전 금지 도구 후보는 새 이미지와 **별개의 역사 기록**으로 보존한다.
- `data/physical-exam-realistic-assets-v1.json`의 ct086은 `PENDING_GENERATION`, 승인 ct085 미변경. 신규 사진형 편집본을 `APPROVED`나 `CANDIDATE_GENERATED_USER_PREVIEW_PENDING`로 자동 등록하지 않았다.

## 저작권/IP 대응
- 이미지 생성은 OpenAI ImageGen 도구, 크롭·패널 구성은 assistant code 기반. 인간의 창작적 기여/선택·편집에 대한 실제 의장님/의료인의 후속 작업 기록 **없음**. 원본 산출물 또는 코드 자동편집만으로 한국 저작권등록 요건 충족 또는 독점 저작권 확보를 주장하지 않는다.
- CROS 계정 준비와 **실제 저작권등록은 별개**. 한국저작권위원회 등록 및 Stage 23C 선행 `COPYRIGHT-GATE-0~5`, `ANATOMY-MASTER-3D-001` 3D/Layer/Motion 의무 불변.
- 사용자에게 실제 화면에서 시안 링크를 제공하되, 임상·저작권 승인 전 정식 환자교육용 이미지로 사용하지 말라는 경고를 함께 표시한다.

## 차기 순서
1. 사진합성 결과의 임상 오류를 인간이 사진을 보고 검수·교정하고 네이티브 고해상도 개별 원본을 확보.
2. 검수 뒤 불필요한 텍스트, 부정확한 화살표, 인체 일관성/손·어깨 자세를 수정.
3. 독립 원본의 실제 PNG/WebP SHA·저작권·인간 창작기여 증빙 및 담당 의료진 서명 후에만 Preview 후보 연결, 그다음 의장님 승인.
4. ct087 후속; ct088 Hoffmann·Claude 2판 보류; Stage 23B/3D/저작권 선행 로드맵 보존.

**현재 성과는 실제 사진형 원본 파일 1개와 시안 파일 1개를 앱에 클릭 가능한 검수용 자산으로 연결한 것이며, 의학적으로 검수된 완성본이 아니다.**
