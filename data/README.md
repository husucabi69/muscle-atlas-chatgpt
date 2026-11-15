# LYSOS anatomy data source-of-truth (2026-11-15)

**Runtime canonical source:** `data/knowledge-core-v1.json`. It contains **205 muscle records** with nonempty origin/insertion/function/innervation text, plus related structures and clinical content. This is the file loaded by `index.html` in `hydrateKnowledgeCore()`.

**Legacy export:** `data/muscles-v1.json` contains **183** mirrored records (m001–m183). The embedded `const muscles` array in `index.html` is also a 183-record fallback. Neither is the authoritative 205-record runtime source.

**Emergency recovery inventory:** `data/m184-m205-recovery-inventory-v1.json` contains 22 IDs/names from the illustration audit. Use only when the runtime core cannot load. Its missing O/I/F/N does **not** imply the same 22 records are absent from the runtime core.

**Patient-safety hold:** `data/mmt-safety-hold-v1.json` documents 38 anatomically mismatched copied elbow-MMT instructions. Their display text is quarantined in runtime core, legacy export, and embedded fallback; held items must not become Oral Viva exam prompts. Specialist review is still required before a replacement MMT protocol can be used.

**Validation:** `scripts/test-knowledge-core-legacy-sync.mjs`, `scripts/test-mmt-safety-gate.mjs`, `scripts/test-canonical-muscle-resolver.mjs`, and `scripts/canonical-muscle-coverage-audit.mjs`. A committed script is not a verified PASS until executed.

Clinical review of 205 entries, editable original 3D masters, CROS filings, production promotion, and Galaxy QA are independent gates.

Previous README (historical):\n\n# MSK Atlas Data Export v1

이 폴더는 향후 LYS OrthoOS AI-EMR 통합을 위한 구조화 데이터 계층의 시작점이다.

- muscles-v1.json: 현재 183개 근육 정본 데이터
- symptoms-v1.json: v6/v7 증상 기반 탐색 데이터

현재 앱은 호환성을 위해 index.html 내부 데이터도 사용한다. 후속 버전에서 UI와 데이터 로딩을 완전히 분리한다.
