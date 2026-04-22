# Request Dashboard

Internal dashboard for monitoring `RequestTracking` DynamoDB records across AWS stages. Built with Next.js 16 (App Router), React 19, TanStack Query 5, Tailwind CSS v4, and shadcn/ui.

## Quick Start

```bash
# 1. Login to AWS SSO (required for DynamoDB access)
aws sso login --profile prod-core

# 2. Install dependencies
npm install

# 3. Start dev server
npm run dev
```

The app runs at `http://localhost:3000`. If AWS credentials are missing or expired, it falls back to mock data with a yellow banner.

## Project Structure

```
src/
├── app/
│   ├── layout.tsx              # Root layout — fonts, metadata, Providers wrapper
│   ├── page.tsx                # Main page — env switcher + dashboard
│   ├── globals.css             # Tailwind v4 globals
│   └── api/
│       └── requests/
│           ├── route.ts        # GET /api/requests — list with filters
│           └── [requestId]/
│               ├── route.ts    # GET /api/requests/:id — single record lookup
│               ├── resolve/
│               │   └── route.ts # POST /api/requests/:id/resolve
│               ├── cancel/
│               │   └── route.ts # POST /api/requests/:id/cancel
│               └── upload/
│                   └── route.ts # POST /api/requests/:id/upload
├── components/
│   ├── dashboard.tsx           # Main table view — fetches data, renders rows
│   ├── env-switcher.tsx        # Prod/Staging pill toggle
│   ├── filter-bar.tsx          # Filter dropdowns (type, step, country, date, org)
│   ├── progress-bar.tsx        # Colored progress bar for lifecycle steps
│   ├── status-badge.tsx        # Colored badge for step values
│   ├── search-resolve.tsx      # Search-step resolver form (company/document identifiers)
│   ├── cancel-request.tsx      # Cancellable-step action with confirmation
│   ├── request-detail.tsx      # Detail modal when clicking a row
│   ├── file-upload.tsx         # Manual-step file uploader (choose/drop then upload)
│   ├── providers.tsx           # TanStack QueryClientProvider
│   └── ui/                     # shadcn/ui primitives (button, table, dialog, etc.)
└── lib/
  ├── aws/
  │   ├── cra-config.ts       # Cross-account CRA Lambda ARN + payload helpers
  │   ├── resolve-request.ts  # CraResolve invoke helpers
  │   ├── cancel-request.ts   # CraCancel invoke helpers
  │   ├── lambda-client.ts    # Singleton Lambda client
  │   └── client.ts           # Client-side resolve/cancel helpers
    ├── api.ts                  # Frontend fetch client for API routes
    ├── types.ts                # Shared types (RequestItem, Step, STEP_ORDER, etc.)
    ├── mock-data.ts            # Mock data fallback for local dev without AWS
    ├── utils.ts                # cn() utility
    └── dynamodb/
        ├── config.ts           # Stage accounts, table ARNs, GSI names (RequestTracking, ap-east-1)
        ├── client.ts           # Singleton DynamoDB Document Client (ap-east-1)
        ├── queries.ts          # RequestTracking query functions
        ├── index.ts            # Barrel export
        └── emailchains/        # globalSES-emailchains (us-east-1, separate client)
            ├── config.ts       # Table name, region, enabled stages, GSI
            ├── client.ts       # Singleton DocumentClient for us-east-1
            ├── queries.ts      # Get/List/Scan helpers (Scan ALLOWED here)
            └── index.ts
```

## Architecture

### Data Flow

```
Browser → page.tsx (stage state) → Dashboard (filters + stage)
  → useQuery → api.ts (getRequests) → GET /api/requests?stage=prod&type=...
  → route.ts → queryRequests() → DynamoDB (cross-account)
  → Response.json(items) → Dashboard renders table
```

### DynamoDB Access

**Table**: `RequestTracking` in `ap-east-1`, one per AWS account.

