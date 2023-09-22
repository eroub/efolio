import React, { useState, useEffect } from "react";
import http from "../services/http"; // Import the Axios configuration
import { fetchExchangeRates } from "../utils/fetchExchangeRates"; // Import  exchange rates utility function
import { convertToStandardDateTime } from "../utils/dateManipulation"; // Import date conversion utility function
import { useAuth } from "../auth/AuthContext"; // Authentication State

// Trade interface
import { Trade, PartialTrade } from "../models/TradeTypes";

// Components
import Error from "../components/Error";
import Loading from "../components/Loading";
import TradeInit from "../components/TradeInit";
import ClosedTradeTable from "../components/ClosedTradeTable/ClosedTradeTable";
import { Expand, Shrink } from "../assets/Arrows";

const TradeJournal: React.FC = () => {
  // Authentication State
  const { auth, getEncodedCredentials } = useAuth();
  const encodedCredentials = getEncodedCredentials();
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

  // Table shrink/expand state
  const [isTableExpanded, setTableExpanded] = useState(true); // Initial state is 'Expanded'
  const toggleTable = () => {
    setTableExpanded(!isTableExpanded);
  };

  // Fetch trades from the server
  useEffect(() => {
    const fetchTrades = async () => {
      // Error / Loading States
      setIsLoading(true);
      setIsError(false);
      try {
        const response = await http.get("/api/trades");
        setTrades(response.data);
        console.log(response.data);
        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching trades", error);
        setIsLoading(false);
        setIsError(true);
      }
    };
    fetchTrades();
  }, []);

  // Add new trade
  const addInitialTrade = async (newTrade: PartialTrade) => {
    setInitTrade([...initTrade, newTrade]);
    // Error / Loading States
    setIsLoading(true);
    setIsError(false);
    try {
      if (newTrade.datetimeIn) {
        newTrade.datetimeIn = convertToStandardDateTime(newTrade.datetimeIn);
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

  return (
    <div>
      {/* Only show trade create form if user is authenticated */}
      {auth.isAuthenticated && (
        <div className="trade-form">
          <TradeInit
            addTrade={addInitialTrade}
            conversionRates={conversionRates}
          />
        </div>
      )}

      {/* Loading and Error Components */}
      {isLoading ? <Loading /> : null}
      {isError ? <Error message="An error occurred" /> : null}

      {/* Display list of trades */}
      <h3 style={{ display: "flex", alignItems: "center" }}>
        Completed Trades
        <button onClick={toggleTable}>
          {isTableExpanded ? (
            <Shrink style={{ marginLeft: "10px" }} />
          ) : (
            <Expand style={{ marginLeft: "10px" }} />
          )}
        </button>
      </h3>
      <ClosedTradeTable trades={trades} isTableExpanded={isTableExpanded} />
    </div>
  );
};

export default TradeJournal;
