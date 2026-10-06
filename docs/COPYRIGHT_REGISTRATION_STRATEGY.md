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

### B. 자체 해부학 3D Canonical Master + 2D 교본판
- `ANATOMY-MASTER-3D-001`의 자체 3D master와 그 master에서 파생·편집한 `ANATOMY-IP-2D-001` 최종 승인본을 핵심 등록 후보로 한다.
- 사람의 해부학적 교정, topology/mesh 결정, camera/composition, 선·색·재질·광원·레이어, label/overlay, 편집·가필을 기록한다.
- 2D와 3D를 따로 만들어 서로 다른 해부형태가 되지 않게 하고, 동일 Stable ID·동일 master에서 파생되었다는 증빙을 남긴다.
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
- `data/ip-provenance-v1.json`

## 4. 인간 창작기여 최소 Gate

등록 후보는 아래를 모두 만족해야 한다.
1. 단순 prompt → 단일 output 그대로가 아니다.
2. 해부학적 구조를 사람이 검토·수정했다.
3. 구도/레이어/색/라벨/overlay 중 복수 항목을 사람이 구체적으로 결정했다.
4. final master와 raw candidate 사이의 수정 history가 남아 있다.
5. 제3자 교과서/사진/3D model을 실질적으로 복제하지 않았다.
6. AI 사용 여부와 인간 추가 작업을 registration note에서 숨기지 않는다.

## 5. 등록 실행 시점

### Filing 1 — 첫 자체 Anatomy Master 파일럿 직후
- Splenius capitis의 자체 3D Canonical Master와 그 Master에서 파생·인간 편집한 고해상도 2D 교본판이 사용자 승인된 시점.
- 최소 제출 후보에는 human-edit history, anatomy correction, mesh/topology 변경, camera/composition 결정, 색·재질·라벨 결정, final hash와 Git SHA를 포함한다.
- 등록 전 한국저작권위원회 최신 상담/등록 안내로 작품 분류와 AI 활용 기재방법을 다시 확인한다.

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

## 6A. 사용자 사전 준비 — 지금 해둘 일

사용자는 실제 filing 직전에 처음 준비하지 않는다. 아래 항목은 미리 준비한다.

### 지금 바로 가능
1. 한국저작권위원회 저작권등록시스템(CROS) 회원가입.
2. 온라인 신청에 사용할 본인 인증서 준비.
3. 첫 등록의 권리주체 후보를 정리:
   - 저작자(인간 창작자)
   - 저작재산권자
   - 개인 보유 후 법인에 양도할지 여부
4. 앱/자산의 이름 표기를 일관되게 유지:
   - 작품명
   - 앱명
   - Stable ID
   - 버전명
5. 개인 신원정보·연락처 등 신청에 필요한 기본정보를 최신 상태로 유지.

현재 개발단계에서는 **등록신청서를 미리 제출하지 않는다.**
아직 완성 전 raw/candidate를 등록하기보다, 인간 창작기여가 충분히 누적되고 사용자 승인된 canonical master가 생긴 뒤 filing한다.

### 저작권자 구조 결정 Gate
첫 Filing 1 직전에는 반드시 사용자에게 다음을 확인한다.
- 저작자 표기를 누구로 할지
- 저작재산권을 개인이 보유할지, 사업체/법인으로 이전할지
- 공동저작 또는 업무상저작물 주장 가능성이 있는 제3자 기여자가 있는지
- 외주 제작자가 있는 경우 권리양도/이용허락 문서가 있는지

이 결정 없이 Filing 1을 진행하지 않는다.

## 6B. 한국 저작권 등록 시스템 — 실제 사용 경로

정식 온라인 시스템은 한국저작권위원회 **저작권등록시스템(CROS, www.cros.or.kr)** 을 사용한다.

위원회가 안내하는 기본 절차:
1. 등록상담
2. 신청서 작성
3. 등록신청
4. 수수료 및 등록면허세 납부
5. 등록심사
6. 등록부 등재 및 등록증 교부
7. 등록공보 발행
8. 사후 변경·열람·재발급 관리

온라인 접수는 회원가입과 인증서가 필요하다.

실제 비용은 신청 종류·건수·저작물 유형에 따라 달라지므로 **Filing 직전에 CROS 수수료 모의계산기를 다시 확인**한다. 개발문서에 오래된 고정 금액을 박아두지 않는다.

## 6C. 반드시 사용자에게 알려야 하는 Copyright Action Gates

