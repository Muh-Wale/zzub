"use client";
import React from 'react';

type Props = {
  data: number[]; // values between 0 and 1
  width?: number;
  height?: number;
  color?: string;
  strokeWidth?: number;
};

export default function Sparkline({ data, width = 220, height = 44, color = '#f97316', strokeWidth = 2 }: Props) {
  const vals = data && data.length > 0 ? data : [0];
  const max = 1;
  const min = 0;
  const len = vals.length;
  const stepX = len > 1 ? width / (len - 1) : width;
  const points = vals.map((v, i) => {
    const x = i * stepX;
    const y = height - ((v - min) / (max - min)) * height;
    return `${x},${y}`;
  }).join(' ');

  const lastY = height - ((vals[vals.length - 1] - min) / (max - min)) * height;

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} aria-hidden="true">
      <polyline fill="none" stroke={color} strokeWidth={strokeWidth} points={points} strokeLinejoin="round" strokeLinecap="round" />
      <circle cx={width} cy={lastY} r={3} fill={color} />
    </svg>
  );
}

