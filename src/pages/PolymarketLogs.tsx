import { useEffect, useMemo, useState } from "react";
import http from "../services/http";
import styled from "styled-components";
import { colorScheme } from "../assets/themes";

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

export default function PolymarketLogs() {
  const [name, setName] = useState<string>("live_executor");
  const [minutes, setMinutes] = useState<number>(15);
  const [maxLines, setMaxLines] = useState<number>(1200);
  const [resp, setResp] = useState<TailResp | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const fetchTail = async () => {
    try {
      setLoading(true);
      setError(null);
      const r = await http.get(`/api/poly/logs/tail?name=${encodeURIComponent(name)}&minutes=${minutes}&maxLines=${maxLines}`);
      setResp(r.data);
    } catch (e: any) {
      setError(e?.message || "Failed to load logs");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTail();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
            <option value="live_executor">live_executor</option>
            <option value="paper_zoo_daemon">paper_zoo_daemon</option>
            <option value="ingest">ingest</option>
          </Select>
        </label>

        <label>
          Minutes:&nbsp;
          <Input type="number" min={1} max={60} value={minutes} onChange={(e) => setMinutes(Number(e.target.value))} />
        </label>

        <label>
          Max lines:&nbsp;
          <Input type="number" min={50} max={5000} value={maxLines} onChange={(e) => setMaxLines(Number(e.target.value))} />
        </label>

        <Button onClick={fetchTail} disabled={loading}>
          {loading ? "Loading…" : "Refresh"}
        </Button>

        {resp?.filePath && (
          <div style={{ fontSize: 12, opacity: 0.7 }}>
            source: <span style={{ fontFamily: "monospace" }}>{resp.filePath}</span>
          </div>
        )}
      </Controls>

      <Panel>{text || "(no lines)"}</Panel>
    </Container>
  );
}
