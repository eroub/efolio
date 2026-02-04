export interface PolyFillTrade {
  mode: "live" | "paper";
  ts_open: string;
  window_ts: number;
  asset: string;
  direction: "UP" | "DOWN";
  strategy: string;
  entry_price: number;
  exit_price: number | null;
  result: string | null;
  pnl_usd: number | null;
  implied_pnl_usd: number | null;
  settled_pnl_usd?: number | null;
  settled_result?: string | null;
}

export interface PolyPosition {
  mode: "live" | "paper";
  market_name: string;
  token_name: string; // Up/Down or other
  window_ts: number;
  first_ts: number | null;
  last_ts: number | null;
  buy_usdc: number;
  buy_tokens: number;
  avg_entry_price: number | null;
  redeem_usdc: number;
  realized_pnl_usd: number | null;
  result: "win" | "loss" | "push" | null;
  fills: number;
}
