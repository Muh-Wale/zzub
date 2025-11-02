"use client";
import { useEffect, useMemo, useState } from 'react';
import { LeaderUser, Market, PrimaryTag, fetchLeaderboard, fetchMarkets, fetchPrimaryTags, fetchUserTrades, endOfDay, formatUSD, startOfDay } from '@/lib/api';
import MiniLineChart from '@/components/MiniLineChart';
import MarketCard from '@/components/MarketCard';
import TraderBubble from '@/components/TraderBubble';
import TagsBar from '@/components/TagsBar';

export default function MarketsHome() {
  const [markets, setMarkets] = useState<Market[]>([]);
  const [tags, setTags] = useState<PrimaryTag[]>([]);
  const [tag, setTag] = useState<string>('');
  const [leaders, setLeaders] = useState<LeaderUser[]>([]);
  const [selectedLeader, setSelectedLeader] = useState<LeaderUser | undefined>();
  const [leaderTradesToday, setLeaderTradesToday] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      try {
        const [m, t, l] = await Promise.all([
          fetchMarkets({ sort_by: '24hr_volume', page: 1, page_size: 20 }),
          fetchPrimaryTags(),
          fetchLeaderboard('weekly', 1, 10), // using weekly in absence of daily endpoint
        ]);
        if (!mounted) return;
        setMarkets(m.items || []);
        setTags(t);
        setLeaders(l);
        setSelectedLeader(l[0]);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  useEffect(() => {
    let mounted = true;
    (async () => {
      if (!selectedLeader) return;
      const res = await fetchUserTrades(selectedLeader.user_id, 1, 50);
      const from = startOfDay();
      const to = endOfDay();
      const today = res.data.items.filter((it) => {
        return (it.created_at * 1000) >= from.getTime() && (it.created_at * 1000) <= to.getTime();
      });
      if (mounted) setLeaderTradesToday(today);
    })();
    return () => { mounted = false; };
  }, [selectedLeader]);

  const filteredMarkets = useMemo(() => {
    if (!tag) return markets;
    return markets.filter((m) => (m.primary_tags || []).some((t) => t.name === tag));
  }, [markets, tag]);

  return (
    <div className="space-y-8">
      <section className="space-y-4">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Top Markets Today</h1>
            <p className="text-sm text-slate-200">Sorted by 24h volume</p>
          </div>
        </div>
        <TagsBar tags={tags} value={tag} onChange={setTag} />
        {loading ? (
          <div className="text-sm text-slate-600">Loading…</div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredMarkets.map((m) => (
              <MarketCard key={m.id} market={m} />
            ))}
          </div>
        )}
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold tracking-tight text-slate-50">
              Top Traders <span className="text-slate-400">(weekly)</span>
            </h2>
            <p className="text-xs text-slate-400">
              Tap a trader to see what they’re doing today.
            </p>
          </div>
          {/* optional right actions */}
          <div className="flex gap-2">
            <span className="inline-flex items-center gap-1 rounded-full bg-sky-500/10 px-3 py-1 text-xs text-sky-100">
              {leaders.length} tracked
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400/90" />
            </span>
          </div>
        </div>

        {/* trader pills */}
        <div className="flex flex-wrap gap-2">
          {leaders.map((u) => (
            <TraderBubble
              key={u.user_id}
              leader={u}
              selected={u.user_id === selectedLeader?.user_id}
              onSelect={setSelectedLeader}
            />
          ))}
        </div>

        {/* glass panel */}
        <div
          className="
      relative overflow-hidden rounded-2xl border
      border-slate-200/50 bg-white/5
      shadow-sm backdrop-blur-xl
      dark:border-slate-700/40 dark:bg-slate-950/15
    "
        >
          {/* gradient outline layer */}
          <div
            className="
        pointer-events-none absolute inset-0 rounded-2xl
        bg-[radial-gradient(circle_at_top,rgba(59,130,246,0.25),rgba(15,23,42,0))]
        opacity-70
      "
          />

          <div className="relative flex items-center justify-between border-b border-slate-200/5 px-4 py-3">
            <div className="text-sm font-medium text-slate-50">
              Trades today by{" "}
              <span className="text-sky-100">{selectedLeader?.username}</span>
            </div>
            <div className="text-xs text-slate-300/80">
              {leaderTradesToday.length} trades
            </div>
          </div>

          {/* list */}
          <div className="relative">
            {/* scrollable list */}
            <div className="relative max-h-80 divide-y divide-slate-200/5 overflow-y-auto scrollbar-thin scrollbar-glass scrollbar-mini pr-1">
              {leaderTradesToday.length === 0 ? (
                <div className="px-4 py-6 text-sm text-slate-300">No trades today.</div>
              ) : (
                leaderTradesToday.map((t) => {
                  const hrefBase =
                    process.env.NEXT_PUBLIC_MARKET_BASE_URL ||
                    "https://www.buzzing.app/app/topic/";
                  const externalHref = `${hrefBase}${t.club_id}`;
                  const series = leaderTradesToday
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
                      <div className="min-w-0 flex-1 space-y-1">
                        <div className="text-sm font-medium leading-snug text-slate-50 line-clamp-2">
                          {t.club_name}
                        </div>
                        <div className="text-[0.68rem] text-slate-300">
                          {t.type?.toUpperCase()} :{" "}
                          {(t.side ?? "").toUpperCase() || "—"} •{" "}
                          {t.share.toFixed(2)} @ {(t.price * 100).toFixed(1)}%
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        <div className="rounded-md bg-slate-900/20 p-1">
                          <MiniLineChart data={series} />
                        </div>
                        <div className="text-right text-xs text-slate-100">
                          {formatUSD(t.value)}
                          <div className="text-[0.6rem] text-slate-400">notional</div>
                        </div>
                      </div>
                    </a>
                  );
                })
              )}
            </div>

            {/* top fade */}
            <div className="pointer-events-none absolute inset-x-0 top-0 h-4 bg-linear-to-b from-slate-950/70 to-transparent" />
            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-5 bg-linear-to-t from-slate-950/80 to-transparent" />
          </div>

        </div>
      </section>

    </div>
  );
}

