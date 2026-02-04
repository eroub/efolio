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

type Row = {
  strategy: string;
  mode: string;
  n: number;
  wins: number;
  losses: number;
  avg_entry: number;
  pnl_usd: number;
};

export default function PolymarketStrategies() {
  const [rows, setRows] = useState<Row[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const run = async () => {
      try {
        const mode = window.location.pathname.includes("/polymarket/live") ? "live" : "paper";
        const resp = await axios.get(`/api/poly/performance/strategies?mode=${mode}`);
        setRows(resp.data.rows || []);
      } catch (e: any) {
        setError(e?.message || "Failed to load");
      }
    };
    run();
  }, []);

  return (
    <Container>
      <h2 style={{ marginTop: 0 }}>Polymarket — Strategy performance (paper)</h2>
      {error && <div style={{ color: "crimson" }}>{error}</div>}
      <Table>
        <thead>
          <tr>
            <TH>strategy</TH>
            <TH>mode</TH>
            <TH>n</TH>
            <TH>wins</TH>
            <TH>losses</TH>
            <TH>avg_entry</TH>
            <TH>pnl_usd</TH>
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <TR key={i}>
              <TD>{r.strategy}</TD>
              <TD>{r.mode}</TD>
              <TD>{r.n}</TD>
              <TD>{r.wins}</TD>
              <TD>{r.losses}</TD>
              <TD>{r.avg_entry}</TD>
              <TD>{r.pnl_usd}</TD>
            </TR>
          ))}
        </tbody>
      </Table>
    </Container>
  );
}
