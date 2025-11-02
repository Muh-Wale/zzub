"use client";
import { useEffect, useState } from 'react';
import { LeaderUser, PositionItem, Timeframe, fetchLeaderboard, fetchUserPositions, formatUSD } from '@/lib/api';

type Entry = PositionItem & { user: LeaderUser };

export default function UnpaidPage() {
  const [timeframe, setTimeframe] = useState<Timeframe>('weekly');
  const [entries, setEntries] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      try {
        // heuristic: scan top 50 traders, aggregate positions not redeemed, sort by current_value desc
        const leaders = await fetchLeaderboard(timeframe, 1, 50);
        const positionLists = await Promise.all(
          leaders.map(async (u) => {
            try {
              const res = await fetchUserPositions(u.user_id, 1, 50);
              return res.data.items.filter((p) => !p.redeem_status).map((p) => ({ ...p, user: u }));
            } catch {
              return [] as Entry[];
            }
          })
        );
        const flat = positionLists.flat();
        const top = flat
          .sort((a, b) => (b.current_value || 0) - (a.current_value || 0))
          .slice(0, 100);
        if (mounted) setEntries(top);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [timeframe]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold tracking-tight">High Value Unpaid</h1>
        <select
          className="rounded-md border border-zinc-300 bg-amber-50 px-3 py-2 text-sm"
          value={timeframe}
          onChange={(e) => setTimeframe(e.target.value as Timeframe)}
        >
          <option value="weekly">weekly</option>
          <option value="monthly">monthly</option>
          <option value="all-time">all-time</option>
        </select>
      </div>

      {loading ? (
        <div className="text-sm text-zinc-600">Building list…</div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-zinc-200">
          <div className="grid grid-cols-5 bg-zinc-50 px-4 py-2 text-xs font-medium text-zinc-700">
            <div className="col-span-2">Market</div>
            <div>Trader</div>
            <div className="text-right">Current</div>
            <div className="text-right">Cost</div>
          </div>
          <div className="divide-y">
            {entries.map((e) => (
              <a key={`${e.user.user_id}-${e.id}`} href={(process.env.NEXT_PUBLIC_MARKET_BASE_URL || 'https://www.buzzing.app/app/topic/') + e.club_id} target="_blank" rel="noreferrer noopener" className="grid grid-cols-5 items-center px-4 py-3 text-sm hover:bg-zinc-50">
                <div className="col-span-2 truncate font-medium">{e.club_name}</div>
                <div className="truncate text-xs text-zinc-700">{e.user.username}</div>
                <div className="text-right text-xs">{formatUSD(e.current_value)}</div>
                <div className="text-right text-xs text-zinc-600">{formatUSD(e.cost)}</div>
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
