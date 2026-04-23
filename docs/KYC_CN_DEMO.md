# KYC China Demo — Rollback Guide

Record of everything added/changed on **April 23, 2026** to enable a public
KYC China demo at `/demo`. Use this document to reverse the changes cleanly
if the demo is no longer wanted.

## Summary
A new `/demo` page was added that lets anyone with the link exercise the
FillEasy KYC China API (identity verification, mobile lookup, risk
assessment). All API credentials stay server-side.

- **Live URL:** `https://main.d7ndpsc7xqere.amplifyapp.com/demo`
  (or whatever custom domain is configured on the Amplify app
  `request-dashboard` in account `794038241155`, region `ap-east-1`,
  app id `d7ndpsc7xqere`).
- **Upstream API:** `https://canary.api.fill-easy.com` (KYC China product).
- **Auth to upstream:** `x-client-id` + `x-client-secret` headers, pulled
  from env vars at runtime. Credentials never reach the browser.

---

## Files added (delete these to remove the demo)

| File | Purpose |
|---|---|
| `src/app/demo/page.tsx` | `/demo` page — not linked from nav, `noindex/nofollow`. |
| `src/components/kyc-cn-demo.tsx` | Interactive demo UI (3 endpoint tabs, dynamic form, verdict card, raw-JSON toggle). |
| `src/app/api/demo/kyc-cn/[endpoint]/route.ts` | Server proxy. Whitelists endpoints `identity`, `mobile`, `risk`. Forwards JSON body + injects `x-client-id`/`x-client-secret` from env vars. |
| `src/lib/kyc-cn.ts` | `server-only` fetch helper used by the proxy route. |
| `.env.example` | Documents the three required env vars as empty placeholders. Safe to commit. |

## Files modified

| File | Change |
|---|---|
| `.env.local` | **Local only, gitignored.** Added `KYC_CN_BASE_URL`, `KYC_CN_CLIENT_ID`, `KYC_CN_CLIENT_SECRET`. Not committed. |

No existing files were modified (navigation, layout, other pages untouched).
`.gitignore` was already covering `.env*` so credentials never entered git.

---

## Environment variables (3)

Required at **runtime** on the server that serves `/api/demo/kyc-cn/*`:

```
KYC_CN_BASE_URL=https://canary.api.fill-easy.com
KYC_CN_CLIENT_ID=<provided by FillEasy backend team>
KYC_CN_CLIENT_SECRET=<provided by FillEasy backend team>
```

Set on the AWS Amplify app via:

```bash
aws --profile prod-core --region ap-east-1 amplify update-app \
  --app-id d7ndpsc7xqere \
  --environment-variables '{
    "KYC_CN_BASE_URL":"https://canary.api.fill-easy.com",
    "KYC_CN_CLIENT_ID":"...",
    "KYC_CN_CLIENT_SECRET":"..."
  }'
```

Note: the account (`794038241155`, `prod-core` SSO profile) uses SSO role
`LimitedProdCore`. The command above requires that role.

---

## Reverse / rollback procedure

### 1. Remove the demo from the repo

```bash
rm -rf src/app/demo \
       src/app/api/demo \
       src/components/kyc-cn-demo.tsx \
       src/lib/kyc-cn.ts
# Optional: also drop the env.example entries and .env.local lines.
git add -A
git commit -m "revert: remove KYC China demo"
git push origin main
```

Amplify will rebuild `main` automatically; `/demo` will 404 afterwards.

### 2. Clear the credentials from Amplify

```bash
aws --profile prod-core --region ap-east-1 amplify update-app \
  --app-id d7ndpsc7xqere \
  --environment-variables '{}'
```

If other env vars get added later, pass the full map minus the KYC ones
instead of `{}`.

### 3. Rotate credentials (defense in depth)

Even though the env vars never entered git, ask the FillEasy backend team
to rotate `client_id` / `client_secret` since they were in the chat and
in developer laptops' `.env.local`.

### 4. Remove local copy

```bash
# edit .env.local to delete the three KYC_CN_* lines
# or remove the file entirely if you don't use it for anything else
```

---

## Useful operational commands

```bash
# verify env vars on Amplify
aws --profile prod-core --region ap-east-1 amplify get-app \
  --app-id d7ndpsc7xqere --query "app.environmentVariables"

# list recent builds
aws --profile prod-core --region ap-east-1 amplify list-jobs \
  --app-id d7ndpsc7xqere --branch-name main --max-results 5

# trigger a manual redeploy of main
aws --profile prod-core --region ap-east-1 amplify start-job \
  --app-id d7ndpsc7xqere --branch-name main --job-type RELEASE

# local test (with .env.local populated)
npm run dev
curl -sS -X POST http://localhost:3000/api/demo/kyc-cn/identity \
  -H "Content-Type: application/json" \
  -d '{"type":"two-factor","name":"李明","idNo":"110101199003076515"}'
```

---

## Known caveat: Amplify runtime env vars for Next.js SSR

Amplify injects env vars at **build time** by default. Next.js API routes
that `process.env.FOO` at **runtime** may see `undefined` on some Amplify
configurations. If after deploy the `/demo` page shows
`KYC_CN_BASE_URL / ... must be set`, add an `amplify.yml` to the repo root:

```yaml
version: 1
frontend:
  phases:
    preBuild:
      commands:
        - npm ci
    build:
      commands:
        - echo "KYC_CN_BASE_URL=$KYC_CN_BASE_URL" >> .env.production
        - echo "KYC_CN_CLIENT_ID=$KYC_CN_CLIENT_ID" >> .env.production
        - echo "KYC_CN_CLIENT_SECRET=$KYC_CN_CLIENT_SECRET" >> .env.production
        - npm run build
  artifacts:
    baseDirectory: .next
    files:
      - '**/*'
  cache:
    paths:
      - node_modules/**/*
      - .next/cache/**/*
```

This bakes the vars into `.env.production`, which Next.js server bundles
pick up at runtime.

---

## Endpoints proxied (for reference)

All live under `POST /api/demo/kyc-cn/:endpoint` which forwards to
`POST {KYC_CN_BASE_URL}/kyc/cn/:endpoint`.

| Proxy path | Upstream | Sub-types (via `type` in body) |
|---|---|---|
| `/api/demo/kyc-cn/identity` | `/kyc/cn/identity` | `two-factor`, `four-factor`, `image`, `name-mobile`, `id-mobile`, `three-factor` |
| `/api/demo/kyc-cn/mobile` | `/kyc/cn/mobile` | `attribution`, `location-verify`, `location-query` |
| `/api/demo/kyc-cn/risk` | `/kyc/cn/risk` | `fraud-risk`, `criminal-record` |

Upstream docs: https://docs.fill-easy.com/kyc-china

Upstream can return **502** "Verification service error" when the
government/telecom backend is flaky — this is an upstream issue, not a
bug in our code. The UI surfaces it as `UPSTREAM ERROR` with the raw
JSON available.

---

## Why this shape (design notes)

- **Form UI, not PDF:** KYC responses are tiny structured JSON; a PDF
  "certificate" would add noise without value. The interactive form lets
  non-technical buyers see verdicts while exposing raw JSON for
  engineers.
- **Server proxy, not client fetch:** client secret must never ship to
  the browser. Server proxy also lets us add rate limiting / auth later
  in one place.
- **No changes to existing routes/components:** demo lives in isolated
  files so removal is one `rm -rf`.
- **Not linked from nav + `noindex`:** reduces accidental traffic. For
  stronger gating, add `DEMO_ACCESS_TOKEN` env var + check in the proxy
  route.
