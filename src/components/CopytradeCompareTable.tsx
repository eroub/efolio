import React from "react";
import styled from "styled-components";
import { colorScheme } from "../assets/themes";

export type CompareRow = {
  ts?: any;
  slug?: any;
  title?: any;
  market_url?: any;
  status?: any;
  reason?: any;
  reason_detail?: any;

  leader?: {
    ts_ms?: any;
    side?: any;
    price?: any;
    usd?: any;
    tx?: any;
    token_id?: any;
  };
  our?: {
    ts_ms?: any;
    price?: any;
    usd?: any;
    tx?: any;
    order_id?: any;
  };
  attempt?: {
    ts_ms?: any;
    dedupe_key?: any;
    status_code?: any;
  };
  attempt_rich?: {
    ts?: any;
    outcome?: any;
    status_code?: any;
    resp?: any;
    err?: any;
    mirror?: any;
    dedupe_key?: any;
  };

  dpx?: any;
  fill_lag_ms?: any;
  detect_lag_ms?: any;
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

function fmtText(x: any): string {
  if (x == null) return "";
  if (typeof x === "string") return x;
  try {
    return JSON.stringify(x);
  } catch {
    return String(x);
  }
}

export default function CopytradeCompareTable({ rows }: { rows: CompareRow[] }) {
  return (
    <Table>
      <thead>
        <tr>
          <TH>ts</TH>
          <TH>market</TH>
          <TH>token_id</TH>
          <TH>side</TH>
          <TH>leader_px</TH>
          <TH>leader_usd</TH>
          <TH>our_px</TH>
          <TH>our_usd</TH>
          <TH>dPx</TH>
          <TH>fill_lag</TH>
          <TH>status</TH>
          <TH>reason</TH>
          <TH>detail</TH>
        </tr>
      </thead>
      <tbody>
        {(rows || []).map((r: any, i: number) => {
          const leader = r.leader || {};
          const our = r.our || {};

          const marketLabel = String(r.title ?? r.slug ?? "");
          const marketUrl = r.market_url ? String(r.market_url) : "";
          const tokenId = String(leader.token_id ?? "");
          const side = String(leader.side ?? "");

          const detail =
            r.reason_detail ??
            (r.attempt_rich && r.attempt_rich.resp ? r.attempt_rich.resp : null) ??
            (r.attempt_rich && r.attempt_rich.err ? r.attempt_rich.err : null) ??
            "";

          return (
            <TR key={r.id ?? r.key ?? i}>
              <TD>{String(r.ts ?? "")}</TD>
              <TD>
                {marketUrl ? (
                  <a href={marketUrl} target="_blank" rel="noreferrer">
                    {marketLabel}
                  </a>
                ) : (
                  marketLabel
                )}
              </TD>
              <TD>{tokenId}</TD>
              <TD>{side}</TD>
              <TD>{fmtNum(leader.price)}</TD>
              <TD>{fmtNum(leader.usd, 2)}</TD>
              <TD>{fmtNum(our.price)}</TD>
              <TD>{fmtNum(our.usd, 2)}</TD>
              <TD>{fmtNum(r.dpx)}</TD>
              <TD title={`detect_lag=${fmtMs(r.detect_lag_ms ?? "")}`}>{fmtMs(r.fill_lag_ms ?? "")}</TD>
              <TD>{String(r.status ?? "")}</TD>
              <TD>{String(r.reason ?? "")}</TD>
              <TD title={fmtText(detail)}>{fmtText(detail).slice(0, 120)}</TD>
            </TR>
          );
        })}
      </tbody>
    </Table>
  );
}
