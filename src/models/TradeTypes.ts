// TradeTypes.ts
export interface Trade {
  id: number;
  accountID: number;
  datetimeIn: string;
  datetimeOut: string | null;
  totalHrs: number | null;
  ticker: string;
  direction: "Long" | "Short";
  equity: number;
  entry: number;
  stopLoss: number;
  target: number;
  size: number;
  risk: number;
  estGain: number;
  estRR: number;
  exitPrice: number | null;
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
  type: string;
  screenshot: string | null;
  comment: string | null;
  status: string;
}

export type PartialTrade = Partial<Trade>;
