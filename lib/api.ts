export type Pagination = {
  current_page: number;
  page_size: number;
  total_items: number;
  total_pages: number;
};

export type Market = {
  id: number;
  name: string;
  logo_url?: string;
  background_url?: string;
  description?: string;
  event_time?: number;
  liquidity?: string;
  volume?: string;
  volume_24h?: string;
  yes_price?: number;
  primary_tags?: { name: string; display_name: string; type: string; count?: number }[];
  secondary_tags?: { name: string; display_name: string; type: string; count?: number }[];
  time_mappings?: string;
  user_joined?: boolean;
  rate?: number;
};

export type MarketsResponse = {
  code: number;
  status?: string;
  message?: string;
  data?: { items?: Market[]; pagination?: Pagination } | Market[];
};

export type PrimaryTag = { name: string; display_name: string; type: string; count?: number };

export type LeaderUser = {
  rank: number;
  user_id: number;
  username: string;
  wallet_address: string;
  avatar_url?: string;
  pnl: string;
  pnl_percentage?: number;
  pnl_change?: string;
  volume?: string;
  total_positions?: number;
  win_rate?: number;
};

export type LeaderboardResponse = {
  code: number;
  data: { rankings: LeaderUser[] };
  status?: string;
  message?: string;
};

export type TradeItem = {
  amount_in: number;
  amount_out: number;
  club_id: number;
  club_logo_url?: string;
  club_name: string;
  created_at: number; // epoch seconds
  price: number;
  share: number;
  side: 'yes' | 'no';
  time_mappings?: string;
  token_out: number;
  tx_hash: string;
  type: 'buy' | 'sell' | string;
  value: number;
};

export type TradesResponse = {
  code: number;
  status: string;
  message: string;
  data: { items: TradeItem[]; pagination: Pagination };
};

export type PositionItem = {
  id: number;
  club_id: number;
  club_name: string;
  club_logo?: string;
  token_type: 'yes' | 'no' | string;
  quantity: number;
  average_price: number;
  latest_price: number;
  cost: number;
  current_value: number;
  return: number;
  return_rate: number;
  redeem_status: boolean;
  created_at?: string;
  last_updated?: string;
  time_mappings?: string;
};

export type PositionsResponse = {
  code: number;
  status: string;
  message: string;
  data: { items: PositionItem[]; pagination: Pagination };
};

const BASE = 'https://fluent-api.buzzing.app/api/v1';

async function http<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    ...init,
    // no caching for fresh market data
    cache: 'no-store',
    headers: { 'content-type': 'application/json', ...(init?.headers || {}) },
  });
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${path}`);
  return (await res.json()) as T;
}

export type SortBy = 'top_picks' | 'Liquidity' | 'volume' | 'newest' | 'end_soon' | '24hr_volume';

export async function fetchMarkets(params?: {
  sort_by?: SortBy;
  page?: number;
  page_size?: number;
  primary_tags?: string;
}): Promise<{ items: Market[]; pagination?: Pagination }>
{
  const qs = new URLSearchParams();
  if (params?.sort_by) qs.set('sort_by', params.sort_by);
  if (params?.page) qs.set('page', String(params.page));
  if (params?.page_size) qs.set('page_size', String(params.page_size));
  if (params?.primary_tags) qs.set('primary_tags', params.primary_tags);
  const data = await http<MarketsResponse>(`/club/filter${qs.toString() ? `?${qs.toString()}` : ''}`);
  if (Array.isArray(data.data)) return { items: data.data };
  return { items: data.data?.items || [], pagination: data.data?.pagination };
}

export async function fetchPrimaryTags(): Promise<PrimaryTag[]> {
  const resp = await http<any>('/club/tags/primary');
  const data = resp?.data;
  if (Array.isArray(data)) return data as PrimaryTag[];
  if (data && Array.isArray(data.items)) return data.items as PrimaryTag[];
  if (data && Array.isArray(data.list)) return data.list as PrimaryTag[];
  return [];
}

export type Timeframe = 'weekly' | 'monthly' | 'all-time';

export async function fetchLeaderboard(timeframe: Timeframe, page = 1, page_size = 20): Promise<LeaderUser[]> {
  const path = `/leaderboard/${timeframe}?page=${page}&page_size=${page_size}`;
  const data = await http<LeaderboardResponse>(path);
  return data.data?.rankings || [];
}

export async function fetchUserTrades(userId: number, page = 1, page_size = 20): Promise<TradesResponse> {
  return http<TradesResponse>(`/club/trades/history/${userId}?page=${page}&page_size=${page_size}`);
}

export async function fetchUserPositions(userId: number, page = 1, page_size = 20): Promise<PositionsResponse> {
  return http<PositionsResponse>(`/user/positions/${userId}?page=${page}&page_size=${page_size}`);
}

export function isEpochInRange(epochSec: number, from: Date, to: Date): boolean {
  const t = epochSec * 1000;
  return t >= from.getTime() && t <= to.getTime();
}

export function startOfDay(d = new Date()): Date {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

export function endOfDay(d = new Date()): Date {
  const x = new Date(d);
  x.setHours(23, 59, 59, 999);
  return x;
}

export function formatUSD(n?: number | string): string {
  if (n === undefined || n === null) return '$0';
  const num = typeof n === 'string' ? Number(n) : n;
  return new Intl.NumberFormat(undefined, { style: 'currency', currency: 'USD', maximumFractionDigits: 2 }).format(num);
}

export function pct(n: number): string {
  return `${(n * 100).toFixed(1)}%`;
}

export type HistoryPoint = { t: number; p: number };

export async function fetchMarketHistory(_clubId: number, _tf: '1h' | '6h' | '1d' | '1w' | '1m' | 'all' = 'all'): Promise<HistoryPoint[]> {
  return [];
}
