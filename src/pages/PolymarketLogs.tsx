import { useEffect, useMemo, useRef, useState } from "react";
import http from "../services/http";
import styled from "styled-components";
import { colorScheme } from "../assets/themes";
import CopytradeCompareTable, { CompareRow as CompareRowUI } from "../components/CopytradeCompareTable";

const Container = styled.div`
  padding: 24px;
  text-align: left;
  color: ${colorScheme.base["900"]};
`;

const H2 = styled.h2`
  margin-top: 0;
`;

const Controls = styled.div`
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  align-items: center;
  margin-bottom: 12px;
`;

const Select = styled.select`
  padding: 6px 8px;
  border: 1px solid ${colorScheme.base["200"]};
  border-radius: 6px;
  background: white;
`;

const Input = styled.input`
  padding: 6px 8px;
  border: 1px solid ${colorScheme.base["200"]};
  border-radius: 6px;
  background: white;
  width: 120px;
`;

const Button = styled.button`
  padding: 7px 10px;
  border: 1px solid ${colorScheme.base["300"]};
  border-radius: 8px;
  background: ${colorScheme.base["50"]};
  cursor: pointer;

  &:hover {
    background: ${colorScheme.base["100"]};
  }
`;

const Panel = styled.div`
  border: 1px solid ${colorScheme.base["200"]};
  background: #0b1020;
  color: #e7e9ee;
  border-radius: 10px;
  padding: 12px;
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
  font-size: 12px;
  line-height: 1.4;
  white-space: pre-wrap;
  word-break: break-word;
  max-height: 70vh;
  overflow: auto;
`;

type TailResp = {
  name: string;
  filePath: string;
  minutes: number;
  lines: string[];
};

type CopySignal = {
  ingested_at: string;
  tx: string;
  block: number;
  maker: string;
  taker: string;
  side: string;
  token_id: string;
  market_title?: string | null;
  market_outcome?: string | null;
  market_slug?: string | null;
  market_tf?: string | null;
  leader_price: number;
  leader_tokens: number;
  leader_usdc: number;
  would_enter_usd: number;
};

type CopySignalsResp = {
  minutes: number;
  filePath: string;
  signals: CopySignal[];
};

type LeaderActivityRow = {
  proxyWallet?: string;
  timestamp: number;
  conditionId?: string;
  type: string;
  size?: number;
  usdcSize?: number;
  transactionHash?: string;
  price?: number;
  asset?: string;
  side?: string;
  outcomeIndex?: number;
  title?: string;
  slug?: string;
  eventSlug?: string;
  outcome?: string;
};

type LeaderActivityResp = {
  minutes?: number;
  summary?: {
    total: number;
    copied: number;
    skipped: number;
    unknown: number;
    copy_rate: number | null;
    reasons: Record<string, number>;
    dpx_avg: number | null;
    dpx_abs_avg: number | null;
  };
  rows: CompareRowUI[];
};

type CopyHealthResp = {
  heartbeat: { ts: number; pid: number; ok: boolean; err: string | null; head_block?: number | null } | null;
  metrics: { blocks_processed?: number; exchange_filldetail_logs?: number; leader_fill_logs?: number; ts?: number } | null;
  lastSignal: string | null;
};

type CopyRiskResp = {
  equity_usd: number;
  params_pct: {
    clip_usd: number;
    max_active_pct: number;
    max_per_asset_pct: number;
    max_per_window_pct: number;
  };
  params_usd: {
    clip_usd: number;
    max_active_usd: number;
    max_per_asset_usd: number;
    max_per_window_usd: number;
  };
  descriptions: Record<string, string>;
  exposures: {
    active_usd: number;
    by_asset: Record<string, number>;
    by_window: Record<string, number>;
    updated_at: string | null;
  };
  circuit_breaker: { tripped: boolean; reason?: string | null; details?: any; tripped_at?: string | null };
};

