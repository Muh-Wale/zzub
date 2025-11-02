"use client";
import { PrimaryTag } from '@/lib/api';

type Props = {
  tags?: PrimaryTag[];
  value?: string;
  onChange?: (name: string) => void;
};

export default function TagsBar({ tags, value, onChange }: Props) {
  const list = Array.isArray(tags) ? tags : [];
  return (
    <div className="flex flex-wrap items-center gap-2">
      <button
        className={`rounded-full border px-3 py-1 text-sm ${!value ? 'bg-blue-600 border-blue-600 text-white' : 'border-slate-300 text-slate-800 hover:bg-slate-50'}`}
        onClick={() => onChange?.('')}
      >
        All
      </button>
      {list.map((t) => (
        <button
          key={t.name}
          onClick={() => onChange?.(t.name)}
          className={`rounded-full border px-3 py-1 text-sm ${value === t.name ? 'bg-blue-600 border-blue-600 text-white' : 'border-slate-300 text-slate-800 hover:bg-slate-50'}`}
        >
          {t.display_name}
        </button>
      ))}
    </div>
  );
}
