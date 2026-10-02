# Muscle Atlas — Anatomy IP / 3D / Layer / Motion Canonical Contract

기준일: 2026-10-02  
상태: **LOCKED / MUST DEVELOP / COPYRIGHT-FIRST**  
정본 branch: `preview/development`  
상위 정본: `docs/NEXT_UPGRADE_ROADMAP.md`

## 1. 최종 목표

Muscle Atlas는 외부 해부학 도판을 수집·재가공하는 앱이 아니라, **의학적 해부학 지식을 바탕으로 독립 제작한 자체 해부학 Master 자산**을 보유하는 교육 플랫폼으로 개발한다.

목표 품질은 Grant / Netter / Gray / Thieme 등 고급 해부학 교본에서 기대하는 수준의:
- 정확한 구조
- 명확한 깊이 관계
- 교육적으로 좋은 구도
- 고해상도 표현
- 일관된 색·라벨·레이어
를 지향하되, **특정 교본의 도판·구도·색·선·mesh를 복제·트레이싱·near-copy하지 않는다.**

핵심 설계 원칙은 다음과 같다.

> **해부학 사실 정본 → 자체 3D Canonical Master → 2D 교본판 / 3D Rotation / Layer Transparency / Muscle Action Animation 파생**

2D와 3D를 서로 독립적으로 만들지 않는다.  
가능한 모든 시각자산은 동일한 자체 3D Master와 동일 Stable ID에서 파생시켜 해부학적 일관성을 유지한다.

---

## 2. 저작권·독립창작 원칙

### 사용할 수 있는 것
- 기시·정지·주행·기능·신경지배·혈액공급 등 해부학적 사실
- 다수의 신뢰 가능한 해부학·임상 자료를 통한 사실 교차검증
- 자체 설계한 좌표, mesh, camera, layer, 색, label, lighting, animation
- 생성형 AI를 concept/render assistant로 활용하되 인간이 구조와 표현을 직접 교정·결정한 결과

### 금지
- 특정 교과서의 한 도판을 그대로 따라 그리기
- 기존 도판을 tracing / recoloring / style-transfer하여 자체 저작물로 취급
- 출처·license 불명 3D mesh를 수정하여 자체 original master라고 표기
- 인터넷 이미지·교재 screenshot·실제 환자 사진을 기초 raster로 사용
- AI raw output을 인간 창작 최종 master로 오기

### 권리화 목표
저작권의 핵심은 해부학적 사실 자체가 아니라 Muscle Atlas가 독자적으로 만든:
- 3D mesh와 topology의 창작적 표현
- 2D camera/composition
- 색·재질·광원
- layer 설계
- label/overlay 배열
- animation key pose / timing / camera / highlight
- 전체 선택·배열 및 교육적 편집
에 두며, 각 인간 창작기여를 개발 단계부터 증빙한다.

---

## 3. ANATOMY-KNOWLEDGE-001 — 해부학 사실 정본

모든 자체 시각자산보다 먼저 만든다.

각 근육 Stable ID마다 최소 다음을 구조화한다.
- origin
- insertion
- fiber/course direction
- superficial/deep relationship
- adjacent bones / joints
- adjacent muscles / fascia
- major nerve / vessel relationship when educationally necessary
- bilateral / unilateral action
- joint axis / expected motion direction
- clinically relevant variation
- reference list
- reviewer note

이 단계는 **표현을 베끼는 단계가 아니라 해부학 사실을 검증하는 단계**다.

### Gate
- 다수의 독립 reference로 핵심 해부 사실 교차검증
- 사실과 특정 교재의 시각표현을 분리
- Stable ID와 canonical O/I/F/N 데이터 불일치 0
- 전문의 human review 기록

---

## 4. ANATOMY-MASTER-3D-001 — 자체 3D Canonical Master

### 역할
이 트랙이 전체 자체 해부학 IP의 **중심 원본**이다.

2D 교본판, 3D rotate viewer, layer transparency, isolated-muscle view, motion animation은 가능하면 이 Master에서 파생한다.

### 필수 구성
- bones / major landmarks
- target muscle body
- tendon / aponeurosis as needed
- neighboring muscles required for depth context
- origin / insertion anchors
- hierarchical layer metadata
- left/right anatomy
- neutral pose
- action rig / pivot metadata
- Stable ID mapping

### 제작 원칙
- 자체 mesh를 기본 원칙으로 한다.
- 외부 source model을 사용해야 할 경우 license/provenance를 분리하고, 그 제3자 부분을 자체 original master라고 표시하지 않는다.
- topology / proportions / landmarks / fiber-direction appearance를 사람이 해부학적으로 교정한다.
- 특정 교본 도판의 3D 재현을 목표로 하지 않는다.