| Stage        | Account ID     |
|-------------|----------------|
| prod         | 794038241155   |
| staging      | 905418146905   |
| dev          | 654654513614   |
| infradev     | 470957634129   |
| infrastaging | 979237820619   |

Currently **prod**, **staging**, and **dev** are enabled (`ENABLED_STAGES` in `config.ts`).

**Cross-account access**: The Prod Core account (`794038241155`) has read access to all stage tables via resource-based policies. The policies grant `Query` and `GetItem` — **not Scan**. This is why the codebase does not use Scan.

**Authentication**:
- **Local dev**: Uses `prod-core` SSO profile via `fromSSO({ profile: "prod-core" })`. Run `aws sso login --profile prod-core` before starting.
- **Deployed**: Uses the Lambda execution role (no SSO needed). The role gets permissions from `requestTrackingReadAccess()` in CDK.

**Table ARN as TableName**: Cross-account queries pass the full ARN (`arn:aws:dynamodb:ap-east-1:<account>:table/RequestTracking`) as `TableName`. The SDK handles routing.

### Email Chains table (`globalSES-emailchains`)

A second cross-account table used by the `/chains` dashboard.

- **Region**: `us-east-1` (different from RequestTracking — requires a separate DynamoDB client at `src/lib/dynamodb/emailchains/client.ts`).
- **Name**: `globalSES-emailchains` — identical across every stage, no stage suffix.
- **Accounts**: Same `STAGE_ACCOUNTS` map as RequestTracking.
- **Partition key**: `chainId` (S) — email Message-ID.
- **GSI**: `status-updatedAt-index` (pk `status`, sk `updatedAt`, projection ALL).
- **Scan**: **ALLOWED** on this table. The resource-based policy (maintained in the `globalses` CDK repo) grants `dynamodb:Scan`/`Query`/`GetItem` to the prod-core account. Scan powers the "all chains" listing — RequestTracking still forbids Scan.
- **Enabled stages**: `prod`, `staging` (see `EMAILCHAINS_ENABLED_STAGES`). Dev not yet verified — confirm the table exists in account `654654513614` before adding.
- **Link to requests**: chain items carry `completedRequests`, `processingRequests`, and `needClarificationRequests` arrays, each entry referencing a `requestId` in RequestTracking. RequestTracking items carry a `chainId` field when created from an inbound email.

| Index Name           | Partition Key  | Sort Key    |
|---------------------|---------------|-------------|
| `type-index`         | `type`         | `startedAt` |
| `organization-index` | `organization` | `startedAt` |
| `step-index`         | `step`         | `startedAt` |

All GSIs sort by `startedAt` descending (newest first via `ScanIndexForward: false`).

### Query Strategy

`queryWithFilters()` picks the best GSI based on priority: **type > organization > step**. Remaining filters become `FilterExpression`.

When **no filters** are set, the system cannot use Scan (cross-account policy blocks it). Instead, `queryAllSteps()` queries the `step-index` for every known step value in parallel and merges results. This is defined by `STEP_ORDER` in `types.ts`.

### Key Types

```typescript
// src/lib/types.ts
type Step = "initiated" | "search" | "manual" | "cancelled" | "retrieved" | "processing" | "ready" | "delivered";

interface RequestItem {
  requestId: string;       // PK — format CR_<random>
  type: string;            // e.g. "hk-retrieval", "cn-novanansha"
  step: Step;              // Current lifecycle step
  accountId?: string;      // CRA sub-account ID (used for cross-account Lambda ARN)
  organization: string;    // e.g. "canary", "ubs"
  startedAt: string;       // ISO 8601
  automated: boolean;      // false when retrieval failed
  deploymentStage: string;
  environment: string;
  duration?: number;       // milliseconds
  countryCode?: string;    // e.g. "HK", "SG"
  companyId?: string;
  companyName?: string;
  documentType?: string;
  error?: { step: string; message: string; stack?: string };
  debugUrl?: string;
  uploadUrl?: string;
  ttl: number;
  _stage?: string;         // Injected by query layer — which stage the record came from
}
```

