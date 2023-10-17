// TradeManagement.tsx
// External Libraries
import React, { useState } from "react";
import { Grid } from "@mui/material";
// Interal Utilities / Assets / Themes;
import http from "../../services/http";
import { convertToMST } from "../../utils/dates";
// Components
import Error from "../Error";
import Loading from "../Loading";
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
  firstOpenTrade: Trade | undefined;
  mostRecentTrade: Trade | null;
  // Function props for various actions
  triggerTradeFetch: () => void;
}

const TradeManagement: React.FC<TradeManagementProps> = ({
  conversionRates,
  firstOpenTrade,
  triggerTradeFetch,
  mostRecentTrade,
}) => {
  // Local state variables with comments
  const [tradeAdded, setTradeAdded] = useState(false); // Whether a trade has been added
  const [isSubmitting, setIsSubmitting] = useState(false); // Whether the form is currently submitting
  // Encoded credentials
  const { auth, getEncodedCredentials } = useAuth();
  const encodedCredentials = getEncodedCredentials();
  // Error and Loading states
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Function to add a new trade
  const addInitialTrade = async (newTrade: PartialTrade) => {
    setIsSubmitting(true);
    setIsLoading(true);
    setError(null);
    try {
      if (newTrade.datetimeIn) {
        newTrade.datetimeIn = convertToMST(newTrade.datetimeIn);
      }
      await http.post("/api/trades", newTrade, {
        headers: { Authorization: `Basic ${encodedCredentials}` },
      });
      triggerTradeFetch();
      setIsLoading(true);
      setError(null);
      setTradeAdded(true);
      setIsSubmitting(false);
    } catch (error: any) {
      setIsLoading(true);
      setError(error.message);
      setIsSubmitting(false);
    }
  };

  return (
    <Grid container spacing={2}>
      {/* Loading and Error Components */}
      {isLoading && <Loading />}
      {error && <Error message={error} />}

      {/* Size Calculator */}
      <Grid item xs={2}>
        <SizeCalculator
          conversionRates={conversionRates}
          lastTrade={mostRecentTrade}
        />
      </Grid>

      {/* Trade Initialization */}
      <Grid item xs={5}>
        {auth.isAuthenticated ? (
          <TradeInit
            addTrade={addInitialTrade}
            conversionRates={conversionRates}
            lastTrade={mostRecentTrade}
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
        {auth.isAuthenticated && firstOpenTrade ? (
          <CompleteTradeForm
            openTrade={firstOpenTrade}
            conversionRates={conversionRates}
            completedTrade={triggerTradeFetch}
            setIsLoading={setIsLoading}
            setError={setError}
          />
        ) : (
          <div></div>
        )}
      </Grid>
    </Grid>
  );
};

export default TradeManagement;
