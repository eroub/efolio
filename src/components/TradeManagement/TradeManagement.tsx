import React from "react";
import { Grid } from "@mui/material";
import SizeCalculator from "./SizeCalc";
import CompleteTradeForm from "./CompleteTradeForm/CompleteTradeForm";
import TradeInit from "./TradeInit";
import { Trade } from "../../models/TradeTypes";

interface TradeManagementProps {
  conversionRates: Record<string, number>;
  isAuthenticated: boolean;
  firstOpenTrade: Trade | undefined;
  addInitialTrade: (trade: Partial<Trade>) => void;
  completedTrade: () => void;
}

const TradeManagement: React.FC<TradeManagementProps> = ({
  conversionRates,
  isAuthenticated,
  firstOpenTrade,
  addInitialTrade,
  completedTrade
}) => {
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
            completedTrade={completedTrade}
          />
        ) : (
          <div></div>
        )}
      </Grid>
    </Grid>
  );
};

export default TradeManagement;
