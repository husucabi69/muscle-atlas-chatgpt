# Muscle Atlas — Production Promotion Guard

기준일: 2026-10-02  
상태: **LOCKED / PRE-PROMOTION FAIL-CLOSED CONTRACT**  
정본 branch: `preview/development`

## 1. 절대 원칙

- `main`은 Production이다.
- `preview/development`는 유일한 장기 개발 정본이다.
- 사용자(의장)의 명시적 Production 승격 승인 전에는 `main`을 변경하지 않는다.
- 자동 merge 또는 자동 Production 승격은 만들지 않는다.

## 2. 승격 직전 필수 조건

승격 대상 exact SHA에 대해 아래가 모두 PASS여야 한다.

1. `global-qa`
2. `runtime-navigation-e2e`
3. `deploy-safety-gate`
4. `Cloudflare Pages` exact-SHA deployment
5. immutable Preview URL smoke
6. stable Preview branch alias와 exact Preview release 일치
7. PWA manifest / service worker / install-origin contract
8. Cloudflare Production ↔ GitHub Pages fallback release drift 0
9. 사용자 실기기 Preview 승인
10. 사용자 명시적 Production 승격 승인

하나라도 미충족이면 Production 승격 금지다.

## 3. Promotion preflight mode

`scripts/deploy-safety-gate.mjs`는 `DEPLOY_GATE_MODE=promotion`을 지원한다.

Promotion mode는:
- 현재 작업 SHA가 `preview/development` HEAD인지 확인
- `PROMOTION_APPROVED_BY_USER=YES`가 없으면 FAIL
- target SHA의 `global-qa`, `runtime-navigation-e2e`, `deploy-safety-gate`, `Cloudflare Pages`가 모두 success인지 확인
- 현재 Cloudflare Production과 GitHub Pages fallback이 서로 같은 release인지 확인
- actual main HEAD를 evidence에 기록

이 모드는 승격을 실행하지 않는다. **승격 직전 안전조건을 확인하는 fail-closed preflight**다.

## 4. 서버측 branch protection 한계

현재 연결된 GitHub App은 Administration 권한이 없어 branch protection/ruleset을 생성·변경할 수 없다.

따라서 저장소에서 관리자 권한으로 설정 가능한 시점에는 다음을 권장한다.
- main direct push 제한
- pull request 필수
- `global-qa`, `runtime-navigation-e2e`, `deploy-safety-gate` required status checks
- force push 금지
- branch deletion 금지

이 관리자 설정이 추가되기 전에도 본 프로젝트 운영 계약상 사용자 승인 없는 main 변경은 금지한다.

## 5. 승격 후 확인

main 승격 후:
- Cloudflare Production과 GitHub Pages fallback이 새 release로 수렴하는지 확인
- PWA update channel과 Production root를 혼동하지 않는지 확인
- Production smoke 및 Stage 23C 결과를 보존
- 문제가 있으면 새 기능 추가보다 즉시 회귀수정 우선

