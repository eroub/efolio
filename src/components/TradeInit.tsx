import React, { useEffect, useState } from "react";
import { useFormik } from "formik";
import {
  TextField,
  Grid,
  Container,
  Paper,
  Typography,
  Button,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  MenuItem,
  InputLabel,
  Select,
  FormControl,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
// Functions for calculating risk %, estimated gain %, and estimated R:R
import {
  calculateRiskPercent,
  calculateEstimatedGain,
  calculateEstimatedRR,
} from "../utils/tradeCalculations";
import { dateInit } from "../utils/dates"; // Date utility
// Import partial trade interface
import { PartialTrade } from "../models/TradeTypes";

type AddTradeFunction = (trade: PartialTrade) => void;

interface TradeFormProps {
  addTrade: AddTradeFunction;
  conversionRates: Record<string, number>;
}

const preprocessTicker = (ticker: string) => {
  // If the ticker already contains a '/', no need to preprocess
  if (ticker.includes("/")) return ticker;

  // Else, insert a '/' in the middle
  const mid = Math.ceil(ticker.length / 2);
  return ticker.substring(0, mid) + "/" + ticker.substring(mid);
};

const TradeInit: React.FC<TradeFormProps> = ({ addTrade, conversionRates }) => {
  // Calculated Values
  const [riskPercent, setRiskPercent] = useState<number>(0);
  const [estimatedGain, setEstimatedGain] = useState<number>(0);
  const [estimatedRR, setEstimatedRR] = useState<number>(0);

  // Initialize datetimein
  const formattedDateTime = dateInit();

  // Form values used in calculations
  const formik = useFormik({
    initialValues: {
      datetimeIn: formattedDateTime,
      ticker: "",
      direction: "Long",
      type: "",
      equity: 0,
      entry: 0,
      stopLoss: 0,
      target: 0,
      size: 0,
    },
    onSubmit: (values: PartialTrade) => {
      if (
        values.datetimeIn &&
        values.ticker &&
        values.direction &&
        values.equity &&
        values.entry &&
        values.stopLoss &&
        values.target &&
        values.size
      ) {
        // Update ticker to include "/" delimiter and add calculated fields
        const updatedTicker = preprocessTicker(values.ticker);
        const updatedData: PartialTrade = {
          ...values,
          ticker: updatedTicker,
          risk: riskPercent,
          estGain: estimatedGain,
          estRR: estimatedRR,
        };

        addTrade(updatedData);
      } else {
        alert("Please fill in all required fields.");
      }
    },
  });
  const { values } = formik;
  // Button validation
  const allValuesFilled = Object.values(values).every((v) => v !== "");

  useEffect(() => {
    const { equity, entry, stopLoss, target, size, ticker } = values;
    if (entry && stopLoss && size && equity && ticker) {
      const riskPercentValue = calculateRiskPercent(
        entry,
        stopLoss,
        size,
        equity,
        ticker,
        conversionRates,
      );
      setRiskPercent(parseFloat(riskPercentValue.toFixed(3)));
    }
    if (entry && target && size && equity && ticker) {
      const estimatedGainValue = calculateEstimatedGain(
        entry,
        target,
        size,
        equity,
        ticker,
        conversionRates,
      );
      setEstimatedGain(parseFloat(estimatedGainValue.toFixed(3)));
    }
    if (riskPercent && estimatedGain) {
      const estimatedRRValue = calculateEstimatedRR(riskPercent, estimatedGain);
      setEstimatedRR(parseFloat(estimatedRRValue.toFixed(3)));
    }
  }, [values, conversionRates, estimatedGain, riskPercent, estimatedRR]);

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
        style={{ boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.1)" }}
      >
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="h6">Trade Init.</Typography>
          <div
            style={{
              display: "flex",
              gap: "16px",
              marginLeft: "auto",
              alignItems: "center",
            }}
          >
            <div
              style={{
                fontWeight: riskPercent > 1.91 ? "bold" : "normal",
                color: riskPercent > 1.91 ? "red" : "black",
              }}
            >
              Risk: {riskPercent}%
            </div>
            <div>Est. Gain: {estimatedGain}%</div>
            <div>Est. R:R: {estimatedRR}</div>
          </div>
        </AccordionSummary>
        <AccordionDetails
          style={{ flexDirection: "column", paddingTop: "0px" }}
        >
          <form onSubmit={formik.handleSubmit}>
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <TextField
                  name="equity"
                  label="Equity"
                  fullWidth
                  onChange={formik.handleChange}
                  value={values.equity}
                  size="small"
                  margin="dense"
                />
                <TextField
                  name="entry"
                  label="Entry"
                  fullWidth
                  onChange={formik.handleChange}
                  value={values.entry}
                  size="small"
                  margin="dense"
                />
                <TextField
                  name="stopLoss"
                  label="Stop Loss"
                  fullWidth
                  onChange={formik.handleChange}
                  value={values.stopLoss}
                  size="small"
                  margin="dense"
                />
                <TextField
                  name="target"
                  label="Target"
                  fullWidth
                  onChange={formik.handleChange}
                  value={values.target}
                  size="small"
                  margin="dense"
                />
                <TextField
                  name="size"
                  label="Size"
                  fullWidth
                  onChange={formik.handleChange}
                  value={values.size}
                  size="small"
                  margin="dense"
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  name="datetimeIn"
                  label="Datetime In"
                  type="datetime-local"
                  fullWidth
                  onChange={formik.handleChange}
                  value={values.datetimeIn}
                  size="small"
                  margin="dense"
                />
                <TextField
                  name="ticker"
                  label="Ticker"
                  fullWidth
                  onChange={formik.handleChange}
                  value={values.ticker}
                  size="small"
                  margin="dense"
                />
                <FormControl fullWidth size="small" margin="dense">
                  <InputLabel>Direction</InputLabel>
                  <Select
                    name="direction"
                    label="Direction"
                    value={values.direction}
                    onChange={formik.handleChange}
                    sx={{
                      textAlign: "left",
                      "& .MuiSelect-select": {
                        textAlign: "left",
                      },
                    }}
                  >
                    <MenuItem value="Long">Long</MenuItem>
                    <MenuItem value="Short">Short</MenuItem>
                  </Select>
                </FormControl>
                <FormControl fullWidth size="small" margin="dense">
                  <InputLabel>Type</InputLabel>
                  <Select
                    name="type"
                    label="Type"
                    value={values.type}
                    onChange={formik.handleChange}
                    sx={{
                      textAlign: "left",
                      "& .MuiSelect-select": {
                        textAlign: "left",
                      },
                    }}
                  >
                    <MenuItem value="High Base">High Base</MenuItem>
                    <MenuItem value="Low Base">Low Base</MenuItem>
                    <MenuItem value="Bear Rally">Bear Rally</MenuItem>
                    <MenuItem value="Bull Pullback">Bull Pullback</MenuItem>
                    <MenuItem value="Bear Reversal">Bear Reversal</MenuItem>
                    <MenuItem value="Bull Reversal">Bull Reversal</MenuItem>
                    <MenuItem value="Ascending">Ascending</MenuItem>
                    <MenuItem value="Descending">Descending</MenuItem>
                    <MenuItem value="News Event">News Event</MenuItem>
                  </Select>
                </FormControl>
                <Button
                  style={{ marginTop: "10px" }}
                  type="submit"
                  variant="contained"
                  color="primary"
                  disabled={!allValuesFilled}
                >
                  Submit
                </Button>
              </Grid>
            </Grid>
          </form>
        </AccordionDetails>
      </Accordion>
    </Container>
  );
};

export default TradeInit;
