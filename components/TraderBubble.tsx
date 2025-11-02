"use client";

import Image from "next/image";
import { LeaderUser, formatUSD } from "@/lib/api";

type Props = {
  leader: LeaderUser;
  onSelect?: (u: LeaderUser) => void;
  selected?: boolean;
};

export default function TraderBubble({ leader, onSelect, selected }: Props) {
  const selectedClasses = `
    bg-gradient-to-r from-sky-500/90 via-sky-400/90 to-emerald-400/80
    text-white border-sky-200/10 shadow-sm
  `;
  const normalClasses = `
    bg-slate-700/30 text-slate-100 border-slate-700/40
  hover:bg-gradient-to-r hover:from-sky-400/40 hover:via-sky-300/30 hover:to-emerald-300/30
  hover:text-white/90 hover:border-sky-200/20
  hover:shadow-sm
  transition-all duration-200
  `;

  return (
    <button
      onClick={() => onSelect?.(leader)}
      className={`
        flex items-center gap-2 rounded-full border px-3 py-1.5
        backdrop-blur-md transition-colors cursor-pointer
        ${selected ? selectedClasses : normalClasses}
      `}
    >
      {leader.avatar_url ? (
        <Image
          src={leader.avatar_url}
          alt={leader.username}
          width={26}
          height={26}
          className="rounded-full border border-white/30"
        />
      ) : (
        <div className="h-6 w-6 rounded-full bg-slate-200/10" />
      )}

      <span className="max-w-32 truncate text-sm font-medium">
        {leader.username}
      </span>

      {/* pnl */}
      <span
        className={`
          text-xs rounded-full px-2 py-0.5
          ${selected ? "bg-black/40 text-green-500" : "bg-emerald-500/10 text-emerald-200"}
        `}
      >
        PnL {formatUSD(leader.pnl)}
      </span>

      {leader.volume ? (
        <span
          className={`
            text-xs rounded-full px-2 py-0.5
            ${selected ? "bg-black/30 text-white" : "bg-sky-500/10 text-sky-200"}
          `}
        >
          Vol {formatUSD(leader.volume)}
        </span>
      ) : null}

      <span
        className={`
          ml-1 inline-flex h-5 w-5 items-center justify-center rounded-full text-xs
          ${selected ? "bg-white/20 text-white" : "bg-slate-800/80 text-slate-200"}
        `}
      >
        +
      </span>
    </button>
  );
}
