# Cloudflare Pages Preview / Production Setup

Status: repository-side preparation complete. Dashboard connection is the remaining external-account step.

## Target deployment model

- Git repository: `husucabi69/muscle-atlas-chatgpt`
- Production branch: `main`
- Preview branches: **All non-Production branches**
- Pull requests: Cloudflare Preview URL automatically generated
- Existing GitHub Pages: keep enabled as fallback until Cloudflare Production and Preview are both verified

Cloudflare's Git integration automatically creates branch/PR preview deployments without changing Production. The application is a static PWA and now uses deployment-root-relative manifest/start/scope paths so the same commit works at both the GitHub Pages subpath and the Cloudflare Pages root.

## Dashboard steps

1. Cloudflare Dashboard → **Workers & Pages**.
2. **Create application** → **Pages** → **Import an existing Git repository**.
3. Authorize GitHub if requested.
4. Select **husucabi69 / muscle-atlas-chatgpt**.
5. Project name: use `muscle-atlas-chatgpt` if available.
6. Production branch: `main`.
7. Framework preset: **None**.
8. Build command: `exit 0`.
9. Build output directory: `.`.
10. Root directory: leave blank (repository root).
11. Deploy.
12. Project → Settings / Builds → Branch control:
    - Production branch: `main`
    - Automatic Production deployments: enabled
    - Preview branches: **All non-Production branches**
13. Confirm the Production deployment opens.
14. Open or update a non-main PR/branch and confirm Cloudflare creates a Preview deployment and PR check.

## Required first verification

Production:
- home screen renders
- anatomy region → muscle list → muscle detail works
- manifest loads
- service worker registers
- version shows `v11.10 · Cloudflare Preview Ready`

Preview:
- same navigation works on the `*.pages.dev` preview URL
- representative anatomy images render
- Preview is separate from Production
- Preview deployment reports `X-Robots-Tag: noindex` (Cloudflare Pages default)

## Development gate after activation

`branch → PR → GitHub Global QA → Cloudflare Preview → real-screen review → main merge → Cloudflare Production → production QA`

Do not merge a visual/anatomy batch merely because CI is green. Representative illustration work must be visually checked in Preview first.

## Notes

- `_headers` disables browser caching for `sw.js`, `app-version.js`, and `manifest.webmanifest` on Cloudflare so installed-app updates are less likely to be held back by stale deployment metadata.
- The existing PWA `id` stays `/muscle-atlas-chatgpt/` to avoid unnecessarily changing the installed identity on the current GitHub Pages origin.
- Android TWA / Digital Asset Links origin migration is a separate release task. Do not change the TWA origin until the Cloudflare production origin is stable and the signing fingerprint/custom-domain plan is finalized.