개발 담당자는 다음 시점에 **사용자가 먼저 묻지 않아도 반드시 알림/보고**한다.

### COPYRIGHT-GATE-0 — ANATOMY-KNOWLEDGE 시작 직전
사용자에게 알릴 내용:
- 지금부터 등록 증빙이 시작된다는 점
- author/editor 표기를 확인해야 한다는 점
- CROS 회원가입/인증서 준비 여부 확인
- 향후 권리주체(개인/법인) 결정을 언제 할지

### COPYRIGHT-GATE-1 — Splenius capitis 3D Master가 최초 reviewable 상태가 되는 날
사용자에게 알릴 내용:
- raw/candidate가 아니라 인간 교정 이력을 남기기 시작했음을 확인
- 사용자 본인의 창작적 결정(구도/강조/색/레이어/라벨 등)을 review log에 남길 것
- 외부 자료가 사실확인용인지, 표현복제에 사용되지 않았는지 확인

### COPYRIGHT-GATE-2 — 3D Master + 2D plate 사용자 승인 직전
**Filing 1 준비를 시작하라고 반드시 통지.**
준비물:
- canonical master
- 인간 수정 전/후 증거
- anatomy correction log
- composition/camera/color/layer/label 결정 기록
- AI/tool 사용 설명
- source/reference 및 license/provenance
- final hash
- Git SHA
- 창작연월일/최초 공표연월일 후보
- 저작자/저작재산권자 정보

### COPYRIGHT-GATE-3 — 사용자 최종 승인 직후
**CROS 등록 실행 시점.**
등록 직전에는 한국저작권위원회의 최신 생성형 AI 활용 저작물 등록 안내를 다시 확인하고, 필요하면 등록상담(1800-5455, 등록상담 2번)을 먼저 한다.
작품분류가 불명확하면 임의로 선택하지 않고 상담 결과를 기록한 뒤 신청한다.

### COPYRIGHT-GATE-4 — 경추-견갑대 3D Viewer/Layer/Motion 완성
Filing 2/3의 별도 등록 또는 묶음 등록 여부를 다시 사용자에게 보고하고 결정받는다.

### COPYRIGHT-GATE-5 — Stage 23C PASS / Stage 24 직전
앱 source-code exact SHA를 보존하고 프로그램저작물 등록 여부를 사용자에게 반드시 상기시킨다.

## 6D. 등록 시점 원칙

- 저작권은 창작과 동시에 발생하므로 등록 전이라고 권리가 없는 것은 아니다.
- 다만 한국저작권위원회는 **등록된 창작연월일의 추정 효과를 위해 창작 후 1년 이내 등록**을 안내하므로, Filing 대상이 확정되면 불필요하게 미루지 않는다.
- raw AI candidate나 아직 사람이 충분히 수정하지 않은 산출물을 서둘러 등록하지 않는다.
- 반대로 최종 canonical master가 승인됐는데도 “나중에 한꺼번에”라고 장기간 미루지 않는다.
- 각 Filing 대상의 creation_date / approval_date / publication_date를 registry에 기록하고, Filing due window를 추적한다.

## 7. 금지

- AI-only raw output을 사람이 창작한 전체 결과물이라고 신고
- 외부 교과서/사진/3D asset의 제3자 저작권 부분을 자기 저작물이라고 신고
- creation date를 Git history와 모순되게 기재
- AI 사용 사실 또는 source license를 evidence에서 삭제
- 등록을 했다는 이유만으로 제3자 권리침해가 없다고 간주

## 8. 개발 로드맵 연계

**등록 준비와 창작은 동시에 진행한다. 증빙을 나중에 소급해서 만들지 않는다.**

정본 순서:
1. `ANATOMY-KNOWLEDGE-001` — 해부학 사실 정본
2. `IP-EVIDENCE-001` — 증빙 registry 즉시 시작
3. `ANATOMY-MASTER-3D-001` — 자체 3D Canonical Master
4. `ANATOMY-IP-2D-001` — Master-derived 고해상도 2D 교본판
5. 사용자 Preview 승인
6. `IP-REG-001 Filing 1`
7. 3D Viewer / Layer / Motion 완성에 따라 Filing 2/3
8. Stage 23C PASS 후 앱 source-code Filing 4 후보 보존

`ANATOMY-KNOWLEDGE-001` 시작 시 `data/ip-provenance-v1.json`과 `docs/ip-evidence/`를 동시에 시작한다.