### 기술 방향
- canonical delivery: glTF / GLB 우선
- editable master format 별도 보존
- WebGL / Three.js 또는 동급 renderer
- 정적 PWA / Cloudflare 구조 유지
- mobile polygon / texture budget 별도 관리

### Gate
- origin / insertion / course 검수
- surface/deep relationship 검수
- 좌우/회전 시 구조 붕괴 0
- editable master + export master hash 기록
- IP evidence 기록 완료
- user Preview 승인

---

## 5. ANATOMY-IP-2D-001 — 자체 고해상도 2D 교본판

2D는 독립 생성물이 아니라 **3D Master에서 파생한 뒤 인간이 교육용으로 재구성하는 정식 저작물**로 만든다.

### 필수
- whole-muscle 대표 시야
- anterior / posterior / lateral / oblique 중 가장 교육적인 시야
- origin / insertion / course
- surrounding bones
- 필요한 adjacent muscle context
- label on/off
- expert plate / simplified learner plate
- A4 이상 고해상도 master

### 인간 창작 편집
- camera 결정
- crop / composition
- lighting / shading
- muscle palette
- depth cue
- label position
- callout / leader line
- clinically important structure 강조

### Gate
- 기존 외부 도판보다 교육적으로 독립적이고 명확함
- 3D Master와 해부구조 불일치 0
- 특정 교본 near-copy 0
- mobile / PC / A4 visual QA
- final master + edit history + hash 보존

---

## 6. ANATOMY-3D-VIEWER-001 — 3D Rotation Viewer

### 필수 기능
- drag rotation
- zoom
- reset orientation
- anterior / posterior / lateral quick view
- muscle on/off
- bone on/off
- selected muscle highlight
- label on/off
- mobile touch / PC mouse

Viewer는 3D Master를 다시 만드는 별도 모델이 아니라 **Canonical Master를 표시하는 인터페이스**다.

### Gate
- PC / Android rotate·zoom 정상
- Stable ID 유지
- frame/UI freeze 없음
- offline/PWA cache 정상

---

## 7. ANATOMY-LAYER-001 — 층별 투명화 / 해부 레이어

사용자가 표층에서 심층으로 해부관계를 이해할 수 있게 한다.

### 필수
- skin / superficial / intermediate / deep / bone 단계
- muscle group on/off
- selected muscle isolation
- opacity slider
- neighboring structure context 유지
- layer preset
- reset

### 핵심 원칙
단순히 그림 여러 장을 교체하는 것이 아니라 **동일 3D Master의 계층 관계를 실제로 제어**한다.

### Gate
- layer ordering 오류 0
- 근육이 잘못된 깊이에 배치되는 오류 0
- transparency에서도 selected muscle 식별 가능
- 모바일 GPU 부담 허용 범위

---

## 8. MOTION-ANIM-001 — Muscle Action Animation

### 첫 mandatory animation
**Splenius capitis / 두판상근**

### 필수 표현
- neutral
- bilateral contraction → cervical extension
- unilateral contraction → ipsilateral rotation
- unilateral contraction → ipsilateral lateral flexion
- active muscle highlight
- contraction cue
- motion arrow
- replay / pause
- start / mid / end 상태

### 원칙
Animation도 별도 그림을 임의로 만드는 것이 아니라 **동일 3D Master의 rig / pivot / action metadata에서 파생**한다.

ROM은 교육적 표현이며 실제 모든 개인의 정확한 생리 ROM 수치처럼 보이게 과장하지 않는다.

### Gate
- canonical Function 데이터와 motion 방향 불일치 0
- 좌/우 ipsilateral 방향 오류 0
- motion 중 mesh distortion 허용한계 통과
- 모바일/PC 재생 정상
- 사용자 Preview visual QA

---

## 9. IP-EVIDENCE-001 — 저작권 증빙 파이프라인

ANATOMY-KNOWLEDGE-001 시작과 동시에 가동한다.

각 asset마다 보존:
- stable_id
- author/editor
- creation_date
- reference facts
- AI/tool usage
- initial sketch / raw generation ID if any
- modeling decisions
- anatomy corrections
- topology / mesh revisions
- camera / composition decisions
- color / material / lighting decisions
- labels / overlays
- animation decisions
- before-after evidence
- editable master hash
- export master hash
- Git commit SHA
- review status
- user approval date

정본 저장소:
- `data/ip-asset-registry-v1.json`
- `docs/ip-evidence/`

