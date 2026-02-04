import { useEffect, useMemo, useState } from "react";
import http from "../services/http";
import styled from "styled-components";
import { colorScheme } from "../assets/themes";
import { formatCurrency } from "../utils/formatters";

const Container = styled.div`
  padding: 24px;
  text-align: left;
  color: ${colorScheme.base["900"]};
`;

const H2 = styled.h2`
  margin-top: 0;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  background: white;
  border: 1px solid ${colorScheme.base["200"]};
`;

const TH = styled.th`
  text-align: left;
  padding: 10px 12px;
  border-bottom: 1px solid ${colorScheme.base["200"]};
  position: sticky;
  top: 0;
  background: ${colorScheme.base["50"]};
  z-index: 1;
`;

const TD = styled.td`
  padding: 10px 12px;
  border-bottom: 1px solid ${colorScheme.base["200"]};
`;

const TR = styled.tr`
  &:nth-child(even) {
    background: ${colorScheme.base["50"]};
  }
`;

type ExperimentRow = {
  mode: "paper";
  experiment: string;
  strategy_id: number;
  strategy: string;
  params: Record<string, any>;
  last_seen_ts: string | number;
  trades: number;
  wins: number;
  losses: number;
  winrate: number | null;
  pnl_usd: number;
  avg_entry: number | null;
};

export default function PolymarketExperiments() {
  const [rows, setRows] = useState<ExperimentRow[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const run = async () => {
      try {
        setError(null);
        const resp = await http.get(`/api/poly/experiments?limit=200`);
        setRows(resp.data?.rows ?? []);
      } catch (e: any) {
        setError(e?.message || "Failed to load experiments");
      }
    };
    run();
  }, []);

  const sorted = useMemo(() => {
    return [...rows].sort((a, b) => (b.pnl_usd ?? 0) - (a.pnl_usd ?? 0));
  }, [rows]);

  return (
    <Container>
      <H2>Polymarket — Experiments (Paper)</H2>
      {error && <div style={{ color: "crimson" }}>{error}</div>}

      <div style={{ fontSize: 13, opacity: 0.75, marginBottom: 10 }}>
        Experiments = strategy + parameter snapshot. Performance below is paper-only.
      </div>

      <Table>
        <thead>
          <tr>
            <TH>strategy</TH>
            <TH>params</TH>
            <TH>trades</TH>
            <TH>wins</TH>
            <TH>losses</TH>
            <TH>winrate</TH>
            <TH>pnl</TH>
            <TH>avg_entry</TH>
            <TH>last_seen</TH>
          </tr>
        </thead>
        <tbody>
          {sorted.map((r, i) => (
            <TR key={i}>
              <TD>{r.strategy}</TD>
              <TD style={{ maxWidth: 420, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {JSON.stringify(r.params ?? {})}
              </TD>
              <TD>{r.trades}</TD>
              <TD>{r.wins}</TD>
              <TD>{r.losses}</TD>
              <TD>{r.winrate == null ? "" : `${Math.round(r.winrate * 1000) / 10}%`}</TD>
              <TD>{formatCurrency(r.pnl_usd)}</TD>
              <TD>{r.avg_entry == null ? "" : r.avg_entry.toFixed(4)}</TD>
              <TD>{String(r.last_seen_ts)}</TD>
            </TR>
          ))}
        </tbody>
      </Table>
    </Container>
  );
}
