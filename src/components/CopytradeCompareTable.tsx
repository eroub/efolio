import React from "react";
import styled from "styled-components";
import { colorScheme } from "../assets/themes";

export type CompareRow = {
  // common
  ts?: any;
  market?: any;
  asset?: any;
  token?: any;
  side?: any;
  leader_price?: any;
  our_price?: any;
  dpx?: any;
  fill_lag_ms?: any;
  detect_lag_ms?: any;
  status?: any;
  reason?: any;
};

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  background: ${colorScheme.base.paper};
  color: ${colorScheme.base.black};
  border: 1px solid ${colorScheme.base["200"]};
`;

const TH = styled.th`
  text-align: left;
  border-bottom: 1px solid ${colorScheme.base["300"]};
  padding: 8px 8px;
  background: ${colorScheme.base["100"]};
  color: ${colorScheme.base.black};
  position: sticky;
  top: 0;
`;

const TD = styled.td`
  border-bottom: 1px solid ${colorScheme.base["150"]};
  padding: 8px 8px;
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono",
    "Courier New", monospace;
  font-size: 12px;
  color: ${colorScheme.base.black};
  vertical-align: top;
`;

const TR = styled.tr`
  &:nth-child(even) {
    background: ${colorScheme.base["50"]};
  }
`;

function fmtNum(x: any, digits = 4): string {
  const n = Number(x);
  if (!Number.isFinite(n)) return "";
  return n.toFixed(digits);
}

function fmtMs(x: any): string {
  const n = Number(x);
  if (!Number.isFinite(n)) return "";
  if (Math.abs(n) >= 1000) return `${(n / 1000).toFixed(1)}s`;
  return `${n.toFixed(0)}ms`;
}

export default function CopytradeCompareTable({ rows }: { rows: CompareRow[] }) {
  return (
    <Table>
      <thead>
        <tr>
          <TH>ts</TH>
          <TH>asset</TH>
          <TH>token</TH>
          <TH>side</TH>
          <TH>leader_px</TH>
          <TH>our_px</TH>
          <TH>dPx</TH>
          <TH>fill_lag</TH>
          <TH>status</TH>
          <TH>reason</TH>
        </tr>
      </thead>
      <tbody>
        {(rows || []).map((r: any, i: number) => (
          <TR key={r.id ?? r.key ?? i}>
            <TD>{String(r.ts ?? r.ts_s ?? r.ingested_at ?? "")}</TD>
            <TD>{String(r.asset ?? "")}</TD>
            <TD>{String(r.token ?? r.token_name ?? "")}</TD>
            <TD>{String(r.side ?? "")}</TD>
            <TD>{fmtNum(r.leader_price ?? r.leader_px ?? r.leader_entry ?? r.price)}</TD>
            <TD>{fmtNum(r.our_price ?? r.our_px ?? r.our_entry)}</TD>
            <TD>{fmtNum(r.dpx ?? r.dPx ?? r.delta_px)}</TD>
            <TD title={`detect_lag=${fmtMs(r.detect_lag_ms ?? "")}`}>{fmtMs(r.fill_lag_ms ?? r.fill_lag)}</TD>
            <TD>{String(r.status ?? "")}</TD>
            <TD>{String(r.reason ?? r.outcome ?? "")}</TD>
          </TR>
        ))}
      </tbody>
    </Table>
  );
}
