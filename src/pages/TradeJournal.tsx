// TradeJournal.tsx
// External Libraries
import React, { useState, useEffect } from "react";
import { Grid, SelectChangeEvent } from "@mui/material";
// Internal Utilities / Assets / Themes
import http from "../services/http";
import { convertToTimeZone } from "../utils/dates";
// Components
import Error from "../components/Error";
import Loading from "../components/Loading";
import ClosedTradeTable from "../components/ClosedTradeTable/ClosedTradeTable";
import TradeStatistics from "../components/Statistics/Statistics";
import Charts from "../components/Charts/Chart";
import TradeManagement from "../components/TradeManagement/TradeManagement";
import TransactionHistory from "../components/TransactionHistory";
import ModeSelection from "../components/ModeSelection";
import WinLossPieChart from "../components/Charts/WinLossPieChart";
import ComparisonChart from "../components/Charts/ComparisonBarChart";
// Types and Interfaces
import { Trade } from "../models/TradeTypes";
// Context
import { useAuth } from "../auth/AuthContext";

interface TradeJournalProps {
  selectedAccount: number | null;
  conversionRates: Record<string, number>;
}

const TradeJournal: React.FC<TradeJournalProps> = ({
  selectedAccount,
  conversionRates,
}) => {
  const [trades, setTrades] = useState<Trade[]>([]);
  const [accountFilteredTrades, setFilteredTrades] = useState<Trade[]>([]);
  const [triggerFetch, setTriggerFetch] = useState(false);

  // Comparison Mode State
  const [comparisonMode, setComparisonMode] = useState<string>("$");
  const handleComparisonModeChange = (event: SelectChangeEvent<string>) => {
    setComparisonMode(event.target.value);
  };

  // Error and loading states
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Get auth token
  const { auth } = useAuth();

  // UseEffect for getting trades from API
  useEffect(() => {
    const fetchTrades = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await http.get("/api/trades");
        // Convert date fields to the desired time zone
        const timeZone = process.env.REACT_APP_TIMEZONE || "UTC";
        const convertedTrades = response.data.map((trade: Trade) => {
          if (trade.datetimeIn) {
            trade.datetimeIn = convertToTimeZone(trade.datetimeIn, timeZone);
          }
          if (trade.datetimeOut) {
            trade.datetimeOut = convertToTimeZone(trade.datetimeOut, timeZone);
          }
          return trade;
        });
        setTrades(convertedTrades);
        setError(null);
      } catch (error: any) {
        console.log(error);
        setIsLoading(false);
        setError(error.message);
      }
    };
    fetchTrades();
  }, [triggerFetch]);

  // UseEffect for filtering trades based on the selected account
  useEffect(() => {
    const filterTradesByAccount = () => {
      if (selectedAccount) {
        const filtered = trades.filter(
          (trade) => trade.accountID === selectedAccount,
        );
        setFilteredTrades(filtered);
      } else {
        // Otherwise just filter by the filter account
        // *** DEFAULT ACCOUNT WHEN NOT LOGGED IN
        const filtered = trades.filter(
          (trade) => trade.accountID === 3,
        );
        setFilteredTrades(filtered);
      }
    };

    filterTradesByAccount();
  }, [trades, selectedAccount]); // This effect runs when 'trades' or 'selectedAccount' changes

  //  Get list of closed trades, most recent, and first open trade if any
  const closedTrades = accountFilteredTrades
    .filter((trade) => trade.status === "Closed")
    .sort((a, b) => b.id - a.id) as Trade[];

  const mostRecentTrade: Trade | null =
    closedTrades.length > 0 ? closedTrades[0] : null;
  const firstOpenTrade = accountFilteredTrades.find(
    (trade) => trade.status === "Open",
  );

  return (
    <div>
      {/* Loading and Error Components */}
      {isLoading && <Loading />}
      {error && <Error message={error} />}

      <div style={{ display: "flex" }}>
        <div style={{ flex: 4 }}>
          <TradeManagement
            conversionRates={conversionRates}
            firstOpenTrade={firstOpenTrade}
            triggerTradeFetch={() => setTriggerFetch(!triggerFetch)}
            mostRecentTrade={mostRecentTrade}
          />
        </div>
        <div style={{ flex: 1 }}>
          {auth.isAuthenticated ? <TransactionHistory /> : <div></div>}
        </div>
      </div>

      {closedTrades.length !== 0 ? (
        <>
          <Grid container>
            {/* Trade Statistics Matrix */}
            <Grid item xs={9} style={{ display: "flex", alignItems: "center" }}>
              <TradeStatistics closedTrades={closedTrades} />
            </Grid>
            <Grid
              item
              xs={3}
              style={{
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
              }}
            >
              {/* Win Loss Pie and Comparison Charts */}
              <h3>Win Loss %</h3>
              <WinLossPieChart trades={closedTrades} />
              <h3>
                Win/Loss Comparison (
                <ModeSelection
                  comparisonMode={comparisonMode}
                  handleComparisonModeChange={handleComparisonModeChange}
                />
                )
              </h3>
              <ComparisonChart trades={closedTrades} mode={comparisonMode} />
            </Grid>
          </Grid>

          {/* Performance Charts */}
          <Charts closedTrades={closedTrades} />
          {/* Closed Trade Table */}
          <ClosedTradeTable trades={closedTrades} />
        </>
      ) : (
        <div></div>
      )}
    </div>
  );
};

export default TradeJournal;
