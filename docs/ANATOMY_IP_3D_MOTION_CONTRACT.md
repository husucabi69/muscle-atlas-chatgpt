# Muscle Atlas — Anatomy IP / 3D / Motion Canonical Contract

기준일: 2026-10-01  
상태: **LOCKED / MUST DEVELOP**  
정본 branch: `preview/development`  
상위 정본: `docs/NEXT_UPGRADE_ROADMAP.md`

## 1. 목적

Muscle Atlas가 외부 교과서 그림 링크를 모아 보여주는 수준을 넘어, 자체 제작한 고품질 해부학 시각자산을 보유한 교육 플랫폼이 되도록 한다.

필수 트랙:
- **ANATOMY-IP-001** — 자체 2D 해부학 근육 도해
- **ANATOMY-3D-001** — 회전/확대/레이어 제어가 가능한 3D 해부학 뷰어
- **MOTION-ANIM-001** — 개별 근육 및 근육군의 작용 애니메이션

이 3개 트랙은 Idea backlog가 아니라 **실행이 보장된 canonical workline**이다. 임의 삭제, 무기한 연기, 구현 없이 Production 완료 처리하는 것을 금지한다.

## 2. 저작권·출처 원칙

- 해부학적 사실(기시, 정지, 작용, 신경지배 등)은 사실정보로 취급한다.
- 최종 그림의 구도, 선, 색, 레이어, 라벨, 3D 모델 표현, 애니메이션 표현은 Muscle Atlas 고유 창작물로 제작한다.
- Gray, Grant, Thieme 등 특정 교과서의 한 도판을 그대로 복제·트레이싱·재색칠하거나 실질적으로 동일한 구도를 재현하지 않는다.
- 참고문헌은 구조·사실 확인용으로만 사용하며, 최종 시각표현은 독립적으로 구성한다.
- 외부 3D 모델을 사용하는 경우 Public Domain / CC / 명시적 상업·수정 허가 등 재사용 조건을 asset metadata에 기록한다.
- 생성/제작 자산은 Stable ID, 제작일, 제작방식, 검수상태, source/reference note, license/provenance를 registry에 남긴다.

## 3. ANATOMY-IP-001 — 자체 2D 해부학 도해

### 필수 품질
- 교과서급 구조 정확도와 임상교육 가독성
- whole-muscle course가 한눈에 보이는 대표 시야
- anterior / posterior / lateral 및 필요 시 deep layer
- origin / insertion / tendon / 주변 뼈와의 관계를 선택적으로 표시
- label on/off
- 전문가용 상세판 + 환자/학생용 단순판을 동일 Stable ID 계열로 관리
- SVG 또는 충분한 고해상도 raster 원본을 보존하고 모바일/PC/A4에서 재사용 가능해야 함

### 파일럿 부위
**경추–견갑대**를 첫 파일럿으로 고정한다.

우선 근육:
1. Splenius capitis / 두판상근
2. Levator scapulae / 견갑거근
3. Trapezius / 승모근
4. Sternocleidomastoid / 흉쇄유돌근
5. Scalenes / 사각근군
6. Suboccipital muscles / 후두하근군

첫 번째 mandatory pilot muscle은 **Splenius capitis**다.

### 완료 Gate
- 선택 근육의 대표 도해가 기존 임시/외부 도해보다 교육적으로 우수함
- origin/insertion/course가 해부학적으로 검수됨
- 근육 상세의 기존 가로 탭 UX를 깨지 않고 연결
- 모바일/PC visual QA PASS
- 외부 교과서 도판 직접복제 0

## 4. ANATOMY-3D-001 — 3D 해부학 뷰어

### 필수 기능
- drag rotation
- zoom
- reset orientation
- muscle on/off
- bone on/off
- layer visibility / transparency
- 선택 근육 highlight
- anterior/posterior/lateral orientation helper
- 모바일 touch 조작 + PC mouse 조작

