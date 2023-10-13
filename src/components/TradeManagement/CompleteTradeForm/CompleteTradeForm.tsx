import React, { useState, useEffect } from "react";
import { useAuth } from "../../../auth/AuthContext"; // Authentication State
import http from "../../../services/http"; // Import the Axios configuration
import { useFormik } from "formik";
import { Trade } from "../../../models/TradeTypes";
import { FormSection } from "./Form";
import {
  Container,
  Paper,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import {
  calculateTotalHours,
  calculateProjectedPL,
  calculateCommission,
  calculatePercentChange,
  calculateRealRR,
  calculatePips,
  calculateMAERatio,
  calculateMFERatio,
} from "../../../utils/tradeCalculations";
import { dateInit } from "../../../utils/dates"; // Date utility
import { humanReadFormatDate } from "../../../utils/dates";
import { formatCurrency } from "../../../utils/formatters";

interface CompleteTradeFormProps {
  openTrade: Trade;
  conversionRates: Record<string, number>;
  completedTrade: () => void;
}

interface Calculations {
  totalHrs: number | null;
  projPL: number | null;
  commission: number | null;
  percentChange: number | null;
  realRR: number | null;
  pips: number | null;
  maeRatio: number | null;
  mfeRatio: number | null;
}

const CompleteTradeForm: React.FC<CompleteTradeFormProps> = ({
  openTrade,
  conversionRates,
  completedTrade
}) => {
  // Auth
  const { getEncodedCredentials } = useAuth();
  const encodedCredentials = getEncodedCredentials();

  // Initialize Calculated Values
  const [calculations, setCalculations] = useState<Calculations>({
    totalHrs: null,
    projPL: null,
    commission: null,
    percentChange: null,
    realRR: null,
    pips: null,
    maeRatio: null,
    mfeRatio: null,
  });

  // Initialize datetimein
  const formattedDateTime = dateInit();

  // Initialize Formik
  const formik = useFormik({
    initialValues: {
      datetimeOut: formattedDateTime,
      exitPrice: 0,
      realPL: 0,
      mfe: 0,
      mae: 0,
      screenshot: "",
      comment: "",
    },
    onSubmit: async (values) => {
      // Force values to be numbers
      values.exitPrice = Number(values.exitPrice);
      values.mfe = Number(values.mfe);
      values.mae = Number(values.mae);
      values.realPL = Number(values.realPL);
      const completedTradeData = {
        ...openTrade,
        ...values,
        ...calculations,
        status: "Closed",
      };
      try {
        const response = await http.post("/api/trades/update", completedTradeData, {
          headers: { Authorization: `Basic ${encodedCredentials}` },
        });
        console.log(response);
      } catch (error) {
        console.error("Error updating trade", error);
      }
      console.log(completedTrade);
      completedTrade();
    },
  });

  const { values } = formik;

  useEffect(() => {
    // Force realPL to be a number
    const realPL = Number(values.realPL);

    // Calculate fields
    const totalHrs = calculateTotalHours(
      openTrade.datetimeIn,
      values.datetimeOut,
    );
    const projPL = calculateProjectedPL(
      openTrade.direction,
      openTrade.entry,
      values.exitPrice,
      openTrade.size,
      openTrade.ticker,
      conversionRates,
    );
    const commission = calculateCommission(realPL, projPL);
    const percentChange = calculatePercentChange(realPL, openTrade.equity);
    const realRR = calculateRealRR(realPL, openTrade.equity, openTrade.risk);
    const pips = calculatePips(
      openTrade.direction,
      openTrade.ticker,
      openTrade.entry,
      values.exitPrice,
    );
    const maeRatio = calculateMAERatio(
      values.mae,
      openTrade.entry,
      openTrade.stopLoss,
    );
    const mfeRatio = calculateMFERatio(
      values.mfe,
      openTrade.entry,
      openTrade.stopLoss,
    );

    setCalculations({
      totalHrs,
      projPL,
      commission,
      percentChange,
      realRR,
      pips,
      maeRatio,
      mfeRatio,
    });
  }, [
    values,
    openTrade.datetimeIn,
    openTrade.direction,
    openTrade.entry,
    openTrade.size,
    openTrade.ticker,
    openTrade.equity,
    openTrade.risk,
    openTrade.stopLoss,
    conversionRates,
  ]);

  return (
    <Container
      component={Paper}
      elevation={0}
      style={{
        marginTop: "20px",
        width: "600px",
      }}
    >
      <Accordion
        elevation={1}
        defaultExpanded
        style={{ boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.1)" }}
      >
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              width: "100%",
            }}
          >
            <Typography variant="h6">Trade #{openTrade.id}</Typography>

            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-end",
              }}
            >
              {/* Secondary Information */}
              <div>
                <Typography variant="body1" display="inline">
                  Equity: {formatCurrency(openTrade.equity)}
                </Typography>
                <Typography variant="body1" display="inline">
                  &nbsp; | &nbsp;Opened:{" "}
                  {humanReadFormatDate(openTrade.datetimeIn)}
                </Typography>
              </div>

              {/* Tertiary Information */}
              <div>
                <Typography variant="caption" display="inline">
                  Ticker: {openTrade.ticker}
                </Typography>
                <Typography variant="caption" display="inline">
                  &nbsp; | &nbsp;Type: {openTrade.type}
                </Typography>
              </div>
            </div>
          </div>
        </AccordionSummary>

        <AccordionDetails
          style={{ flexDirection: "column", paddingTop: "0px" }}
        >
          {/* Pass Formik form and calculated fields to form */}
          <FormSection formik={formik} calc={calculations} />
        </AccordionDetails>
      </Accordion>
    </Container>
  );
};

export default CompleteTradeForm;
