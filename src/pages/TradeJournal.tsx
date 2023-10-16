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
// Context
import { useAuth } from "../auth/AuthContext";

const TradeJournal: React.FC = () => {
  const { auth } = useAuth();
  const [trades, setTrades] = useState<Trade[]>([]);
  const [triggerFetch, setTriggerFetch] = useState(false);
  const [conversionRates, setConversionRates] = useState<
    Record<string, number>
  >({});
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);

  const fetchTrades = async () => {
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

  const closeTradeSubmit = () => {
    setTriggerFetch(!triggerFetch);
  };

  useEffect(() => {
    fetchTrades();
  }, [triggerFetch]);

  useEffect(() => {
    const getRates = async () => {
      try {
        const rates = await fetchExchangeRates();
        setConversionRates(rates);
      } catch (error) {
        console.error("Error fetching exchange rates", error);
      }
    };
    getRates();
  }, []);

  const firstOpenTrade = trades.find((trade) => trade.status === "Open");
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
        completedTrades={closeTradeSubmit}
        triggerTradeFetch={() => setTriggerFetch(!triggerFetch)}
        setLoading={setIsLoading}
        setError={setIsError}
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
