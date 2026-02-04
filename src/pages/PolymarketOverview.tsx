import { useEffect, useState } from "react";
import axios from "axios";
import styled from "styled-components";
import { colorScheme } from "../assets/themes";

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
`;

const TH = styled.th`
  text-align: left;
  border-bottom: 1px solid ${colorScheme.base["200"]};
  padding: 8px;
`;

const TD = styled.td`
  border-bottom: 1px solid ${colorScheme.base["100"]};
  padding: 8px;
  font-family: monospace;
  font-size: 12px;
`;

type Summary = {
  counts: { strategies: number; runs: number; trades: number };
  recentTrades: any[];
};

export default function PolymarketOverview() {
  const [summary, setSummary] = useState<Summary | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const run = async () => {
      try {
        const resp = await axios.get(`/api/poly/summary?mode=paper`);
        setSummary(resp.data);
      } catch (e: any) {
        setError(e?.message || "Failed to load");
      }
    };
    run();
  }, []);

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
              <div style={{ opacity: 0.7 }}>Trades</div>
              <div style={{ fontSize: 28, fontWeight: 700 }}>{summary.counts.trades}</div>
            </Card>
          </CardRow>

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
              </tr>
            </thead>
            <tbody>
              {summary.recentTrades.map((t, i) => (
                <tr key={i}>
                  <TD>{t.ts_open}</TD>
                  <TD>{t.mode}</TD>
                  <TD>{t.asset}</TD>
                  <TD>{t.direction}</TD>
                  <TD>{t.strategy}</TD>
                  <TD>{t.entry_price}</TD>
                  <TD>{t.exit_price ?? ""}</TD>
                  <TD>{t.result ?? ""}</TD>
                  <TD>{t.pnl_usd ?? ""}</TD>
                </tr>
              ))}
            </tbody>
          </Table>
        </>
      )}

      {!summary && !error && <div>Loading…</div>}
    </Container>
  );
}
