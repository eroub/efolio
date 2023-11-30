// TradeManagement.tsx
// External Libraries
import React, { useState } from "react";
import { Grid } from "@mui/material";
import moment from "moment-timezone";
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
  // Get auth token
  const { auth } = useAuth();
  // Get selected account from auth context
  const selectedAccount = auth.selectedAccount;

  // Error and Loading states
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Provide a default time zone if the environment variable is not set
  const timeZone = process.env.REACT_APP_TIMEZONE || "UTC";

  // Function to add a new trade
  const addInitialTrade = async (newTrade: PartialTrade) => {
    setIsSubmitting(true);
    setIsLoading(true);
    setError(null);
    try {
      // Convert datetimeIn if in production
      if (newTrade.datetimeIn && process.env.REACT_APP_VERSION === "production") { 
        const utcDateTimeIn = moment.tz(newTrade.datetimeIn, timeZone).utc().format("YYYY-MM-DDTHH:mm:ss"); // Convert Date object to string
        newTrade.datetimeIn = utcDateTimeIn;
      }
      // Include the selectedAccount in the newTrade object
      const tradeWithAccount = {
        ...newTrade,
        accountID: selectedAccount, // This line adds the selected account ID to the trade data
      };

      await http.post("/api/trades", tradeWithAccount);
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
      <Grid item xs={3}>
        <SizeCalculator
          conversionRates={conversionRates}
          lastTrade={mostRecentTrade}
        />
      </Grid>

      {/* Trade Initialization */}
      <Grid item xs={3}>
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
      <Grid item xs={6}>
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