export default function PolymarketLogs() {
  const [name, setName] = useState<string>("copytrade_live_orders");
  const [minutes, setMinutes] = useState<number>(60);
  const [maxLines, setMaxLines] = useState<number>(1200);
  const [from, setFrom] = useState<string>("");
  const [to, setTo] = useState<string>("");
  const [resp, setResp] = useState<TailResp | null>(null);
  const [copyResp, setCopyResp] = useState<CopySignalsResp | null>(null);
  const [copyHealth, setCopyHealth] = useState<CopyHealthResp | null>(null);
  const [copyRisk, setCopyRisk] = useState<CopyRiskResp | null>(null);
  const [leaderResp, setLeaderResp] = useState<LeaderActivityResp | null>(null);
  const [copiedResp, setCopiedResp] = useState<LeaderActivityResp | null>(null);
  const [compareShow, setCompareShow] = useState<string>("all");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [autoRefresh, setAutoRefresh] = useState<boolean>(true);
  const refreshTimerRef = useRef<number | null>(null);
  const inFlightRef = useRef<boolean>(false);


  const fetchCopySignals = async () => {
    try {
      const qs = new URLSearchParams({ minutes: String(minutes) });
      const r = await http.get(`/api/poly/copytrade/signals?${qs.toString()}`);
      setCopyResp(r.data);
    } catch {
      // don't hard-fail logs view if copy signals fail
      setCopyResp(null);
    }
  };

  const fetchLeaderActivity = async () => {
    // Always fetch both:
    // - leader universe view (/compare) for All/SKIPPED filters
    // - copied fills view (/compare/copied) for COPIED-only
    try {
      const qsLeader = new URLSearchParams({ limit: "300", minutes: String(minutes) } as any);
      const rLeader = await http.get(`/api/poly/copytrade/compare?${qsLeader.toString()}`);
      setLeaderResp(rLeader.data);
    } catch {
      setLeaderResp(null);
    }

    try {
      const qsCopied = new URLSearchParams({ limit: "50" } as any);
      const rCopied = await http.get(`/api/poly/copytrade/compare/copied?${qsCopied.toString()}`);
      setCopiedResp(rCopied.data);
    } catch {
      setCopiedResp(null);
    }
  };

  const fetchCopyHealth = async () => {
    try {
      const r = await http.get(`/api/poly/copytrade/health`);
      setCopyHealth(r.data);
    } catch {
      setCopyHealth(null);
    }
  };

  const fetchCopyRisk = async () => {
    try {
      // For now equity_usd is a backend default (99). We'll wire a real equity source next.
      const r = await http.get(`/api/poly/copytrade/risk`);
      setCopyRisk(r.data);
    } catch {
      setCopyRisk(null);
    }
  };

  const fetchTail = async () => {
    try {
      setLoading(true);
      setError(null);
      const qs = new URLSearchParams({
        name,
        minutes: String(minutes),
        maxLines: String(maxLines),
      });
      if (from) qs.set("from", new Date(from).toISOString());
      if (to) qs.set("to", new Date(to).toISOString());
      const r = await http.get(`/api/poly/logs/tail?${qs.toString()}`);
      setResp(r.data);
    } catch (e: any) {
      setError(e?.message || "Failed to load logs");
    } finally {
      setLoading(false);
    }
  };

  const refreshAll = async () => {
    if (inFlightRef.current) return;
    inFlightRef.current = true;
    try {
      await fetchTail();
      await fetchCopySignals();
      await fetchCopyHealth();
      await fetchCopyRisk();
      await fetchLeaderActivity();
    } finally {
      inFlightRef.current = false;
    }
  };

  useEffect(() => {
    refreshAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (refreshTimerRef.current) {
      window.clearInterval(refreshTimerRef.current);
      refreshTimerRef.current = null;
    }

    if (!autoRefresh) return;

    refreshTimerRef.current = window.setInterval(() => {
      // Best-effort: skip if a refresh is already in flight
      refreshAll();
    }, 15_000);

    return () => {
      if (refreshTimerRef.current) {
        window.clearInterval(refreshTimerRef.current);
        refreshTimerRef.current = null;
      }
    };
    // We intentionally do NOT depend on minutes/from/to/etc: auto-refresh should
    // re-use current state via refreshAll() and avoid timer churn.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoRefresh]);

  const text = useMemo(() => {
    if (!resp) return "";
    return (resp.lines || []).join("\n");
  }, [resp]);

  return (
    <Container>
      <H2>Polymarket — Prod Logs (last {minutes}m)</H2>
      {error && <div style={{ color: "crimson", marginBottom: 10 }}>{error}</div>}

      <Controls>
        <label>
          Log:&nbsp;
          <Select value={name} onChange={(e) => setName(e.target.value)}>
            <option value="copytrade_live_orders">copytrade_live_orders</option>
            <option value="copytrade_matched_fills">copytrade_matched_fills</option>
            <option value="copytrade_leader_fills">copytrade_leader_fills</option>
            <option value="claim_daemon">claim_daemon</option>
            {/* legacy logs removed */}
          </Select>
        </label>

        <label>
          Minutes:&nbsp;
          <Input type="number" min={1} max={60} value={minutes} onChange={(e) => setMinutes(Number(e.target.value))} />
        </label>

        <label>
          From:&nbsp;
          <Input type="datetime-local" value={from} onChange={(e) => setFrom(e.target.value)} style={{ width: 220 }} />
        </label>

        <label>
          To:&nbsp;
          <Input type="datetime-local" value={to} onChange={(e) => setTo(e.target.value)} style={{ width: 220 }} />
        </label>

        <label>
          Max lines:&nbsp;
          <Input type="number" min={50} max={5000} value={maxLines} onChange={(e) => setMaxLines(Number(e.target.value))} />
        </label>

        <div style={{ display: "flex", gap: 8, alignItems: "center", marginLeft: "auto" }}>
          <label style={{ fontSize: 12, opacity: 0.85, display: "flex", gap: 6, alignItems: "center" }}>
            <input type="checkbox" checked={autoRefresh} onChange={(e) => setAutoRefresh(e.target.checked)} />
            auto-refresh (15s)
          </label>

          <Button onClick={refreshAll} disabled={loading}>
            {loading ? "Loading…" : "Refresh"}
          </Button>
        </div>

        {resp?.filePath && (
          <div style={{ fontSize: 12, opacity: 0.7 }}>
            source: <span style={{ fontFamily: "monospace" }}>{resp.filePath}</span>
          </div>
        )}
      </Controls>

      <div style={{ marginBottom: 16 }}>
        <H2 style={{ fontSize: 16, marginBottom: 8 }}>Copytrade Compare (leader → us)</H2>
        <div style={{ fontSize: 12, opacity: 0.8, marginBottom: 8 }}>
          {((compareShow === "copied" ? copiedResp : leaderResp) as any)?.summary ? (
            <>
              <b>last {(((compareShow === "copied" ? copiedResp : leaderResp) as any)?.minutes ?? minutes)}m</b> | total={((compareShow === "copied" ? copiedResp : leaderResp) as any).summary.total} | copied={((compareShow === "copied" ? copiedResp : leaderResp) as any).summary.copied} | skipped={((compareShow === "copied" ? copiedResp : leaderResp) as any).summary.skipped} | unknown={((compareShow === "copied" ? copiedResp : leaderResp) as any).summary.unknown} | copy_rate={((compareShow === "copied" ? copiedResp : leaderResp) as any).summary.copy_rate != null ? (((compareShow === "copied" ? copiedResp : leaderResp) as any).summary.copy_rate * 100).toFixed(1) + "%" : "?"}
              <br />
              reasons: {Object.entries((((compareShow === "copied" ? copiedResp : leaderResp) as any).summary.reasons || {}) as any)
                .sort((a: any, b: any) => b[1] - a[1])
                .slice(0, 8)
                .map(([k, v]: any) => `${k}=${v}`)
                .join(" | ")}
              <br />
              dPx avg={((compareShow === "copied" ? copiedResp : leaderResp) as any).summary.dpx_avg != null ? ((compareShow === "copied" ? copiedResp : leaderResp) as any).summary.dpx_avg.toFixed(4) : "-"} | dPx abs avg={((compareShow === "copied" ? copiedResp : leaderResp) as any).summary.dpx_abs_avg != null ? ((compareShow === "copied" ? copiedResp : leaderResp) as any).summary.dpx_abs_avg.toFixed(4) : "-"}
            </>
          ) : (
            "(no summary yet)"
          )}
        </div>
        <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 10 }}>
          <label style={{ fontSize: 12 }}>
            show:&nbsp;
            <Select value={compareShow} onChange={(e) => setCompareShow(e.target.value)}>
              <option value="copied">COPIED only</option>
              <option value="all">All</option>
              <option value="skipped">SKIPPED only</option>
            </Select>
          </label>
        </div>

        {((compareShow === "copied" ? copiedResp?.rows : leaderResp?.rows) || []).length ? (
          <CopytradeCompareTable
            rows={((compareShow === "copied" ? copiedResp?.rows : leaderResp?.rows) || [])
              .filter((r) => {
                if (compareShow === "all") return true;
                if (compareShow === "copied") return true;
                if (compareShow === "skipped") return r.status === "SKIPPED";
                return true;
              })
              .slice(0, 200)}
          />
        ) : (
          <Panel>(no compare data)</Panel>
        )}
      </div>

      <div style={{ marginBottom: 16 }}>
        <H2 style={{ fontSize: 16, marginBottom: 8 }}>Copytrade (signal-only) — last {minutes}m</H2>
        <div style={{ fontSize: 12, opacity: 0.75, marginBottom: 8 }}>
          {copyResp?.filePath ? (
            <>
              source: <span style={{ fontFamily: "monospace" }}>{copyResp.filePath}</span>
            </>
          ) : (
            "(no copytrade signal source yet)"
          )}
          {copyHealth ? (
            <>
              <br />
              health: ok={String(copyHealth.heartbeat?.ok)} pid={copyHealth.heartbeat?.pid} head={copyHealth.heartbeat?.head_block ?? "?"} | blocks={copyHealth.metrics?.blocks_processed ?? "?"} exchange_logs={copyHealth.metrics?.exchange_filldetail_logs ?? "?"} leader_logs={copyHealth.metrics?.leader_fill_logs ?? "?"} | lastSignal={copyHealth.lastSignal ?? "(none)"}
            </>
          ) : null}

          {copyRisk ? (
            <>
              <br />
              <br />
              <b>Copytrade Risk Params (cap = % of equity)</b>
              <br />
              equity=${copyRisk.equity_usd.toFixed(2)} | active_risk=${Number(copyRisk.exposures?.active_usd || 0).toFixed(2)} | breaker={String(copyRisk.circuit_breaker?.tripped)}
              {copyRisk.circuit_breaker?.tripped ? (
                <>
                  <br />
                  breaker_reason={copyRisk.circuit_breaker?.reason || "?"}
                </>
              ) : null}
              <br />
              clip_usd=${copyRisk.params_usd.clip_usd.toFixed(2)} — {copyRisk.descriptions.clip_usd}
              <br />
              max_active_pct={(copyRisk.params_pct.max_active_pct * 100).toFixed(1)}% (=${copyRisk.params_usd.max_active_usd.toFixed(2)}) — {copyRisk.descriptions.max_active_pct}
              <br />
              max_per_asset_pct={(copyRisk.params_pct.max_per_asset_pct * 100).toFixed(1)}% (=${copyRisk.params_usd.max_per_asset_usd.toFixed(2)}) — {copyRisk.descriptions.max_per_asset_pct}
              <br />
              max_per_window_pct={(copyRisk.params_pct.max_per_window_pct * 100).toFixed(1)}% (=${copyRisk.params_usd.max_per_window_usd.toFixed(2)}) — {copyRisk.descriptions.max_per_window_pct}
            </>
          ) : null}
        </div>
        <Panel>
          {(copyResp?.signals || []).length
            ? (copyResp!.signals || [])
                .map(
                  (s) =>
                    `${s.ingested_at} | ${s.side} ${s.market_title ? s.market_title : `token=${s.token_id}`}${s.market_outcome ? ` (${s.market_outcome})` : ""} leader_px=${Number(s.leader_price).toFixed(4)} leader_tokens=${Number(
                      s.leader_tokens
                    ).toFixed(2)} leader_usdc=${Number(s.leader_usdc).toFixed(2)} | ingest_lag=${s.ingest_lag_ms != null ? `+${(Number(s.ingest_lag_ms)/1000).toFixed(1)}s` : "-"} | would_enter=$${Number(s.would_enter_usd).toFixed(2)}`
                )
                .join("\n")
            : "(no signals)"}
        </Panel>
      </div>

      <Panel>{text || "(no lines)"}</Panel>
    </Container>
  );
}
