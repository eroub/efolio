import React, { useState, useEffect } from "react";
import http from "../services/http"; // Import the Axios configuration
import { fetchExchangeRates } from "../utils/fetchExchangeRates"; // Import  exchange rates utility function

// Trade interface
import { Trade, PartialTrade } from "../models/TradeTypes";

// Components
import Error from "../components/Error";
import Loading from "../components/Loading";
import TradeInit from "../components/TradeInit";
import TradeTable from "../components/TradeTable/TradeTable";

const convertToStandardDateTime = (input: string) => {
  const date = new Date(input);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
    2,
    "0",
  )}-${String(date.getDate()).padStart(2, "0")} ${String(
    date.getHours(),
  ).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
};

const TradeJournal: React.FC = () => {
  // Trades
  const [trades, setTrades] = useState<Trade[]>([]);
  const [initTrade, setInitTrade] = useState<PartialTrade[]>([]);
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
  }, []);

  const addInitialTrade = async (newTrade: PartialTrade) => {
    setInitTrade([...initTrade, newTrade]);
    // Error / Loading States
    setIsLoading(true);
    setIsError(false);
    try {
      console.log("Data before submission:", newTrade);
      if (newTrade.datetimeIn) {
        newTrade.datetimeIn = convertToStandardDateTime(newTrade.datetimeIn);
      }
      const response = await http.post("/api/trades", newTrade);
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

  return (
    <div>
      <div className="trade-form">
        <TradeInit
          addTrade={addInitialTrade}
          conversionRates={conversionRates}
        />
      </div>

      {/* Loading and Error Components */}
      {isLoading ? <Loading /> : null}
      {isError ? <Error message="An error occurred" /> : null}

      {/* Display list of trades */}
      <TradeTable trades={trades} />
    </div>
  );
};

export default TradeJournal;
