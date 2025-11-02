Zzub is a Next.js app that explores prediction markets via the Buzzing Fluent API. Clean, modern UI, no gradients.

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open http://localhost:3000 with your browser to see the result.

## Endpoints

- Markets: `GET /api/v1/club/filter?sort_by=24hr_volume&page=1&page_size=10`
- Tags: `GET /api/v1/club/tags/primary`
- Leaderboards: `GET /api/v1/leaderboard/{weekly|monthly|all-time}`
- User trades: `GET /api/v1/club/trades/history/{userId}`
- User positions: `GET /api/v1/user/positions/{userId}`

Configure external market link target:

- `NEXT_PUBLIC_MARKET_BASE_URL` (default: `https://www.buzzing.app/app/topic/`)

Design:

- Modern, neutral palette, Geist font, no gradient mixes.

## Pages

- `/` Markets home (24h volume), top traders (weekly), tags filter, trader’s trades today.
- `/traders` Top traders with timeframe dropdown (weekly, monthly, all-time) and their trades.
- `/unpaid` High-value unpaid positions aggregated from top traders.

## Charts

- Market cards show a sparkline of probability when history is available; otherwise they show a probability bar.
- Top Traders page renders a probability chart from the selected trader’s trade prices over time.
- To enable full market history, implement `fetchMarketHistory(clubId, timeframe)` in `lib/api.ts` to return `{ t, p }[]` with `p` in [0,1].

