// TradeManagement.tsx
// External Libraries
import React, { useState } from "react";
import { Grid } from "@mui/material";
// Interal Utilities / Assets / Themes;
import http from "../../services/http";
import { convertToMST } from "../../utils/dates";
// Components
import SizeCalculator from "./SizeCalc";
import CompleteTradeForm from "./CompleteTradeForm/CompleteTradeForm";
import TradeInit from "./TradeInit";
// Types and Interfaces
import { Trade, PartialTrade } from "../../models/TradeTypes";
// Context
import { useAuth } from "../../auth/AuthContext";

interface TradeManagementProps {
  // State-related props
  conversionRates: Record<string, number>;
  isAuthenticated: boolean;
  firstOpenTrade: Trade | undefined;
  // Function props for various actions
  completedTrades: () => void;
  triggerTradeFetch: () => void;
  setLoading: (state: boolean) => void;
  setError: (state: boolean) => void;
}

const TradeManagement: React.FC<TradeManagementProps> = ({
  conversionRates,
  isAuthenticated,
  firstOpenTrade,
  completedTrades,
  triggerTradeFetch,
  setLoading,
  setError,
}) => {
  // Local state variables with comments
  const [tradeAdded, setTradeAdded] = useState(false); // Whether a trade has been added
  const [isSubmitting, setIsSubmitting] = useState(false); // Whether the form is currently submitting
  // Encoded credentials
  const { getEncodedCredentials } = useAuth();
  const encodedCredentials = getEncodedCredentials();

  // Function to add a new trade
  const addInitialTrade = async (newTrade: PartialTrade) => {
    // More comments here to explain logic
    setIsSubmitting(true);
    setLoading(true);
    setError(false);
    try {
      if (newTrade.datetimeIn) {
        newTrade.datetimeIn = convertToMST(newTrade.datetimeIn);
      }
      await http.post("/api/trades", newTrade, {
        headers: { Authorization: `Basic ${encodedCredentials}` },
      });
      triggerTradeFetch();
      setLoading(false);
      setTradeAdded(true);
      setIsSubmitting(false);
    } catch (error) {
      console.error("Error submitting trade", error);
      setLoading(false);
      setError(true);
      setIsSubmitting(false);
    }
  };

  return (
    <Grid container spacing={2}>
      {/* Size Calculator */}
      <Grid item xs={2}>
        <SizeCalculator conversionRates={conversionRates} />
      </Grid>

      {/* Trade Initialization */}
      <Grid item xs={5}>
        {isAuthenticated ? (
          <TradeInit
            addTrade={addInitialTrade}
            conversionRates={conversionRates}
            tradeAdded={tradeAdded}
            setTradeAdded={setTradeAdded}
            isSubmitting={isSubmitting}
          />
        ) : (
          <div></div>
        )}
      </Grid>

      {/* Form for completing trades */}
      <Grid item xs={5}>
        {isAuthenticated && firstOpenTrade ? (
          <CompleteTradeForm
            openTrade={firstOpenTrade}
            conversionRates={conversionRates}
            completedTrade={completedTrades}
          />
        ) : (
          <div></div>
        )}
      </Grid>
    </Grid>
  );
};

export default TradeManagement;
