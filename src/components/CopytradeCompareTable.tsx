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

const TableWrap = styled.div`
  width: 100%;
  overflow-x: auto;
  border: 1px solid ${colorScheme.base["200"]};
  background: ${colorScheme.base.paper};
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  color: ${colorScheme.base.black};
`;

const TH = styled.th`
  text-align: left;
  border-bottom: 1px solid ${colorScheme.base["300"]};
  padding: 8px 10px;
  background: ${colorScheme.base["100"]};
  color: ${colorScheme.base.black};
  position: sticky;
  top: 0;
`;

const TD = styled.td`
  border-bottom: 1px solid ${colorScheme.base["150"]};
  padding: 8px 10px;
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono",
    "Courier New", monospace;
  font-size: 12px;
  color: ${colorScheme.base.black};
  vertical-align: top;
`;

const TDDelta = styled(TD)<{ $v: number | null }>`
  font-weight: 700;
  color: ${(p) => {
    const v = p.$v;
    if (v == null || !Number.isFinite(v)) return colorScheme.base.black;
    if (v > 0) return "#1b5e20";
    if (v < 0) return "#b71c1c";
    return "#333";
  }};
  background: ${(p) => {
    const v = p.$v;
    if (v == null || !Number.isFinite(v)) return "transparent";
    if (v > 0) return "#e8f5e9";
    if (v < 0) return "#ffebee";
    return "#f5f5f5";
  }};
`;

const TDLag = styled(TD)<{ $ms: number | null }>`
  font-weight: 700;
  color: ${(p) => {
    const ms = p.$ms;
    if (ms == null || !Number.isFinite(ms)) return colorScheme.base.black;
    if (ms <= 5000) return "#1b5e20";
    if (ms <= 15000) return "#7a4f00";
    return "#b71c1c";
  }};
  background: ${(p) => {
    const ms = p.$ms;
    if (ms == null || !Number.isFinite(ms)) return "transparent";
    if (ms <= 5000) return "#e8f5e9";
    if (ms <= 15000) return "#fff8e1";
    return "#ffebee";
  }};
`;

const TR = styled.tr`
  &:nth-child(even) {
    background: ${colorScheme.base["50"]};
  }
`;

const MarketCell = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 340px;
`;

const OpenLink = styled.a`
  font-size: 11px;
  opacity: 0.8;
  text-decoration: underline;
`;

const Badge = styled.span<{ $kind: string }>`
  display: inline-block;
  padding: 2px 8px;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.02em;
  border: 1px solid ${colorScheme.base["300"]};
  background: ${(p) => {
    const k = p.$kind;
    if (k === "COPIED") return "#e8f5e9";
    if (k === "SKIPPED") return "#fff8e1";
    if (k === "UNKNOWN") return "#ffebee";
    return colorScheme.base["100"];
  }};
  color: ${(p) => {
    const k = p.$kind;
    if (k === "COPIED") return "#1b5e20";
    if (k === "SKIPPED") return "#7a4f00";
    if (k === "UNKNOWN") return "#b71c1c";
    return colorScheme.base.black;
  }};
`;

function fmtNum(x: any, digits = 4): string {
  const n = Number(x);
  if (!Number.isFinite(n)) return "—";
  return n.toFixed(digits);
}

function fmtUsd(x: any): string {
  const n = Number(x);
  if (!Number.isFinite(n)) return "—";
  return `$${n.toFixed(2)}`;
}

function fmtMs(x: any): string {
  const n = Number(x);
  if (!Number.isFinite(n)) return "—";
  if (Math.abs(n) >= 1000) return `${(n / 1000).toFixed(1)}s`;
  return `${n.toFixed(0)}ms`;
}

function fillLagMsForRow(r: any): number | null {
  // Fill lag should mean: leader fill time -> our fill time.
  // If we didn't fill (SKIPPED/UNKNOWN), show null (render as —).
  const status = String(r?.status ?? "");
  if (status !== "COPIED") return null;
  const ms = Number(r?.fill_lag_ms);
  return Number.isFinite(ms) ? ms : null;
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

function fmtLeaderCell(leader: any): string {
  const side = String(leader?.side ?? "");
  const usd = fmtUsd(leader?.usd);
  const px = leader?.price == null ? "—" : Number(leader.price).toFixed(4);
  return `${side} ${usd} @ ${px}`.trim();
}

function fmtUsCell(our: any): string {
  if (!our || (our.price == null && our.usd == null)) return "—";
  const usd = fmtUsd(our?.usd);
  const px = our?.price == null ? "—" : Number(our.price).toFixed(4);
  return `${usd} @ ${px}`;
}

export default function CopytradeCompareTable({ rows }: { rows: CompareRow[] }) {
  return (
    <TableWrap>
      <Table>
        <thead>
          <tr>
            <TH style={{ minWidth: 160 }}>Time</TH>
            <TH>Market</TH>
            <TH style={{ minWidth: 170 }}>Leader</TH>
            <TH style={{ minWidth: 110 }}>Status</TH>
            <TH style={{ minWidth: 160 }}>Us</TH>
            <TH style={{ minWidth: 90 }}>Fill Lag</TH>
            <TH style={{ minWidth: 80 }}>ΔPx</TH>
            <TH style={{ minWidth: 200 }}>Reason</TH>
          </tr>
        </thead>
        <tbody>
          {(rows || []).map((r: any, i: number) => {
            const leader = r.leader || {};
            const our = r.our || {};

            const marketLabel = String(r.title ?? r.slug ?? "");
            const marketUrl = r.market_url ? String(r.market_url) : "";

            const status = String(r.status ?? "");
            const reason = String(r.reason ?? "");
            const detail =
              r.reason_detail ??
              (r.attempt_rich && r.attempt_rich.resp ? r.attempt_rich.resp : null) ??
              (r.attempt_rich && r.attempt_rich.err ? r.attempt_rich.err : null) ??
              "";

            const reasonText = detail ? `${reason} — ${fmtText(detail)}` : reason;

            return (
              <TR key={r.id ?? r.key ?? i}>
                <TD>{String(r.ts ?? "")}</TD>
                <TD>
                  <MarketCell>
                    {marketUrl ? (
                      <a href={marketUrl} target="_blank" rel="noreferrer">
                        {marketLabel}
                      </a>
                    ) : (
                      <span>{marketLabel}</span>
                    )}
                    {marketUrl ? (
                      <OpenLink href={marketUrl} target="_blank" rel="noreferrer">
                        open
                      </OpenLink>
                    ) : null}
                  </MarketCell>
                </TD>
                <TD>{fmtLeaderCell(leader)}</TD>
                <TD>
                  <Badge $kind={status || ""}>{status || "—"}</Badge>
                </TD>
                <TD>{fmtUsCell(our)}</TD>
                <TDLag
                  $ms={fillLagMsForRow(r)}
                  title={`detect_lag=${fmtMs(r.detect_lag_ms ?? "")}`}
                >
                  {fmtMs(fillLagMsForRow(r))}
                </TDLag>
                <TDDelta $v={r.dpx == null ? null : Number(r.dpx)}>{r.dpx == null ? "—" : fmtNum(r.dpx)}</TDDelta>
                <TD title={reasonText}>{reasonText}</TD>
              </TR>
            );
          })}
        </tbody>
      </Table>
    </TableWrap>
  );
}
