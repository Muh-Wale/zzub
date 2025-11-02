"use client";
import Image from "next/image";
import ProbabilityBar from "./ProbabilityBar";
import Sparkline from "./Sparkline";
import { useEffect, useState } from "react";
import { fetchMarketHistory } from "@/lib/api";
import { Market, formatUSD } from "@/lib/api";

type Props = { market: Market };

export default function MarketCard({ market }: Props) {
  const [series, setSeries] = useState<number[] | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const hist = await fetchMarketHistory(market.id, "1d");
        if (!mounted) return;
        if (hist.length > 1) setSeries(hist.map((h) => h.p));
        else setSeries([]);
      } catch {
        setSeries([]);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [market.id]);

  const hrefBase =
    process.env.NEXT_PUBLIC_MARKET_BASE_URL ||
    "https://www.buzzing.app/app/topic/";
  const externalHref = `${hrefBase}${market.id}`;

  return (
    <a
      href={externalHref}
      target="_blank"
      rel="noreferrer noopener"
      className="
        group relative overflow-hidden rounded-2xl
        border border-slate-200/60 bg-white/80 shadow-sm
        transition-all duration-200
        hover:border-sky-400/80 hover:shadow-[0_18px_50px_-30px_rgba(15,23,42,.55)]
        dark:border-slate-700/35 dark:bg-slate-950/35 dark:shadow-none
        dark:hover:border-sky-400/60
      "
    >
      {/* subtle highlight layer for dark bg */}
      <div
        className="
          pointer-events-none absolute inset-px rounded-[1.05rem]
          bg-linear-to-b from-sky-400/0 via-sky-400/0 to-sky-400/12
          opacity-0 transition-opacity duration-200
          group-hover:opacity-100
          dark:from-sky-400/0 dark:to-sky-400/14
        "
      />

      <div className="relative flex flex-col gap-3 p-4">
        {/* top row */}
        <div className="flex items-start gap-3">
          {market.logo_url ? (
            <Image
              src={market.logo_url}
              alt={market.name}
              width={40}
              height={40}
              className="rounded-lg bg-slate-100/50 dark:bg-slate-900/50"
            />
          ) : (
            <div className="h-10 w-10 rounded-lg bg-slate-100/60 dark:bg-slate-900/40" />
          )}

          <div className="min-w-0 flex-1">
            {/* longer text: 2 lines, not truncate */}
            <h3
              className="
                text-sm font-semibold leading-snug text-slate-950
                line-clamp-2
                dark:text-slate-50
              "
            >
              {market.name}
            </h3>

            <div className="mt-2 flex flex-wrap items-center gap-2 text-[0.68rem]">
              <span className="inline-flex items-center gap-1 rounded-full bg-sky-50 px-2 py-0.5 text-sky-900 dark:bg-sky-500/10 dark:text-sky-100">
                <span className="h-1.5 w-1.5 rounded-full bg-sky-400/90" />
                24h {formatUSD(market.volume_24h || "0")}
              </span>
              {market.liquidity ? (
                <span className="inline-flex items-center gap-1 rounded-full bg-violet-50 px-2 py-0.5 text-violet-900 dark:bg-violet-500/10 dark:text-violet-50">
                  <span className="h-1.5 w-1.5 rounded-full bg-violet-400/90" />
                  Liq {formatUSD(market.liquidity)}
                </span>
              ) : null}
            </div>
          </div>
        </div>

        {/* middle: chart or prob bar */}
        <div className="rounded-lg bg-slate-50/60 p-2 dark:bg-slate-900/30">
          {series && series.length > 0 ? (
            <div className="-mx-1 h-16">
              <Sparkline data={series} />
            </div>
          ) : (
            <ProbabilityBar value={Number(market.yes_price || 0)} label="Yes probability" />
          )}
        </div>

        {/* bottom CTA */}
        <div className="flex items-center justify-between text-[0.68rem] text-slate-500 dark:text-slate-300/80">
          <span className="flex-1 min-w-0 pr-4 leading-relaxed">
            View full market details &amp; place a position →
          </span>
          <span
            className="
              rounded-full bg-sky-500/10 px-2 py-0.5 text-[0.6rem] font-medium text-sky-700
              dark:bg-sky-400/10 dark:text-sky-50
            "
          >
            Live
          </span>
        </div>
      </div>
    </a>
  );
}
