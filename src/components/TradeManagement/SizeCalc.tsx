// SizeCalc.tsx
// External Libraries
import React, { useEffect, useState } from "react";
import { useFormik } from "formik";
import {
  TextField,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Container,
  Paper,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
// Internal Utilities / Assets / Themes
import {
  calculateSize,
  calculatePipDifference,
} from "../../utils/tradeCalculations";
import { formatSizeInK } from "../../utils/formatters";
// Types and Interfaces
import { Trade } from "../../models/TradeTypes";

interface SizeCalculatorProps {
  conversionRates: Record<string, number>;
  lastTrade?: Trade | null;
}

const SizeCalculator: React.FC<SizeCalculatorProps> = ({
  conversionRates,
  lastTrade,
}) => {
  const [calculatedSize, setCalculatedSize] = useState(0);
  const [calculatePip, setCalculatedPip] = useState(0);

  // Init equity based on last trade
  const [initEquity, setInitEquity] = useState<string | null>("");
  useEffect(() => {
    if (lastTrade) {
      const realPL = lastTrade.realPL ?? 0;
      setInitEquity((lastTrade.equity + realPL).toFixed(2).toString());
    }
  }, [lastTrade]);

  const { submitForm, values, handleChange, handleSubmit, setFieldValue } =
    useFormik({
      initialValues: {
        equity: initEquity || "",
        riskPercent: "1.9",
        entry: "",
        stopLoss: "",
        ticker: "",
      },
      onSubmit: (values) => {
        // Size Calc
        const { equity, riskPercent, entry, stopLoss, ticker } = values;
        if (equity && riskPercent && entry && stopLoss && ticker) {
          const size = calculateSize(
            Number(equity),
            Number(riskPercent),
            Number(entry),
            Number(stopLoss),
            ticker,
            conversionRates,
          );
          setCalculatedSize(size);
        } else {
          setCalculatedSize(0);
        }
        // Pip Calc
        if (entry && stopLoss) {
          const pip = calculatePipDifference(Number(entry), Number(stopLoss));
          setCalculatedPip(pip);
        } else {
          setCalculatedPip(0);
        }
      },
    });

  useEffect(() => {
    if (initEquity !== null) {
      setFieldValue("equity", initEquity);
    }
  }, [initEquity, setFieldValue]);

  useEffect(() => {
    submitForm(); // Auto-submit form on changes
  }, [values, conversionRates, submitForm]);

  // Step value to determine how much to increase/decrease entry/SL when pressing "up"
  const getStepValue = (ticker: string) => {
    if (ticker.slice(-3) === "JPY") {
      return 0.005;
    }
    return 0.00005;
  };

  return (
    <Container
      component={Paper}
      elevation={0}
      style={{
        width: "350px",
      }}
    >
      <Accordion
        elevation={1}
        style={{ boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.5)" }}
      >
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="h6">Size Calculator</Typography>
        </AccordionSummary>
        <AccordionDetails
          style={{ flexDirection: "column", paddingTop: "0px" }}
        >
          <form onSubmit={handleSubmit}>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <TextField
                name="equity"
                label="Equity"
                type="number"
                variant="outlined"
                margin="dense"
                onChange={handleChange}
                value={values.equity}
                size="small"
                style={{ width: "48%" }}
              />
              <TextField
                name="ticker"
                label="Ticker"
                type="text"
                variant="outlined"
                fullWidth
                margin="dense"
                onChange={handleChange}
                value={values.ticker}
                size="small"
                style={{ width: "48%" }}
              />
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <TextField
                name="entry"
                label="Entry"
                type="number"
                variant="outlined"
                fullWidth
                margin="dense"
                onChange={handleChange}
                value={values.entry}
                size="small"
                style={{ width: "48%" }}
                inputProps={{ step: getStepValue(values.ticker) }}
              />
              <TextField
                name="stopLoss"
                label="Stop Loss"
                type="number"
                variant="outlined"
                fullWidth
                margin="dense"
                onChange={handleChange}
                value={values.stopLoss}
                size="small"
                style={{ width: "48%" }}
                inputProps={{ step: getStepValue(values.ticker) }}
              />
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <TextField
                name="riskPercent"
                label="Risk %"
                type="number"
                variant="outlined"
                margin="dense"
                onChange={handleChange}
                value={values.riskPercent}
                size="small"
                style={{ width: "48%" }}
              />
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  width: "48%",
                  marginTop: "2px",
                }}
              >
                <Typography variant="body1" gutterBottom align="center">
                  Size: {formatSizeInK(calculatedSize)}
                </Typography>
                <Typography variant="body1" gutterBottom align="center">
                  Pips: {calculatePip}
                </Typography>
              </div>
            </div>
          </form>
        </AccordionDetails>
      </Accordion>
    </Container>
  );
};

export default SizeCalculator;
