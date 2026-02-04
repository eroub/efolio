import { Trade } from "../models/TradeTypes";
import { PolyPosition } from "../models/PolyTypes";

// Adapter: map a Polymarket position into the generic Trade Statistics model.
// Many fields are not meaningful for Polymarket; we fill them with neutral defaults.
export function polyPositionToTrade(p: PolyPosition, id: number): Trade {
  const datetimeIn = new Date((p.first_ts ?? 0) * 1000).toISOString();
  const datetimeOut = p.last_ts ? new Date(p.last_ts * 1000).toISOString() : null;

  const entry = p.avg_entry_price ?? 0;
  const exitPrice = null;

  const realPL = p.realized_pnl_usd ?? null;

  // percentChange: for binary markets, payout is 1.0; the “return” is pnl / cost.
  const percentChange = p.buy_usdc ? (realPL ?? 0) / p.buy_usdc : null;

  const direction = p.token_name.toLowerCase() === "up" ? "Long" : "Short";

  const totalHrs =
    p.first_ts && p.last_ts ? (p.last_ts - p.first_ts) / 3600 : null;

  return {
    id,
    accountID: 0,
    datetimeIn,
    datetimeOut,
    totalHrs,
    ticker: p.market_name,
    direction,
    equity: 0,
    entry,
    stopLoss: 0,
    target: 0,
    size: p.buy_usdc,
    risk: p.buy_usdc,
    estGain: 0,
    estRR: 0,
    exitPrice,
    projPL: null,
    realPL,
    commission: null,
    percentChange,
    realRR: percentChange,
    pips: null,
    mfe: null,
    mae: null,
    mfeRatio: null,
    maeRatio: null,
    type: "polymarket",
    screenshot: null,
    comment: null,
    status: p.result ? "Closed" : "Open",
  };
}
