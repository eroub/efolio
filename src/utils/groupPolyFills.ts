import { PolyFillTrade } from "../models/PolyTypes";

export type GroupedPolyFill = {
  key: string;
  mode: string;
  window_ts: number;
  ts_open: string;
  asset: string;
  direction: string;
  strategy: string;
  entry_price: number | null;
  size_usd: number;
  settled_result: string | null;
  settled_pnl_usd: number | null;
  implied_pnl_usd: number | null;
  legs: PolyFillTrade[];
};

export function groupPolyFills(fills: any[]): GroupedPolyFill[] {
  const groups = new Map<string, PolyFillTrade[]>();

  for (const t of fills ?? []) {
    const key = [t.mode, t.window_ts, t.asset, t.direction, t.strategy].join("|");
    const arr = groups.get(key) ?? [];
    arr.push(t);
    groups.set(key, arr);
  }

  const out: GroupedPolyFill[] = [];
  for (const [key, legs] of groups.entries()) {
    legs.sort((a: any, b: any) => String(b.ts_open).localeCompare(String(a.ts_open)));
    const first = legs[0] as any;

    // weighted avg entry by implied size_usd if available; otherwise simple avg
    let wSum = 0;
    let w = 0;
    for (const l of legs as any[]) {
      const entry = Number(l.entry_price);
      const size = Number(l.size_usd ?? 0);
      if (Number.isFinite(entry) && Number.isFinite(size) && size > 0) {
        wSum += entry * size;
        w += size;
      }
    }
    const entry_price = w > 0 ? wSum / w : (Number.isFinite(Number(first.entry_price)) ? Number(first.entry_price) : null);

    const size_usd = legs.reduce((acc: number, l: any) => acc + Number(l.size_usd ?? 0), 0);

    // settlement: sum pnl across legs where present
    const settled_pnl_usd = legs.reduce((acc: number, l: any) => {
      const v = l.settled_pnl_usd ?? l.pnl_usd;
      return acc + (Number.isFinite(Number(v)) ? Number(v) : 0);
    }, 0);

    const anySettled = legs.some((l: any) => l.settled_result || l.result || (l.settled_pnl_usd != null) || (l.pnl_usd != null));
    const settled_result = legs.find((l: any) => l.settled_result)?.settled_result ?? legs.find((l: any) => l.result)?.result ?? null;

    const implied_pnl_usd = legs.reduce((acc: number, l: any) => acc + (Number.isFinite(Number(l.implied_pnl_usd)) ? Number(l.implied_pnl_usd) : 0), 0);

    out.push({
      key,
      mode: first.mode,
      window_ts: Number(first.window_ts),
      ts_open: first.ts_open,
      asset: first.asset,
      direction: first.direction,
      strategy: first.strategy,
      entry_price,
      size_usd,
      settled_result,
      settled_pnl_usd: anySettled ? settled_pnl_usd : null,
      implied_pnl_usd: implied_pnl_usd || null,
      legs,
    });
  }

  out.sort((a, b) => String(b.ts_open).localeCompare(String(a.ts_open)));
  return out;
}
