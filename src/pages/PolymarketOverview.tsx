import { useEffect, useMemo, useState } from "react";
import http from "../services/http";
import { useLocation } from "react-router-dom";
import styled from "styled-components";
import { colorScheme } from "../assets/themes";
import TradeStatistics from "../components/Statistics/Statistics";
import { PolyFilters, PolyFilterState } from "../components/PolyFilters";
import WinLossPieChart from "../components/Charts/WinLossPieChart";
import ComparisonChart from "../components/Charts/ComparisonBarChart";
import ModeSelection from "../components/ModeSelection";
import { PolyPosition } from "../models/PolyTypes";
import { polyPositionToTrade } from "../utils/polyPositionToTrade";
import { groupPolyFills } from "../utils/groupPolyFills";

const Container = styled.div`
  padding: 24px;
  text-align: left;
  color: ${colorScheme.base["900"]};
`;

const CardRow = styled.div`
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
  margin-bottom: 24px;
`;

const Card = styled.div`
  background: white;
  border: 1px solid ${colorScheme.base["200"]};
  border-radius: 8px;
  padding: 16px;
  min-width: 220px;
`;

const H2 = styled.h2`
  margin: 0 0 12px 0;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  background: ${colorScheme.base.paper};
  color: ${colorScheme.base.black};
`;

const TH = styled.th`
  text-align: left;
  border-bottom: 1px solid ${colorScheme.base["300"]};
  padding: 10px 8px;
  background: ${colorScheme.base["100"]};
  color: ${colorScheme.base.black};
  position: sticky;
  top: 0;
`;

const TD = styled.td`
  border-bottom: 1px solid ${colorScheme.base["150"]};
  padding: 10px 8px;
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono",
    "Courier New", monospace;
  font-size: 12px;
  color: ${colorScheme.base.black};
`;

const TR = styled.tr`
  &:nth-child(even) {
    background: ${colorScheme.base["50"]};
  }
`;

type Summary = {
  counts: { strategies: number; runs: number; trades: number; fills?: number };
  positions?: { wins?: number; losses?: number; pnl_usd?: number; winrate?: number };
  recentTrades: any[];
};

type ActivityRow = {
  mode: string;
  ts: number;
  market_name: string;
  action: string;
  usdc_amount: number;
  token_amount: number;
  token_name: string | null;
  tx_hash: string;
  strategy: string | null;
};

