// TradeJournal.tsx
// External Libraries
import React, { useState, useEffect } from "react";
// Internal Utilities / Assets / Themes
import http from "../services/http";
import { fetchExchangeRates } from "../utils/fetchExchangeRates";
// Components
import Error from "../components/Error";
import Loading from "../components/Loading";
import ClosedTradeTable from "../components/ClosedTradeTable/ClosedTradeTable";
import TradeStatistics from "../components/Statistics/Statistics";
import Charts from "../components/Charts/Chart";
import TradeManagement from "../components/TradeManagement/TradeManagement";
// Types and Interfaces
import { Trade } from "../models/TradeTypes";

const TradeJournal: React.FC = () => {
  const [trades, setTrades] = useState<Trade[]>([]);
  const [triggerFetch, setTriggerFetch] = useState(false);
  const [conversionRates, setConversionRates] = useState<
    Record<string, number>
  >({});
  // Error and loading states
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // UseEffect for getting trades from API
  useEffect(() => {
    const fetchTrades = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await http.get("/api/trades");
        setTrades(response.data);
        setError(null);
      } catch (error: any) {
        setIsLoading(false);
        setError(error.message);
      }
    };
    fetchTrades();
  }, [triggerFetch]);

  // UseEffect for getting conversion rates from external API
  useEffect(() => {
    const getRates = async () => {
      setError(null);
      try {
        const rates = await fetchExchangeRates();
        setConversionRates(rates);
        setError(null);
      } catch (error: any) {
        setError(error.message);
      }
    };
    getRates();
  }, []);

  //  Get list of closed trades, most recent, and first open trade if any
  const closedTrades = trades
    .filter((trade) => trade.status === "Closed")
    .sort((a, b) => b.id - a.id) as Trade[];
  const mostRecentTrade: Trade | null =
    closedTrades.length > 0 ? closedTrades[0] : null;
  const firstOpenTrade = trades.find((trade) => trade.status === "Open");

  return (
    <div>
      {/* Loading and Error Components */}
      {isLoading && <Loading />}
      {error && <Error message={error} />}

      <TradeManagement
        conversionRates={conversionRates}
        firstOpenTrade={firstOpenTrade}
        triggerTradeFetch={() => setTriggerFetch(!triggerFetch)}
        mostRecentTrade={mostRecentTrade}
      />

      {closedTrades.length !== 0 ? (
        <>
          {/* Closed Trade Table */}
          <ClosedTradeTable trades={closedTrades} />
          {/* Trade Statistics Matrix */}
          <TradeStatistics closedTrades={closedTrades} />
          {/* Performance Charts */}
          <Charts closedTrades={closedTrades} />
        </>
      ) : (
        <div></div>
      )}
    </div>
  );
};

export default TradeJournal;
