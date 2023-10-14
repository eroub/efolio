// TradeJournal.tsx
// External Libraries
import React, { useState, useEffect } from "react";
// Internal Utilities / Assets / Themes
import http from "../services/http";
import { fetchExchangeRates } from "../utils/fetchExchangeRates";
import { convertToMST } from "../utils/dates";
// Components
import Error from "../components/Error";
import Loading from "../components/Loading";
import ClosedTradeTable from "../components/ClosedTradeTable/ClosedTradeTable";
import TradeStatistics from "../components/Statistics/Statistics";
import Charts from "../components/Charts/Chart";
import TradeManagement from "../components/TradeManagement/TradeManagement";
// Types and Interfaces
import { Trade, PartialTrade } from "../models/TradeTypes";
// Context
import { useAuth } from "../auth/AuthContext";

const TradeJournal: React.FC = () => {
  // Authentication State
  const { auth, getEncodedCredentials } = useAuth();
  const encodedCredentials = getEncodedCredentials();
  // Trades
  const [trades, setTrades] = useState<Trade[]>([]);
  const [initTrade, setInitTrade] = useState<PartialTrade[]>([]);
  const [triggerFetch, setTriggerFetch] = useState(false);
  // Conversion Rates
  const [conversionRates, setConversionRates] = useState<
    Record<string, number>
  >({});
  // Error / Loading States
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);

  // Fetch trades from the server
  useEffect(() => {
    const fetchTrades = async () => {
      // Error / Loading States
      setIsLoading(true);
      setIsError(false);
      try {
        const response = await http.get("/api/trades");
        setTrades(response.data);
        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching trades", error);
        setIsLoading(false);
        setIsError(true);
      }
    };
    fetchTrades();
  }, [triggerFetch]);

  // Function for calling use effect to fetch trades
  const closeTradeSubmit = () => {
    setTriggerFetch(!triggerFetch);
  };

  // Add new trade
  const addInitialTrade = async (newTrade: PartialTrade) => {
    setInitTrade([...initTrade, newTrade]);
    // Error / Loading States
    setIsLoading(true);
    setIsError(false);
    try {
      if (newTrade.datetimeIn) {
        newTrade.datetimeIn = convertToMST(newTrade.datetimeIn);
      }
      const response = await http.post("/api/trades", newTrade, {
        headers: { Authorization: `Basic ${encodedCredentials}` },
      });
      // Update local state with the new trade
      setTrades([...trades, response.data]);
      setIsLoading(false);
    } catch (error) {
      console.error("Error submitting trade", error);
      setIsLoading(false);
      setIsError(true);
    }
  };

  useEffect(() => {
    const getRates = async () => {
      try {
        const rates = await fetchExchangeRates();
        setConversionRates(rates);
      } catch (error) {
        console.error(error);
      }
    };
    getRates();
  }, []);

  // Filter out the trades that have a status of "Closed"
  const firstOpenTrade = trades.find((trade) => trade.status === "Open");
  // Filter out the trades that have a status of "Open" (sort in by most recent trades)
  const closedTrades = trades
    .filter((trade) => trade.status === "Closed")
    .sort((a, b) => b.id - a.id);

  return (
    <div>
      {/* Loading and Error Components */}
      {isLoading ? <Loading /> : null}
      {isError ? <Error message="An error occurred" /> : null}

      <TradeManagement
        conversionRates={conversionRates}
        isAuthenticated={auth.isAuthenticated}
        firstOpenTrade={firstOpenTrade}
        addInitialTrade={addInitialTrade}
        completedTrade={closeTradeSubmit}
      />

      {/* Closed Trade Table */}
      <ClosedTradeTable trades={closedTrades} />
      {/* Trade Statistics Matrix */}
      <TradeStatistics closedTrades={closedTrades} />
      {/* Performance Charts */}
      <Charts closedTrades={closedTrades} />
    </div>
  );
};

export default TradeJournal;
