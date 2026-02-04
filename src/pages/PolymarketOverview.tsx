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
  counts: { strategies: number; runs: number; trades: number };
  recentTrades: any[];
};

export default function PolymarketOverview() {
  const location = useLocation();
  const mode = useMemo(
    () => (location.pathname.includes("/polymarket/live") ? "live" : "paper"),
    [location.pathname]
  );

  const [summary, setSummary] = useState<Summary | null>(null);
  const [positions, setPositions] = useState<PolyPosition[]>([]);
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
        const [sumResp, posResp] = await Promise.all([
          http.get(`/api/poly/summary?mode=${mode}`),
          http.get(`/api/poly/positions?mode=${mode}&limit=500`),
        ]);
        setSummary(sumResp.data);
        setPositions(posResp.data?.rows ?? []);
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
            assets={[...new Set(summary.recentTrades.map((t: any) => t.asset))].sort()}
            strategies={[...new Set(summary.recentTrades.map((t: any) => t.strategy))].sort()}
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
            const posTrades = positions
              .filter((p) => p.result !== null)
              .map((p, idx) => polyPositionToTrade(p, idx + 1));

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

            const filteredFills = summary.recentTrades.filter((t: any) => {
              if (filters.asset !== "all" && t.asset !== filters.asset) return false;
              if (filters.direction !== "all" && t.direction !== filters.direction) return false;
              if (filters.strategy !== "all" && t.strategy !== filters.strategy) return false;
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
              <div style={{ opacity: 0.7 }}>Trades (fills)</div>
              <div style={{ fontSize: 28, fontWeight: 700 }}>{tileTrades}</div>
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
            <h3 style={{ marginTop: 0 }}>Recent trades</h3>
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
                  <TH>exit</TH>
                  <TH>result</TH>
                  <TH>pnl</TH>
                  <TH>max_payout</TH>
                </tr>
              </thead>
              <tbody>
                {groupedFills.map((t: any, i: number) => (
                  <TR key={t.key ?? i}>
                    <TD>{t.ts_open}</TD>
                    <TD>{t.mode}</TD>
                    <TD>{t.asset}</TD>
                    <TD>{t.direction}</TD>
                    <TD>{t.strategy}</TD>
                    <TD>{t.entry_price ?? ""}</TD>
                    <TD>{""}</TD>
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
