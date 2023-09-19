// TradeTypes.ts

export interface Trade {
  id: number;
  datetimeIn: string;
  datetimeOut: string | null;
  totalHrs: number | null;
  ticker: string;
  direction: "Long" | "Short";
  equity: number | null;
  entry: number | null;
  stopLoss: number | null;
  target: number | null;
  size: number | null;
  risk: number | null;
  estGain: number | null;
  estRR: number | null;
  exit: number | null;
  projPL: number | null;
  realPL: number | null;
  commission: number | null;
  percentChange: number | null;
  realRR: number | null;
  pips: number | null;
  mfe: number | null;
  mae: number | null;
  mfeRatio: number | null;
  maeRatio: number | null;
  type: string | null;
  screenshot: string | null;
  comment: string | null;
  // USD specific fields
  riskUSD: number | null;
  estGainUSD: number | null;
  projPLUSD: number | null;
}

export type PartialTrade = Partial<Trade>;
