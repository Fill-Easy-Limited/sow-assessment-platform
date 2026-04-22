# TODO

## High Priority

- [ ] Connect to real backend API (set `NEXT_PUBLIC_API_URL`)
- [ ] Add authentication (Cognito via Amplify or NextAuth + Google)
- [ ] Deploy to AWS Amplify
- [ ] Configure CORS on backend to allow Amplify domain

## Features

- [ ] Pagination (server-side or client-side depending on data volume)
- [ ] Sortable table columns (click header to sort by date, duration, etc.)
- [ ] Auto-refresh toggle (currently 60s interval via React Query)
- [ ] Request count summary / stats bar (total, completed, failed, in-progress)
- [ ] Export filtered data to CSV
- [ ] Dark mode toggle

### Implemented Recently

- [x] Email chains dashboard (`/chains`) — cross-account read of `globalSES-emailchains` in `us-east-1`, per-stage and all-stages views, status + date filters
- [x] Email chain detail page (`/chains/[chainId]`) — metadata, linked completed/processing/needClarification requests, raw rows table
- [x] Bidirectional linking — request detail → email chain when `chainId` is present; chain page → request rows
- [x] Cross-account retrieve/retry via Lambda invocation
- [x] Direct DynamoDB cancel (initiated/search/manual steps)
- [x] Account-aware Lambda targeting via tracker `accountId`
- [x] Manual-step upload to `uploadUrl` (server-side proxy route)
- [x] Search-step form for company/document identifiers
- [x] `failed` status filter (`search` + `manual`)
- [x] Table-only refresh button

## UI / UX

- [ ] Add loading skeletons instead of "Loading..." text
- [ ] Toast notifications for file upload success/failure
- [ ] Responsive mobile layout
- [ ] Keyboard shortcuts (e.g. Esc to close modal)

## Backend Integration

- [ ] Finalize API contract (query params, pagination format, error responses)
- [ ] Add file upload progress indicator (requires backend streaming support)
- [ ] Add retry logic for failed API calls

## DevOps

- [ ] Set up GitHub repo in organization
- [ ] Configure Amplify CI/CD pipeline
- [ ] Add custom domain (e.g. `dashboard.filleasy.com`)
- [ ] Set up branch previews for PRs
- [ ] Add env vars in Amplify Console

## Nice to Have

- [ ] Real-time updates via WebSocket or polling config
- [ ] Request timeline / audit log view
- [ ] Batch status update (select multiple rows)
- [ ] Search by requestId or companyId
- [ ] Role-based access (admin vs viewer)
