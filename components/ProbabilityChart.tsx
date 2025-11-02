"use client";
import React from 'react';

type Point = { t: number; p: number }; // t in ms or seconds, p in 0..1

type Props = {
  data: Point[];
  width?: number;
  height?: number;
};

export default function ProbabilityChart({ data, width = 640, height = 220 }: Props) {
  const series = (data || []).map((d) => ({ t: d.t > 1e12 ? d.t : d.t * 1000, p: Math.max(0, Math.min(1, d.p)) }));
  if (series.length === 0) return <div className="text-sm text-slate-600">No probability history.</div>;

  const times = series.map((d) => d.t);
  const tMin = Math.min(...times);
  const tMax = Math.max(...times);
  const pad = 32;
  const innerW = width - pad * 2;
  const innerH = height - pad * 2;

  const points = series.map((d) => {
    const x = pad + ((d.t - tMin) / Math.max(1, tMax - tMin)) * innerW;
    const y = pad + (1 - d.p) * innerH;
    return `${x},${y}`;
  }).join(' ');

  const last = series[series.length - 1];
  const lastX = pad + ((last.t - tMin) / Math.max(1, tMax - tMin)) * innerW;
  const lastY = pad + (1 - last.p) * innerH;

  return (
    <div className="w-full overflow-hidden rounded-xl border border-slate-200 bg-white">
      <div className="flex items-center justify-between px-4 py-3">
        <div className="text-xl font-semibold">
          <span className="text-emerald-700">Yes {(last.p * 100).toFixed(1)}%</span>
          <span className="mx-2 text-slate-400">/</span>
          <span className="text-rose-700">No {(100 - last.p * 100).toFixed(1)}%</span>
        </div>
        <div className="text-xs text-slate-600">ALL</div>
      </div>
      <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>        
        <g>
          {[0.25, 0.5, 0.75].map((v) => {
            const y = pad + (1 - v) * innerH;
            return <line key={v} x1={pad} y1={y} x2={pad + innerW} y2={y} stroke="#e2e8f0" strokeDasharray="4 4" />
          })}
        </g>
        <polyline fill="none" stroke="#10b981" strokeWidth={3} points={points} strokeLinejoin="round" strokeLinecap="round" />
        <circle cx={lastX} cy={lastY} r={4} fill="#10b981" />
        <g fontSize="10" fill="#334155">
          <text x={pad + innerW + 6} y={pad + (1 - 1) * innerH + 3}>100%</text>
          <text x={pad + innerW + 6} y={pad + (1 - 0.75) * innerH + 3}>75%</text>
          <text x={pad + innerW + 6} y={pad + (1 - 0.5) * innerH + 3}>50%</text>
          <text x={pad + innerW + 6} y={pad + (1 - 0.25) * innerH + 3}>25%</text>
          <text x={pad + innerW + 6} y={pad + (1 - 0) * innerH + 3}>0%</text>
        </g>
      </svg>
    </div>
  );
}