### 기술 방향
- 웹 표준 기반 WebGL을 우선한다.
- 모델 전달 형식은 **glTF/GLB**를 기본 후보로 한다.
- 앱 구현은 Three.js 또는 동급 경량 renderer를 검토하되 현재 PWA/Cloudflare 정적 배포 구조를 유지한다.
- 초기 파일럿 때문에 별도 서버/DB를 도입하지 않는다.
- 저사양 모바일에서 과도한 polygon/texture 비용을 만들지 않는다.

### 파일럿
2D 파일럿과 동일한 **경추–견갑대**를 사용한다.  
사용자는 최소한 뼈와 선택 근육을 회전·확대하고, 다른 근육층을 숨기거나 투명화할 수 있어야 한다.

### 완료 Gate
- PC/Android에서 rotate/zoom/toggle 정상
- frame/UI freeze 없음
- 선택 근육이 2D Stable ID와 동일 ID로 연결됨
- 모델 provenance/license audit PASS
- offline/PWA cache 전략이 검증됨

## 5. MOTION-ANIM-001 — 근육 작용 애니메이션

### 첫 mandatory animation
**Splenius capitis / 두판상근**

반드시 표현:
- neutral position
- bilateral contraction → cervical extension
- unilateral contraction → ipsilateral rotation
- unilateral contraction → ipsilateral lateral flexion
- 작용 방향 화살표
- 움직이는 관절/분절의 교육적 범위 표시
- 과장된 ROM을 실제 생리적 움직임처럼 오인시키지 않는 시각 경계

### 일반 구조
- muscle highlight
- joint axis / motion direction
- start → contraction → end
- replay/pause
- 속도 조절은 선택 기능
- 텍스트 Function 데이터와 animation metadata를 Stable ID로 연결
- 근육 작용이 복합적일 경우 bilateral/unilateral 또는 open/closed-chain context를 구분

### 완료 Gate
- 2D/3D canonical function과 animation의 방향 불일치 0
- 모바일/PC에서 재생 가능
- 사용자가 움직임의 방향을 설명 없이도 이해할 수 있는 수준
- Runtime E2E + 사용자 Preview visual QA

## 6. 구현 순서

현재 Active workline을 중단하지 않는다.

1. EXAM-001 현재 canonical clinical test illustration workline 계속 진행
2. QPU Deployment Safety Baseline의 짧은 경량 gate를 자연스러운 배치 경계에서 적용
3. Stage 23B Patient Exercise Illustration 잔여 work
4. Stage 23B-Disease Rehab
5. **Stage 23B-Anatomy IP Pilot — ANATOMY-IP-001**
6. **Stage 23B-3D Anatomy Pilot — ANATOMY-3D-001**
7. **Stage 23B-Motion Animation Pilot — MOTION-ANIM-001**
8. Stage 23C Integrated Real Device & Visual Gate
9. Stage 24 Google Play Production Release

위 5~7은 **Stage 23C 진입 전 mandatory pilot**이다.

## 7. 파일럿 이후 확장

- pilot 완료 후 205 canonical muscles의 자체 2D 도해 coverage를 점진적으로 확대한다.
- 3D와 motion은 임상·교육 가치가 높은 부위/근육군부터 확장하되 영구 backlog로 방치하지 않는다.
- 대표 해부도해 refresh는 기존 외부 media refresh와 분리하여 **own-asset replacement track**으로 관리한다.
- 자체 자산이 충분히 우수하고 검수되면 외부 representative illustration slot을 자체 asset으로 교체한다.

## 8. 금지

- 특정 교과서 도판의 tracing/near-copy
- 출처·license 불명 3D model 편입
- 해부학적으로 틀린 origin/insertion/course를 시각적으로 그럴듯하다는 이유로 승인
- 장식용 3D 때문에 앱 기본 navigation/PWA/offline 성능을 훼손
- animation을 실제 관절 ROM/근육 기능보다 과장
- 사용자 승인 없이 Production main 승격

