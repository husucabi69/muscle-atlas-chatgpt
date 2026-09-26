# Oral Viva High-quality TTS — Server Contract v1

Status: PREPARED / DISABLED BY DEFAULT
Date: 2026-09-27

## Purpose
Allow an optional high-quality Korean TTS provider without exposing provider credentials in the browser bundle and without sending patient-specific data.

## Client boundary
The browser may send only:
- `text`: the already-rendered generic Oral question or generic examiner feedback, maximum 600 characters
- `persona`: one of `friend | colleague | senior | master`
- `locale`: `ko-KR`
- `kind`: `question | feedback | preview`

The client must never send:
- microphone audio
- the learner's dictated or typed answer
- patient name, patient ID, encounter ID, date of birth, phone, address, chart data or other PHI
- provider API keys, tokens or service-account credentials
- full localStorage/session history

## Endpoint
Same-origin only: `POST ./api/oral-tts`

Request JSON example:
```json
{"text":"극상근의 기능을 설명해보세요.","persona":"colleague","locale":"ko-KR","kind":"question"}
```

Success:
- HTTP 200
- `Content-Type: audio/*`
- response body is the generated audio bytes

Failure:
- non-2xx, timeout, non-audio response, offline state or playback failure
- client immediately falls back to local `SpeechSynthesis`

## Server/provider boundary
Provider credentials exist server-side only. The server validates:
- POST method
- same-origin application access policy
- allowed fields only
- `text <= 600`
- persona/locale/kind allowlist
- no request logging of raw text unless explicitly required and documented

The server sends only the approved text and voice/style parameters to the selected TTS provider.

## Activation gate
The client flag `ORAL_REMOTE_TTS.enabled` remains `false` until all are complete:
1. provider selected and server endpoint deployed
2. privacy/Data Safety impact reviewed
3. provider retention/training terms reviewed
4. no client-side credential confirmed
5. network failure fallback tested
6. representative Korean pronunciation checked on a real device

Until that gate is approved, Stage 18 uses the local Korean voice engine only.
