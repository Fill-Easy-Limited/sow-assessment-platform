# HNW Wealth Intelligence Demo — Session Handoff

## What This Is

An interactive demo of a **HNW (High Net Worth) Wealth Intelligence platform** built as a tab within a Next.js 16 request-dashboard app. It traces how wealthy individuals built their wealth chronologically, with confidence percentages and cited sources for every claim. Lives at `/demo` under the "Source of Wealth" tab.

## Architecture

- **Framework:** Next.js 16 (App Router), React 19, Tailwind v4, `@base-ui/react` for Dialog
- **Demo route:** `src/app/demo/page.tsx` — header + footer chrome
- **Tab wrapper:** `src/components/api-demo.tsx` — "Source of Wealth" tab renders `<SowDemo />`
- **Main component:** `src/components/sow-demo.tsx` (~2,283 lines) — entire demo UI + state machine
- **Data layer:** `src/lib/sow-mock-data.ts` (~1,300 lines) — interfaces, mock data, two real-world reference cases

## State Machine (Phase-Based)

```
dashboard → select → generating → report
               ↑                    ↓
            (back)              (back to dashboard)

dashboard → (click monitoring row) → profile
```

Phases:
- `dashboard` — Stats cards, HNW monitoring table, PEP/sanctions section, notifications
- `select` — Two large person cards (Jack Ma / Yat Siu), click one then "Begin Assessment"
- `generating` — Animated data source scanning (20 sources per subject), 4-second timer
- `report` — Full wealth intelligence report with career timeline, charts, confidence bars, source citations
- `profile` — Reached from monitoring table click, shows monitoring config + alerts

## Two Reference Cases

### Jack Ma (Alibaba) — Risk: Medium, ~$25.5B
- 6 career phases: English Teacher → China Pages → Alibaba → IPO → Post-Chairmanship → Philanthropy
- Wealth dominated by **Companies** (Alibaba 6.2% stake) with high SEC-filing confidence
- Extensive alternatives: Brandon Park estate ($23M), Superyacht Zen ($200M), G650ER jet ($65M), Singapore properties, Bordeaux vineyards
- Family office: Blue Pool Capital (~$50B AUM, co-founded with Joe Tsai)
- Entertainment investments: Huayi Brothers, Enlight Media
- 43 source citations, 20 animation data sources, 13 client documents, 19 cross-references, 9 company nodes

### Yat Siu (Animoca Brands) — Risk: High, ~$2.4B (volatile)
- 6 career phases: Atari → Outblaze → Animoca Mobile → Blockchain Pivot → Web3 Boom → Market Correction
- Wealth dominated by **Crypto** (SAND, REVV, TOWER, MOCA tokens) with low confidence due to volatility
- Major acquisitions: The Sandbox, TinyTap, nWay, GAMEE, Blowfish, Eden Games
- Strategic: Anchorpoint Financial JV (Standard Chartered stablecoin license), Nasdaq listing via Currenc merger
- Risk events: ASX delisting, Lympo hack ($18.7M), X/Twitter hack, -90% token drawdowns
- 36 source citations, 19 animation data sources, 10 client documents, 17 cross-references, 10 company nodes

## Key Data Model Interfaces

```typescript
SourceCitation     // { id, label, url, date, type, screenshot, auditTrail, companySearch? }
WealthClaim        // { id, description, estimatedValueUSD, confidence: 0-100, sources[] }
WealthCategory     // "income" | "companies" | "investments" | "alternatives" | "crypto"
CategoryBreakdown  // { category, label, claims[], subtotalUSD, avgConfidence }
CareerPhase        // { id, title, org, role, years, location, categories[], cumulativeWealthUSD, keyEvents[] }
HnwProfile         // { name, nationality, residences, industry, netWorth, riskRating, riskScore }
HnwReport          // { profile, careerTimeline[], wealthByCategory, overallConfidence, narrative }
```

## FilEasy Integration Points

Corporate and land registry sources are routed through FilEasy API products:
- **CorpVerify:** HK Companies Registry, ASIC (Australia), ACRA (Singapore), 80+ jurisdictions
- **China Cross-Border:** SAMR, MPS (Ministry of Public Security), judicial records, UBO, credit standing
- **GovVerify:** Individual IDV via iAM Smart, Singpass, China NFC

Sources with FilEasy routing have `companySearchTemplate` metadata showing which registry, jurisdiction, and search parameters are used.

## Report View Components (top to bottom)

1. Profile card (name, DOB, nationality, residences, industry, net worth, risk rating)
2. Risk score gauge (SVG radial, color-coded Low/Medium/High)
3. Key parameters (Wealth Plausibility, Source Diversity, Timeline Consistency, etc.)
4. Career timeline (horizontal SVG with clickable phase nodes)
5. Wealth accumulation stacked bar chart (5 categories over career phases)
6. Wealth composition donut chart (5 categories with percentages)
7. Career phase cards (expandable, each with claims, confidence bars, source citations)
8. Entity network graph (SVG with company nodes and relationship lines)
9. Client document verification table
10. Cross-reference analysis table
11. Narrative summary
12. Follow-up actions

## Color Palette (Wealth Categories)

- Income: `#0891b2` (cyan-600)
- Companies: `#0d9488` (teal-600)
- Investments: `#6366f1` (indigo-500)
- Alternatives: `#d97706` (amber-600)
- Crypto: `#9333ea` (purple-600)

## What's Left / Potential Next Steps

- **Copy updates:** `fill-easy-rewritten-copy.md` has rewritten marketing copy for GovVerify, CorpVerify, and China Cross-Border pages — not yet implemented
- **Industries page:** Emoji icons need replacing with Lucide SVG icons (see copy doc section 5)
- **Homepage product cards:** Updated copy ready in the copy doc (section 4)
- **Additional subjects:** Could add more HNW profiles beyond Jack Ma and Yat Siu
- **Real API integration:** Currently all mock data — could wire up to real FilEasy endpoints
- **Report PDF export:** Download button exists but generates a simple text summary — could use a proper PDF library
- **Responsive polish:** Works on desktop, could use mobile breakpoint refinement

## Dev Commands

```bash
npm run dev          # Start dev server (localhost:3000)
npx tsc --noEmit     # TypeScript check (should be zero errors)
```

## File Map

```
src/
  app/
    demo/page.tsx              # Demo page shell (header + footer)
  components/
    api-demo.tsx               # Tab container ("Source of Wealth" tab)
    sow-demo.tsx               # Main demo component (2,283 lines)
    ui/
      button.tsx               # Button component
      dialog.tsx               # Dialog (base-ui)
  lib/
    sow-mock-data.ts           # All interfaces + mock data (1,300 lines)
    demo-endpoints.ts          # API demo endpoint configs
    cra-health-samples.ts      # CRA health check samples
```
