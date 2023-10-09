import React from "react";
import { Trade } from "../../../models/TradeTypes";
import { Card, CardContent, Typography } from "@mui/material";
// Import function to convert datetime object
import { humanReadFormatDate } from "../../../utils/dates";
// Format currency
import { formatCurrency } from "../../../utils/formatters";

type SummarySectionProps = {
  openTrade: Trade;
};

export const SummarySection: React.FC<SummarySectionProps> = ({
  openTrade,
}) => {
  let trade = openTrade;
  return (
    <Card>
      <CardContent>
        <Typography variant="h6">Trade ID: {trade.id}</Typography>
        <Typography>Equity: {formatCurrency(trade.equity)}</Typography>
        <Typography>
          DateTime In: {humanReadFormatDate(trade.datetimeIn)}
        </Typography>
        <Typography>Direction: {trade.direction}</Typography>
        <Typography>Ticker: {trade.ticker}</Typography>
        <Typography>Type: {trade.type}</Typography>
      </CardContent>
    </Card>
  );
};
