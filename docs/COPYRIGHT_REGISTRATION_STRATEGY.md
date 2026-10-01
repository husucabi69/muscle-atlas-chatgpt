# Muscle Atlas — Copyright Registration Strategy

기준일: 2026-10-02  
상태: **LOCKED / PREPARE DURING DEVELOPMENT / FILE AFTER FIRST FINISHED IP PILOT**

## 1. 법적 기본선

- 저작권은 창작과 동시에 발생하며 등록은 권리 발생의 필수 요건이 아니다.
- 한국저작권위원회 등록은 저작자·창작연월일·공표연월일 등 권리정보를 공시하고 일정한 추정력과 권리행사상 효력을 제공한다.
- 창작연월일의 추정 효과를 확보하려면 창작 후 1년 이내 등록을 원칙으로 관리한다.
- 생성형 AI가 전적으로 만든 산출물 자체는 국내 등록대상으로 보지 않으며, 인간의 창작적 수정·증감·배열·편집 등으로 저작물성이 인정되는 부분은 등록 가능성이 있다.
- 따라서 Muscle Atlas는 **AI raw output을 그대로 등록하는 전략을 쓰지 않는다.**

## 2. Muscle Atlas의 권리화 대상

### A. 앱 소스코드
- HTML/CSS/JavaScript, PWA/service worker, clinical renderer, 3D/animation logic 등.
- 최종 filing 시 한국저작권위원회의 컴퓨터프로그램저작물 등록 분류를 우선 검토한다.

### B. 자체 해부학 2D 일러스트
- ANATOMY-IP-001의 최종 승인본.
- 사람의 해부학적 교정, 구성 선택, 선/색/레이어, label/overlay, 편집·가필을 거친 canonical master를 등록 후보로 한다.
- 단순 AI 생성 원본은 filing master로 사용하지 않는다.

### C. 실사형 환자교육·Physical Examination 일러스트
- 환자/검사자 위치, 손 위치, 힘 방향, 안전 overlay, 시작/시행/양성 3단계 구성 등 인간이 설계·교정한 표현 요소를 기록한다.
- 최종 master와 함께 작업 history를 보관한다.

### D. 3D 모델·scene
- 자체 제작 또는 적법한 source model을 인간이 구조적으로 편집·가공한 최종 scene.
- 외부 source asset은 license/provenance를 분리 기록하고, 제3자 권리 부분을 자기 저작물이라고 신고하지 않는다.

### E. Motion animation
- key pose, camera, timing, motion path, highlight, 교육 overlay 등을 인간이 설계·편집한 최종 animation.
- 파일 유형에 따라 미술/영상/프로그램 중 실제 등록 분류는 filing 직전 위원회 상담으로 확정한다.

### F. Atlas의 선택·배열
- 205 canonical muscles, 해부학-임상-초음파-검사-운동의 선택·배열에 독창성이 인정될 수 있는 범위는 편집저작물 후보로 별도 검토한다.

## 3. 인간 창작기여 증빙 체계

각 자체 IP asset은 registry에 다음을 보존한다.
- stable_id
- author/editor
- creation_date
- first_publication_date
- AI/tool used
- raw_generation_id 또는 source asset reference
- human_edit_summary
- anatomy_corrections
- composition_decisions
- label/overlay decisions
- source/reference list
- license/provenance
- canonical master file hash
- Git commit SHA
- review status
- screenshots / before-after evidence

권장 폴더:
- `docs/ip-evidence/`
- `data/ip-asset-registry-v1.json`

## 4. 인간 창작기여 최소 Gate

등록 후보는 아래를 모두 만족해야 한다.
1. 단순 prompt → 단일 output 그대로가 아니다.
2. 해부학적 구조를 사람이 검토·수정했다.
3. 구도/레이어/색/라벨/overlay 중 복수 항목을 사람이 구체적으로 결정했다.
4. final master와 raw candidate 사이의 수정 history가 남아 있다.
5. 제3자 교과서/사진/3D model을 실질적으로 복제하지 않았다.
6. AI 사용 여부와 인간 추가 작업을 registration note에서 숨기지 않는다.

## 5. 등록 실행 시점

### Filing 1 — 첫 자체 IP 파일럿 직후
- Splenius capitis를 포함한 경추-견갑대 2D 자체 해부학 일러스트 파일럿이 사용자 승인된 시점.
- 등록 전 한국저작권위원회 AI 특화 상담/등록상담으로 작품 분류와 AI 기여 기재방법을 확인한다.

### Filing 2 — 실사형 Physical Examination 첫 완성 세트
- 한 부위 전체가 실사형 환자+검사자 자산으로 승격된 뒤.
- 개별 저작물 vs 일괄/편집저작물 방식 중 비용·보호범위를 상담 후 결정한다.

### Filing 3 — 3D + Motion 파일럿
- 경추-견갑대 3D scene과 Splenius capitis motion animation이 완성된 뒤 별도 또는 묶음 분류를 상담한다.

### Filing 4 — 앱 소스코드 Release candidate
- Stage 23C PASS 후 Stage 24 Production 직전 exact SHA를 프로그램저작물 등록 후보로 보존한다.

## 6. 실제 신청 경로

한국저작권위원회 온라인 등록시스템을 기본으로 사용한다.
- 회원가입 및 인증서 준비
- 저작물 정보·저작자 정보·창작/공표 정보 작성
- 복제물/설명자료 및 AI 활용·인간 추가 작업 설명 준비
- 수수료 납부
- 심사/보완 대응
- 등록증 및 등록부 정보 보존

등록상담: 한국저작권위원회 1800-5455 (등록상담 2번)

## 7. 금지

- AI-only raw output을 사람이 창작한 전체 결과물이라고 신고
- 외부 교과서/사진/3D asset의 제3자 저작권 부분을 자기 저작물이라고 신고
- creation date를 Git history와 모순되게 기재
- AI 사용 사실 또는 source license를 evidence에서 삭제
- 등록을 했다는 이유만으로 제3자 권리침해가 없다고 간주

## 8. 개발 로드맵 연계

**지금은 등록 신청 자체보다 증빙 가능한 창작 workflow를 먼저 구축한다.**
ANATOMY-IP-001 착수 시 `data/ip-asset-registry-v1.json`과 `docs/ip-evidence/`를 같이 시작한다.
첫 자체 2D 파일럿 승인 시 Filing 1을 실행한다.
