// TradeManagement.tsx
// External Libraries
import React, { useState } from "react";
import { Grid } from "@mui/material";
import { format } from "date-fns";
// Interal Utilities / Assets / Themes;
import http from "../../services/http";
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
import { zonedTimeToUtc } from "date-fns-tz";

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

  // Provide a default time zone if the environment variable is not set
  const timeZone = process.env.TIMEZONE || "UTC";

  // Function to add a new trade
  const addInitialTrade = async (newTrade: PartialTrade) => {
    setIsSubmitting(true);
    setIsLoading(true);
    setError(null);
    try {
      if (newTrade.datetimeIn) {
        const utcDateTimeIn = zonedTimeToUtc(newTrade.datetimeIn, timeZone);
        newTrade.datetimeIn = format(utcDateTimeIn, "yyyy-MM-dd HH:mm:ss"); // Convert Date object to string
      }
      await http.post("/api/trades", newTrade, {
        headers: { Authorization: `Basic ${encodedCredentials}` },
      });
      triggerTradeFetch();
      setIsLoading(false);
      setError(null);
      setTradeAdded(true);
      setIsSubmitting(false);
    } catch (error: any) {
      setIsLoading(false);
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
