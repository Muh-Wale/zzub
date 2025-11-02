"use client";
import { useEffect, useMemo, useState } from "react";
import {
  LeaderUser,
  Timeframe,
  fetchLeaderboard,
  fetchUserTrades,
  formatUSD,
} from "@/lib/api";
import TraderBubble from "@/components/TraderBubble";
import MiniLineChart from "@/components/MiniLineChart";

const TIMEFRAMES: Timeframe[] = ["weekly", "monthly", "all-time"];
const PAGE_SIZE = 15;
type TradeFilter = "all" | "buy" | "sell";

export default function TradersPage() {
  const [timeframe, setTimeframe] = useState<Timeframe>("weekly");
  const [leaders, setLeaders] = useState<LeaderUser[]>([]);
  const [selected, setSelected] = useState<LeaderUser | undefined>();
  const [trades, setTrades] = useState<any[]>([]);
  const [loadingTrades, setLoadingTrades] = useState(false);
  const [page, setPage] = useState(1);
  const [tradeFilter, setTradeFilter] = useState<TradeFilter>("all");

  // fetch leaderboard whenever timeframe changes
  useEffect(() => {
    let mounted = true;
    (async () => {
      const l = await fetchLeaderboard(timeframe, 1, 10);
      if (!mounted) return;
      setLeaders(l);
      setSelected(l[0]);
      setPage(1);
      setTradeFilter("all");
    })();
    return () => {
      mounted = false;
    };
  }, [timeframe]);

  // fetch selected user's trades
  useEffect(() => {
    let mounted = true;
    (async () => {
      if (!selected) return;
      setLoadingTrades(true);
      const res = await fetchUserTrades(selected.user_id, 1, 100);
      if (!mounted) return;
      setTrades(res.data.items);
      setPage(1);
      setTradeFilter("all");
      setLoadingTrades(false);
    })();
    return () => {
      mounted = false;
    };
  }, [selected, timeframe]);

  // 👇 filter on `type` (your data has "type": "buy", "type": "sell")
  const filteredTrades = useMemo(() => {
    if (tradeFilter === "all") return trades;
    return trades.filter(
      (t) => (t.type ?? "").toLowerCase() === tradeFilter
    );
  }, [trades, tradeFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredTrades.length / PAGE_SIZE));

  const paginatedTrades = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return filteredTrades.slice(start, start + PAGE_SIZE);
  }, [filteredTrades, page]);

  const handlePrev = () => setPage((p) => Math.max(1, p - 1));
  const handleNext = () => setPage((p) => Math.min(totalPages, p + 1));

  return (
    <div className="space-y-6">
      {/* header */}
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold tracking-tight text-slate-50">
          Top Traders
        </h1>

        {/* glassy select */}
        <div className="relative">
          <select
            className="
              appearance-none rounded-lg bg-slate-900/40
              border border-slate-100/10 px-3 py-2
              text-sm text-slate-50 pr-8
              backdrop-blur-sm
              focus:outline-none focus:ring-2 focus:ring-sky-400/50
            "
            value={timeframe}
            onChange={(e) => setTimeframe(e.target.value as Timeframe)}
          >
            {TIMEFRAMES.map((tf) => (
              <option
                key={tf}
                value={tf}
                className="bg-slate-950 text-slate-50"
              >
                {tf}
              </option>
            ))}
          </select>
          <span
            className="pointer-events-none absolute inset-y-0 right-2 flex items-center text-slate-200/70 text-xs"
            aria-hidden
          >
            ▼
          </span>
        </div>
      </div>

      {/* trader pills */}
      <div className="flex flex-wrap gap-2">
        {leaders.map((u) => (
          <TraderBubble
            key={u.user_id}
            leader={u}
            selected={u.user_id === selected?.user_id}
            onSelect={setSelected}
          />
        ))}
      </div>

      {/* glass panel */}
      <div
        className="
          relative overflow-hidden rounded-2xl border
          border-slate-200/40 bg-white/5
          shadow-sm backdrop-blur-xl
          dark:border-slate-700/40 dark:bg-slate-950/15
        "
      >
        {/* gradient */}
        <div
          className="
            pointer-events-none absolute inset-0 rounded-2xl
            bg-[radial-gradient(circle_at_top,rgba(56,189,248,0.25),rgba(15,23,42,0))]
            opacity-80
          "
        />

        {/* panel header */}
        <div className="relative flex items-center justify-between gap-4 border-b border-slate-200/5 px-4 py-3">
          <div className="text-sm font-medium text-slate-50">
            Trades by{" "}
            <span className="text-sky-100">{selected?.username ?? "—"}</span>
          </div>
          <div className="flex items-center gap-3">
            {/* filter buttons */}
            <div className="inline-flex items-center gap-1 rounded-full bg-slate-950/20 p-1">
              <button
                onClick={() => {
                  setTradeFilter("all");
                  setPage(1);
                }}
                className={`px-3 py-1 text-[0.65rem] font-medium rounded-full transition-all
                  ${tradeFilter === "all"
                    ? "bg-gradient-to-r from-sky-500/80 to-emerald-400/70 text-slate-950 shadow-sm"
                    : "text-slate-100/70 hover:text-slate-50"
                  }`}
              >
                All
              </button>
              <button
                onClick={() => {
                  setTradeFilter("buy");
                  setPage(1);
                }}
                className={`px-3 py-1 text-[0.65rem] font-medium rounded-full transition-all
                  ${tradeFilter === "buy"
                    ? "bg-sky-500/80 text-slate-950 shadow-sm"
                    : "text-slate-100/70 hover:text-slate-50"
                  }`}
              >
                Buy
              </button>
              <button
                onClick={() => {
                  setTradeFilter("sell");
                  setPage(1);
                }}
                className={`px-3 py-1 text-[0.65rem] font-medium rounded-full transition-all
                  ${tradeFilter === "sell"
                    ? "bg-rose-500/80 text-slate-50 shadow-sm"
                    : "text-slate-100/70 hover:text-slate-50"
                  }`}
              >
                Sell
              </button>
            </div>

            {/* timeframe chip */}
            <span className="inline-flex items-center gap-1 rounded-full bg-sky-500/10 px-2 py-0.5 text-[0.65rem] text-sky-100">
              {timeframe}
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400/90" />
            </span>
          </div>
        </div>

        {/* list */}
        <div className="relative">
          <div className="relative divide-y divide-slate-200/5">
            {loadingTrades ? (
              <div className="px-4 py-6 text-sm text-slate-300">
                Fetching trades…
              </div>
            ) : paginatedTrades.length === 0 ? (
              <div className="px-4 py-6 text-sm text-slate-300">
                No trades.
              </div>
            ) : (
              paginatedTrades.map((t) => {
                const hrefBase =
                  process.env.NEXT_PUBLIC_MARKET_BASE_URL ||
                  "https://www.buzzing.app/app/topic/";
                const externalHref = `${hrefBase}${t.club_id}`;

                // build mini series from filtered trades (so chart matches view)
                const series = filteredTrades
                  .filter((x) => x.club_id === t.club_id)
                  .sort((a, b) => a.created_at - b.created_at)
                  .map((x) => ({
                    t: x.created_at,
                    p: Math.max(0, Math.min(1, x.price)),
                  }));

                return (
                  <a
                    key={t.tx_hash}
                    href={externalHref}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="
                      flex items-center justify-between gap-4 px-4 py-3
                      transition-colors
                      hover:bg-slate-50/5
                    "
                  >
                    {/* left */}
                    <div className="min-w-0 flex-1 space-y-1">
                      <div className="text-sm font-medium leading-snug text-slate-50 line-clamp-2">
                        {t.club_name}
                      </div>
                      <div className="text-[0.68rem] text-slate-300">
                        {/* type is the action, side is the outcome */}
                        {t.type?.toUpperCase()} :{" "}
                        {(t.side ?? "").toUpperCase() || "—"} •{" "}
                        {t.share.toFixed(2)} @ {(t.price * 100).toFixed(1)}%
                      </div>
                    </div>

                    {/* right */}
                    <div className="flex items-center gap-4">
                      <div className="rounded-md bg-slate-900/20 p-1">
                        <MiniLineChart data={series} />
                      </div>
                      <div className="text-right text-xs text-slate-100">
                        {formatUSD(t.value)}
                        <div className="text-[0.6rem] text-slate-400">
                          notional
                        </div>
                      </div>
                    </div>
                  </a>
                );
              })
            )}
          </div>

          {/* fades */}
          <div className="pointer-events-none absolute inset-x-0 top-0 h-4 bg-gradient-to-b from-slate-950/70 to-transparent" />
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-5 bg-gradient-to-t from-slate-950/80 to-transparent" />
        </div>

        {/* pagination */}
        {filteredTrades.length > PAGE_SIZE && (
          <div className="relative flex items-center justify-between gap-3 border-t border-slate-200/5 px-4 py-3">
            <div className="text-[0.65rem] text-slate-300">
              Page {page} of {totalPages} • showing {paginatedTrades.length} of{" "}
              {filteredTrades.length} ({tradeFilter})
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handlePrev}
                disabled={page === 1}
                className={`
                  inline-flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs
                  transition-all
                  ${page === 1
                    ? "bg-slate-900/10 text-slate-500 cursor-not-allowed"
                    : "bg-slate-900/30 text-slate-50 border border-slate-100/10 hover:bg-gradient-to-r hover:from-sky-500/40 hover:to-emerald-400/40"
                  }
                `}
              >
                Prev
              </button>
              <button
                onClick={handleNext}
                disabled={page === totalPages}
                className={`
                  inline-flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs
                  transition-all
                  ${page === totalPages
                    ? "bg-slate-900/10 text-slate-500 cursor-not-allowed"
                    : "bg-slate-900/30 text-slate-50 border border-slate-100/10 hover:bg-gradient-to-r hover:from-sky-500/40 hover:to-emerald-400/40"
                  }
                `}
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