export default function PolymarketOverview() {
  const location = useLocation();
  const mode = useMemo(
    () => (location.pathname.includes("/polymarket/live") ? "live" : "paper"),
    [location.pathname]
  );

  const [summary, setSummary] = useState<Summary | null>(null);
  const [positions, setPositions] = useState<PolyPosition[]>([]);
  const [activity, setActivity] = useState<ActivityRow[]>([]);
  const [tradesOpen, setTradesOpen] = useState<boolean>(true);
  const [comparisonMode, setComparisonMode] = useState<"R" | "$">("$");
  const [filters, setFilters] = useState<PolyFilterState>({
    asset: "all",
    direction: "all",
    strategy: "all",
  });

  // For positions-based statistics we only support filters we can apply reliably today.
  const statsFilters: PolyFilterState = {
    asset: filters.asset,
    direction: filters.direction,
    strategy: "all",
  };
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const run = async () => {
      try {
        setError(null);
        const [sumResp, posResp, actResp] = await Promise.all([
          http.get(`/api/poly/summary?mode=${mode}`),
          http.get(`/api/poly/positions?mode=${mode}&limit=500`),
          http.get(`/api/poly/activity?mode=${mode}&limit=500`),
        ]);
        setSummary(sumResp.data);
        setPositions(posResp.data?.rows ?? []);
        setActivity(actResp.data?.rows ?? []);
      } catch (e: any) {
        setError(e?.message || "Failed to load");
      }
    };
    run();
  }, [mode]);

  const handleComparisonModeChange = (event: any) => {
    setComparisonMode(event.target.value);
  };

  return (
    <Container>
      <H2>Polymarket — Overview</H2>
      {error && <div style={{ color: "crimson" }}>{error}</div>}

      {summary && (
        <>
          <PolyFilters
            assets={[...new Set((summary.recentTrades || []).map((t: any) => String(t.asset ?? "")))].filter((x) => x && x !== "undefined").sort()}
            strategies={[...new Set((summary.recentTrades || []).map((t: any) => String(t.strategy ?? "unknown")))].filter((x) => x && x !== "undefined").sort()}
            value={filters}
            onChange={setFilters}
          />
          {filters.strategy !== "all" && (
            <div style={{ marginTop: -10, marginBottom: 12, fontSize: 12, opacity: 0.7 }}>
              Note: Strategy filter currently applies to the fills table only (historical positions don’t have strategy attribution yet).
            </div>
          )}
          {/** Filtered datasets */}
          {/** positions are authoritative for P/L + winrate; fills (recentTrades) are the fill-level table */}
          {(() => {
            const posTrades = positions.map((p, idx) => polyPositionToTrade(p, idx + 1));

            const filteredPos = posTrades.filter((t) => {
              if (statsFilters.direction !== "all" && t.direction !== (statsFilters.direction === "UP" ? "Long" : "Short")) {
                return false;
              }
              if (statsFilters.asset !== "all" && !String(t.ticker).toUpperCase().includes(statsFilters.asset)) {
                return false;
              }
              // strategy filter for positions: we DO NOT have strategy attribution on positions yet,
              // so we intentionally ignore it here. (Fills table will still filter by strategy.)
              return true;
            });

            // Canonical fill/activity table comes from poly_orders via /api/poly/activity.
            // We filter only Buy actions here.
            const filteredFills = activity
              .filter((t) => String(t.action).toLowerCase() === "buy")
              .filter((t) => {
                const m = String(t.market_name || "");
                const asset = m.toUpperCase().includes("BITCOIN") ? "BTC" :
                              m.toUpperCase().includes("ETHEREUM") ? "ETH" :
                              m.toUpperCase().includes("SOLANA") ? "SOL" :
                              m.toUpperCase().includes("XRP") ? "XRP" : "";
                const dir = (t.token_name || "").toUpperCase() === "UP" ? "UP" : ((t.token_name || "").toUpperCase() === "DOWN" ? "DOWN" : "");
                const strat = t.strategy || "unknown";
                if (filters.asset !== "all" && asset !== filters.asset) return false;
                if (filters.direction !== "all" && dir !== filters.direction) return false;
                if (filters.strategy !== "all" && strat !== filters.strategy) return false;
                return true;
              });

            const groupedFills = groupPolyFills(filteredFills);

            const pnl = filteredPos.reduce((acc, t) => acc + (t.realPL ?? 0), 0);
            const tileTrades = filteredFills.length;
            const tilePositions = filteredPos.length;

            return (
              <>
                <CardRow>
            <Card>
              <div style={{ opacity: 0.7 }}>Strategies</div>
              <div style={{ fontSize: 28, fontWeight: 700 }}>{summary.counts.strategies}</div>
            </Card>
            <Card>
              <div style={{ opacity: 0.7 }}>Runs</div>
              <div style={{ fontSize: 28, fontWeight: 700 }}>{summary.counts.runs}</div>
            </Card>
            <Card>
              <div style={{ opacity: 0.7 }}>Trades</div>
              <div style={{ fontSize: 28, fontWeight: 700 }}>
                {summary.counts.trades}
                <span style={{ fontSize: 12, opacity: 0.65, marginLeft: 8 }}>
                  ({summary.counts.fills ?? tileTrades} fills)
                </span>
              </div>
            </Card>
            <Card>
              <div style={{ opacity: 0.7 }}>Resolved</div>
              <div style={{ fontSize: 28, fontWeight: 700 }}>
                {(summary?.positions?.wins ?? 0) + (summary?.positions?.losses ?? 0)}
                <span style={{ fontSize: 12, opacity: 0.65, marginLeft: 8 }}>
                  / {tilePositions} positions
                </span>
              </div>
            </Card>
            <Card>
              <div style={{ opacity: 0.7 }}>Positions</div>
              <div style={{ fontSize: 28, fontWeight: 700 }}>{tilePositions}</div>
            </Card>
            <Card>
              <div style={{ opacity: 0.7 }}>P/L (positions)</div>
              <div style={{ fontSize: 28, fontWeight: 700 }}>{Math.round(pnl * 100) / 100}</div>
            </Card>
          </CardRow>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "minmax(0, 3fr) minmax(320px, 1fr)",
              gap: 24,
              alignItems: "start",
            }}
          >
            <div style={{ minWidth: 0 }}>
              <TradeStatistics closedTrades={filteredPos} />
            </div>
            <div style={{ minWidth: 320 }}>
              <h3>Win Loss %</h3>
              {/* @ts-ignore */}
              {/* @ts-ignore */}
              <WinLossPieChart trades={filteredPos} />
              <h3 style={{ marginTop: 16 }}>
                Win/Loss Comparison (
                <ModeSelection
                  comparisonMode={comparisonMode}
                  handleComparisonModeChange={handleComparisonModeChange}
                />
                )
              </h3>
              {/* @ts-ignore */}
              {/* @ts-ignore */}
              <ComparisonChart trades={filteredPos} mode={comparisonMode} />
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 16 }}>
            <h3 style={{ marginTop: 0 }}>Recent positions (resolved outcomes)</h3>
          </div>

          <Table>
            <thead>
              <tr>
                <TH>exec_time (ET)</TH>
                <TH>mode</TH>
                <TH>instrument</TH>
                <TH>token</TH>
                <TH>strategy</TH>
                <TH>timeframe</TH>
                <TH>avg_entry</TH>
                <TH>result</TH>
                <TH>pnl</TH>
                <TH>fills</TH>
              </tr>
            </thead>
            <tbody>
              {positions.slice(0, 50).map((p: any, i: number) => {
                const ts = p.last_ts ?? p.first_ts;
                const et = ts
                  ? new Date(ts * 1000).toLocaleString("en-US", {
                      timeZone: "America/New_York",
                      month: "short",
                      day: "2-digit",
                      hour: "numeric",
                      minute: "2-digit",
                    })
                  : "";

                const title = String(p.market_name || "");
                const instrument = title.toUpperCase().includes("BITCOIN")
                  ? "BTC"
                  : title.toUpperCase().includes("ETHEREUM")
                  ? "ETH"
                  : title.toUpperCase().includes("SOLANA")
                  ? "SOL"
                  : title.toUpperCase().includes("XRP")
                  ? "XRP"
                  : (p.asset || "");

                const timeframe = title.includes("-") ? title.split("-").slice(1).join("-").trim() : "";
                const strat = p.strategy || "unknown";

                return (
                  <TR key={i}>
                    <TD>{et}</TD>
                    <TD>{String(p.mode ?? "")}</TD>
                    <TD>{String(instrument ?? "")}</TD>
                    <TD>{String(p.token_name ?? "")}</TD>
                    <TD>{String(strat ?? "")}</TD>
                    <TD>{String(timeframe ?? "")}</TD>
                    <TD>{p.avg_entry_price ?? ""}</TD>
                    <TD>{String(p.result ?? "")}</TD>
                    <TD>{p.realized_pnl_usd ?? ""}</TD>
                    <TD>{p.fills ?? ""}</TD>
                  </TR>
                );
              })}
            </tbody>
          </Table>

          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 16 }}>
            <h3 style={{ marginTop: 0 }}>Recent fills (execution audit)</h3>
            <button
              onClick={() => setTradesOpen(!tradesOpen)}
              style={{
                padding: "6px 10px",
                borderRadius: 6,
                border: `1px solid ${colorScheme.base["300"]}`,
                background: "white",
                cursor: "pointer",
              }}
            >
              {tradesOpen ? "Hide" : "Show"}
            </button>
          </div>

          {tradesOpen && (
            <Table>
              <thead>
                <tr>
                  <TH>ts_open</TH>
                  <TH>mode</TH>
                  <TH>asset</TH>
                  <TH>dir</TH>
                  <TH>strategy</TH>
                  <TH>entry</TH>
                  <TH>result</TH>
                  <TH>pnl</TH>
                  <TH>max_payout</TH>
                </tr>
              </thead>
              <tbody>
                {groupedFills.map((t: any, i: number) => (
                  <TR key={t.key ?? i}>
                    <TD>{String(t.ts_open ?? "")}</TD>
                    <TD>{String(t.mode ?? "")}</TD>
                    <TD>{String(t.asset ?? "")}</TD>
                    <TD>{String(t.direction ?? "")}</TD>
                    <TD>{String(t.strategy ?? "")}</TD>
                    <TD>{t.entry_price ?? ""}</TD>
                    <TD>{t.settled_result ?? ""}</TD>
                    <TD>{t.settled_pnl_usd ?? ""}</TD>
                    <TD>{t.implied_pnl_usd ?? ""}</TD>
                  </TR>
                ))}
              </tbody>
            </Table>
          )}
              </>
            );
          })()}
        </>
      )}

      {!summary && !error && <div>Loading…</div>}
    </Container>
  );
}
