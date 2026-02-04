import React from "react";
import styled from "styled-components";
import { colorScheme } from "../assets/themes";

const Bar = styled.div`
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  align-items: flex-end;
  margin: 12px 0 18px;
`;

const Group = styled.label`
  display: flex;
  flex-direction: column;
  gap: 6px;
  font-size: 12px;
  color: ${colorScheme.base["700"]};
`;

const Select = styled.select`
  padding: 8px 10px;
  border-radius: 6px;
  border: 1px solid ${colorScheme.base["300"]};
  background: white;
  min-width: 180px;
`;

const Button = styled.button`
  padding: 8px 12px;
  border-radius: 6px;
  border: 1px solid ${colorScheme.base["300"]};
  background: white;
  cursor: pointer;
`;

export type PolyFilterState = {
  asset: string; // "all" | "BTC" | "ETH" | ...
  direction: string; // "all" | "UP" | "DOWN"
  strategy: string; // "all" | strategy name
};

export function PolyFilters({
  assets,
  strategies,
  value,
  onChange,
}: {
  assets: string[];
  strategies: string[];
  value: PolyFilterState;
  onChange: (next: PolyFilterState) => void;
}) {
  return (
    <Bar>
      <Group>
        <span>Asset</span>
        <Select
          value={value.asset}
          onChange={(e) => onChange({ ...value, asset: e.target.value })}
        >
          <option value="all">All</option>
          {assets.map((a) => (
            <option key={a} value={a}>
              {a}
            </option>
          ))}
        </Select>
      </Group>

      <Group>
        <span>Direction</span>
        <Select
          value={value.direction}
          onChange={(e) => onChange({ ...value, direction: e.target.value })}
        >
          <option value="all">All</option>
          <option value="UP">UP</option>
          <option value="DOWN">DOWN</option>
        </Select>
      </Group>

      <Group>
        <span>Strategy</span>
        <Select
          value={value.strategy}
          onChange={(e) => onChange({ ...value, strategy: e.target.value })}
        >
          <option value="all">All</option>
          {strategies.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </Select>
      </Group>

      <Button onClick={() => onChange({ asset: "all", direction: "all", strategy: "all" })}>
        Reset
      </Button>
    </Bar>
  );
}