이 증빙은 나중에 소급 작성하지 않는다. **제작과 동시에 기록한다.**

---

## 10. IP-REG-001 — 저작권 등록 실행

저작권 등록은 개발 종료 후의 부가업무가 아니라 별도 release gate다.

### Filing 1
경추–견갑대 자체 해부학 파일럿 중 **첫 완성 저작물 세트가 사용자 승인된 직후** 실행한다.

권장 첫 등록 패키지:
- Splenius capitis 3D Canonical Master의 인간 창작 부분
- 그 Master에서 파생·편집한 고해상도 2D plate
- 제작 과정 / human-edit evidence
- 필요 시 저작물 분류에 맞는 설명자료

### Filing 2
경추–견갑대 Layer / 3D Viewer scene 완성 후.

### Filing 3
Splenius capitis Muscle Action animation 완성 후.

### Filing 4
Stage 23C PASS 후 Stage 24 직전 앱 source-code release candidate.

각 filing 직전 실제 등록 분류·AI 활용 기재 방식은 한국저작권위원회 최신 안내를 재확인한다.

---

## 11. 경추–견갑대 Pilot

필수 근육:
1. Splenius capitis / 두판상근
2. Levator scapulae / 견갑거근
3. Trapezius / 승모근
4. Sternocleidomastoid / 흉쇄유돌근
5. Scalenes / 사각근군
6. Suboccipital muscles / 후두하근군

첫 mandatory muscle:
**Splenius capitis**

### 첫 근육에서 한 번에 검증할 자산군
1. anatomy knowledge spec
2. own 3D master
3. high-resolution 2D textbook plate
4. 3D rotate view
5. layer transparency / isolation
6. muscle action animation
7. IP evidence package
8. copyright filing candidate

Splenius capitis 하나에서 이 전체 파이프라인을 검증한 후 나머지 5개에 반복한다.

---

## 12. Canonical 구현 순서

현재 Active EXAM-REAL 작업선을 중단하지 않는다.

1. EXAM-REAL-001 cervical pilot
2. Stage 23B patient-exercise realistic 잔여
3. Stage 23B-Disease Rehab
4. **ANATOMY-KNOWLEDGE-001**
5. **IP-EVIDENCE-001 시작**
6. **ANATOMY-MASTER-3D-001 — Splenius capitis**
7. **ANATOMY-IP-2D-001 — Master-derived 2D plate**
8. **IP-REG-001 Filing 1**
9. **ANATOMY-3D-VIEWER-001**
10. **ANATOMY-LAYER-001**
11. **MOTION-ANIM-001**
12. IP-REG-001 Filing 2/3 as applicable
13. 경추–견갑대 6-muscle pilot 확장
14. Stage 23C Integrated Real Device & Visual Gate
15. Stage 24 Google Play Production
16. 205-muscle own-asset expansion evergreen track

4~13은 Stage 23C 이전 mandatory pilot이다.

---

## 13. 완료 정의

경추–견갑대 Pilot은 단순히 그림 한 장이 예쁘게 나온 것으로 완료하지 않는다.

완료 조건:
- 자체 3D Master 존재
- 2D plate가 Master와 일치
- rotate viewer 정상
- layer transparency 정상
- isolated muscle view 정상
- muscle action animation 정상
- IP evidence 완성
- 저작권 등록용 candidate package 준비
- 전문의 해부학 검수
- mobile / PC visual QA
- 사용자 Preview 승인
- 특정 외부 교본 near-copy evidence 0

---

## 14. 파일럿 이후 확장

- 205 canonical muscles 전체를 동일 Stable ID / 동일 Master-first 구조로 확장한다.
- 각 부위마다 먼저 regional master를 구축하고, 2D/3D/layer/motion을 파생한다.
- 외부 representative anatomy illustration은 자체 자산이 교육적 품질과 QA를 통과한 뒤 순차 교체한다.
- 외부 자료 refresh는 reference fact checking용으로 남길 수 있으나 자체 IP 제작선을 선점하지 않는다.

---

## 15. 절대 금지

- 특정 교본 도판 tracing / near-copy
- style-transfer를 통한 사실상 복제
- 출처 불명 mesh 편입
- AI raw output을 자체 최종 저작물로 오기
- 2D와 3D를 서로 다른 해부구조로 독립 제작
- 해부학적으로 틀린 origin/insertion/course 승인
- layer depth 오류 승인
- muscle action 방향 오류 승인
- 저작권 evidence를 개발 완료 후 소급 작성
- 사용자 승인 없이 Production main 승격
