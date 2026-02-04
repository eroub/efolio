import { useEffect, useMemo, useState } from "react";
import http from "../services/http";
import { useLocation } from "react-router-dom";
import styled from "styled-components";
import { colorScheme } from "../assets/themes";
import TradeStatistics from "../components/Statistics/Statistics";
import { PolyPosition } from "../models/PolyTypes";
import { polyPositionToTrade } from "../utils/polyPositionToTrade";

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
  const [statsOpen, setStatsOpen] = useState<boolean>(false);
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

  return (
    <Container>
      <H2>Polymarket — Overview</H2>
      {error && <div style={{ color: "crimson" }}>{error}</div>}

      {summary && (
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
              <div style={{ fontSize: 28, fontWeight: 700 }}>{summary.counts.trades}</div>
            </Card>
            <Card>
              <div style={{ opacity: 0.7 }}>Positions</div>
              <div style={{ fontSize: 28, fontWeight: 700 }}>{summary.counts.positions ?? ""}</div>
            </Card>
            <Card>
              <div style={{ opacity: 0.7 }}>P/L (positions)</div>
              <div style={{ fontSize: 28, fontWeight: 700 }}>{summary.positions?.pnl_usd ?? ""}</div>
            </Card>
          </CardRow>

          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <h3 style={{ marginTop: 0 }}>Trade Statistics</h3>
            <button
              onClick={() => setStatsOpen(!statsOpen)}
              style={{
                padding: "6px 10px",
                borderRadius: 6,
                border: `1px solid ${colorScheme.base["300"]}`,
                background: "white",
                cursor: "pointer",
              }}
            >
              {statsOpen ? "Hide" : "Show"}
            </button>
          </div>

          {statsOpen && (
            <div style={{ marginBottom: 16 }}>
              <TradeStatistics
                closedTrades={positions
                  .filter((p) => p.result !== null)
                  .map((p, idx) => polyPositionToTrade(p, idx + 1))}
              />
            </div>
          )}

          <h3 style={{ marginTop: 0 }}>Recent trades</h3>

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
              {summary.recentTrades.map((t, i) => (
                <TR key={i}>
                  <TD>{t.ts_open}</TD>
                  <TD>{t.mode}</TD>
                  <TD>{t.asset}</TD>
                  <TD>{t.direction}</TD>
                  <TD>{t.strategy}</TD>
                  <TD>{t.entry_price}</TD>
                  <TD>{t.exit_price ?? ""}</TD>
                  <TD>{t.settled_result ?? t.result ?? ""}</TD>
                  <TD>{t.settled_pnl_usd ?? t.pnl_usd ?? ""}</TD>
                  <TD>{t.implied_pnl_usd ?? ""}</TD>
                </TR>
              ))}
            </tbody>
          </Table>
        </>
      )}

      {!summary && !error && <div>Loading…</div>}
    </Container>
  );
}
