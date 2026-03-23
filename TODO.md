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

## UI / UX

- [ ] Add loading skeletons instead of "Loading..." text
- [ ] Toast notifications for status change success/failure
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
