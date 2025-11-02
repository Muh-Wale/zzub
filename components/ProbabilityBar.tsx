"use client";

type Props = { value: number; label?: string };

export default function ProbabilityBar({ value, label }: Props) {
  const yes = Math.max(0, Math.min(1, value));
  const no = 1 - yes;

  return (
    <div className="w-full">
      <div className="mb-1 flex items-center justify-between text-[0.68rem] text-slate-700 dark:text-slate-200/85">
        <span className="font-medium">{label ?? "Yes probability"}</span>
        <div className="flex items-center gap-2">
          <span className="tabular-nums rounded bg-emerald-500/10 px-1.5 py-0.5 text-[0.6rem] font-medium text-emerald-600 dark:text-emerald-200">
            Yes {(yes * 100).toFixed(1)}%
          </span>
          <span className="tabular-nums rounded bg-rose-500/10 px-1.5 py-0.5 text-[0.6rem] font-medium text-rose-600 dark:text-rose-200">
            No {(no * 100).toFixed(1)}%
          </span>
        </div>
      </div>
      <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-200/50 dark:bg-slate-900/40">
        <div className="flex h-full w-full">
          <div
            className="h-full bg-linear-to-r from-emerald-400 to-emerald-500"
            style={{ width: `${yes * 100}%` }}
          />
          <div
            className="h-full bg-linear-to-r from-rose-400 to-rose-500"
            style={{ width: `${no * 100}%` }}
          />
        </div>
      </div>
    </div>
  );
}
