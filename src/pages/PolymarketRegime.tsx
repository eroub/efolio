import { useEffect, useState } from "react";
import axios from "axios";
import styled from "styled-components";
import { colorScheme } from "../assets/themes";

const Container = styled.div`
  padding: 24px;
  text-align: left;
  color: ${colorScheme.base["900"]};
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

type Row = {
  btc_regime: string;
  mode: string;
  n: number;
  wins: number;
  pnl_usd: number;
};

export default function PolymarketRegime() {
  const [rows, setRows] = useState<Row[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const run = async () => {
      try {
        const resp = await axios.get(`/api/poly/performance/regime`);
        setRows(resp.data.rows || []);
      } catch (e: any) {
        setError(e?.message || "Failed to load");
      }
    };
    run();
  }, []);

  return (
    <Container>
      <h2 style={{ marginTop: 0 }}>Polymarket — PnL by regime (BTC label)</h2>
      {error && <div style={{ color: "crimson" }}>{error}</div>}
      <Table>
        <thead>
          <tr>
            <TH>btc_regime</TH>
            <TH>mode</TH>
            <TH>n</TH>
            <TH>wins</TH>
            <TH>pnl_usd</TH>
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i}>
              <TD>{r.btc_regime ?? "(null)"}</TD>
              <TD>{r.mode}</TD>
              <TD>{r.n}</TD>
              <TD>{r.wins}</TD>
              <TD>{r.pnl_usd}</TD>
            </tr>
          ))}
        </tbody>
      </Table>
    </Container>
  );
}