## API Routes

### `GET /api/requests`

Query params: `type`, `step`, `organization`, `dateFrom`, `dateTo`, `stage`

Returns `RequestItem[]`. The `stage` param is required (set by the env switcher — defaults to `prod`). If omitted, queries all enabled stages.

### `GET /api/requests/:requestId`

Looks up the record across all enabled stages (parallel `GetItem`). Returns the first match or 404.

### `POST /api/requests/:requestId/resolve`

Invokes cross-account `CraResolve` in the request sub-account. Target is built from request `accountId` when present (with stage-account fallback for legacy records).

Body fields:
- `companyId?`
- `companyName?`
- `documentId?`
- `documentType?`
- `stage?`

Validation: at least one of `companyId`, `companyName`, or `documentId` is required.

### `POST /api/requests/:requestId/cancel`

Invokes cross-account `CraCancel` in the request sub-account (`accountId`-based ARN).

Only cancellable from steps:
- `initiated`
- `search`
- `manual`

Returns `409` for non-cancellable steps.

### `POST /api/requests/:requestId/upload`

Uploads multipart file to request `uploadUrl` server-side (proxying browser upload to avoid presigned-URL CORS issues).

Requirements:
- Request must be in `manual` step
- `uploadUrl` must exist on the tracker record

## Frontend Components

### EnvSwitcher
Pill-style toggle at the top of the page. Switches between `prod` and `staging`. State lives in `page.tsx` and is passed to `Dashboard` as a prop.

### Dashboard
Main component. Receives `stage` prop, merges it with filter state into `activeFilters`, passes to `useQuery`. Falls back to mock data if the API fails (yellow banner shown). Includes table-only refresh action.

### FilterBar
Dropdowns for type, status, country, date range, and organization text input. Stage is NOT in the filter bar — it's controlled by `EnvSwitcher`.

Status includes virtual option:
- `failed` = `search` + `manual`

### RequestDetail
Large modal that opens when clicking a table row. Includes:
- Condensed error view with expandable details/stack
- Debug screenshot show/hide toggle (image preview, no raw URL)
- Search-step resolver form
- Manual-step file upload flow (choose/drop then explicit upload)
- Cancellable-step action with confirmation (`initiated/search/manual`)

## Important Constraints

1. **No Scan allowed cross-account** — The resource-based policy on non-prod tables only permits `Query` and `GetItem`. Never add Scan operations for cross-account queries.

2. **No direct DDB writes from dashboard** — The app mutates workflow only by invoking backend Lambdas (`CraResolve`, `CraCancel`) and uploading to presigned S3 URLs.

3. **Records expire** — TTL is ~1 year. Old request IDs may return 404.

4. **Single DynamoDB client** — One client using `prod-core` credentials works for all stages because of cross-account resource policies. Do not create per-stage clients.

5. **SSO session expiry** — If you get `ExpiredTokenException`, re-run `aws sso login --profile prod-core`.

## Tech Stack

| Package | Version | Purpose |
|---------|---------|---------|
| next | 16.2.1 | App Router, API routes, Turbopack |
| react | 19.2.4 | UI |
| @tanstack/react-query | 5.x | Server state management, caching, refetch |
| @aws-sdk/client-dynamodb | 3.x | DynamoDB operations |
| @aws-sdk/lib-dynamodb | 3.x | Document client (marshalling) |
| tailwindcss | 4.x | Styling |
| shadcn/ui | 4.x | UI component primitives |
| date-fns | 4.x | Date formatting |
| lucide-react | 0.577.x | Icons |

## Scripts

```bash
npm run dev      # Start dev server (Turbopack)
npm run build    # Production build
npm run start    # Start production server
npm run lint     # ESLint
```
