# Dashboard

Internal dashboard for monitoring request statuses, uploading files, and managing requests.

## Tech Stack

- **Next.js 16** (App Router)
- **TypeScript**
- **Tailwind CSS v4** + **shadcn/ui** (base-ui)
- **TanStack React Query** — data fetching & caching
- **date-fns** — date formatting

## Getting Started

### Prerequisites

- Node.js 18+
- npm

### Setup

```bash
# Clone the repo
git clone <repo-url>
cd dashboard

# Install dependencies
npm install

# Copy env file
cp .env.example .env.local
```

### Environment Variables

| Variable | Description | Default |
|---|---|---|
| `NEXT_PUBLIC_API_URL` | Backend API base URL. Leave empty to use mock data. | `""` (mock mode) |

### Run

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

When `NEXT_PUBLIC_API_URL` is empty, the app loads mock data so you can develop without a backend.

### Build

```bash
npm run build
npm start
```

## Project Structure

```
src/
├── app/
│   ├── layout.tsx          # Root layout + providers
│   ├── page.tsx            # Dashboard page
│   └── globals.css         # Tailwind + shadcn styles
├── components/
│   ├── ui/                 # shadcn/ui primitives (auto-generated)
│   ├── dashboard.tsx       # Main dashboard with table, filters, detail modal
│   ├── filter-bar.tsx      # Filter controls (type, status, country, date, org)
│   ├── status-badge.tsx    # Color-coded status badge
│   ├── status-changer.tsx  # Dropdown to change request status via API
│   ├── request-detail.tsx  # Modal showing full request details + error info
│   ├── file-upload.tsx     # Drag-and-drop file upload
│   └── providers.tsx       # React Query provider
└── lib/
    ├── api.ts              # API client (getRequests, updateStatus, uploadFile)
    ├── mock-data.ts        # Mock request data for local dev
    ├── types.ts            # TypeScript interfaces
    └── utils.ts            # Utility functions (cn)
```

## API Endpoints Expected

The dashboard expects these endpoints on `NEXT_PUBLIC_API_URL`:

| Method | Path | Description |
|---|---|---|
| `GET` | `/api/requests` | List requests. Query params: `type`, `step`, `organization`, `countryCode`, `dateFrom`, `dateTo` |
| `PUT` | `/api/requests/:requestId/status` | Update request status. Body: `{ "step": "completed" }` |
| `POST` | `/api/upload` | Upload file (multipart/form-data, field: `file`) |

## Deployment (AWS Amplify)

1. Push to GitHub
2. AWS Amplify Console → New App → connect the repo
3. Add the environment variables required by your Next.js server routes
4. Deploy (auto-detects Next.js)

This app uses Next.js server-side routes to connect to AWS resources. It does not require an Amplify Gen 2 backend definition.

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start dev server |
| `npm run build` | Production build |
| `npm start` | Serve production build |
| `npm run lint` | Run ESLint |
