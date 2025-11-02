"use client";
import { useEffect, useRef, useState } from 'react';
import Sparkline from './Sparkline';

type Point = { t: number; p: number }; // t seconds or ms, p in 0..1

type Props = {
  data: Point[];
  height?: number;
};

export default function MiniLineChart({ data, height = 36 }: Props) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [fallback, setFallback] = useState(false);
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        if (!ref.current) return;
        const mod = await import('lightweight-charts');
        const createChart = mod.createChart as any;
        if (!createChart) throw new Error('createChart missing');
        const chart = createChart(ref.current, {
          height,
          layout: { background: { color: 'transparent' }, textColor: '#525252' },
          grid: { vertLines: { visible: false }, horzLines: { visible: false } },
          rightPriceScale: { visible: false },
          timeScale: { visible: false },
          crosshair: { vertLine: { visible: false }, horzLine: { visible: false } },
          handleScroll: false,
          handleScale: false,
        });
        if (typeof chart.addLineSeries !== 'function') throw new Error('addLineSeries missing');
        const series = chart.addLineSeries({ color: '#f97316', lineWidth: 2 });
        const points = (data || []).map((d) => ({
          time: (d.t > 1e12 ? d.t : d.t * 1000) / 1000,
          value: Math.max(0, Math.min(1, d.p)) * 100,
        }));
        if (points.length === 1) {
          points.push({ ...points[0], time: points[0].time + 60 });
        }
        series.setData(points);
        const ro = new ResizeObserver(() => chart.applyOptions({ width: ref.current?.clientWidth || 160 }));
        ro.observe(ref.current!);
        return () => { ro.disconnect(); chart.remove(); };
      } catch {
        if (mounted) setFallback(true);
      }
    })();
    return () => { mounted = false; };
  }, [data, height]);

  if (fallback) {
    return <Sparkline data={(data || []).map(d => Math.max(0, Math.min(1, d.p)))} width={140} height={height} color="#f97316" />
  }
  return <div ref={ref} style={{ width: '140px' }} />;
}
