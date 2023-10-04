import React, { useEffect, useState } from "react";
import { useFormik } from "formik";
import { calculateSize } from "../../utils/tradeCalculations";
import {
  TextField,
  Typography,
  Container,
  Paper,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

interface SizeCalculatorProps {
  conversionRates: Record<string, number>;
}

const SizeCalculator: React.FC<SizeCalculatorProps> = ({ conversionRates }) => {
  const [calculatedSize, setCalculatedSize] = useState("Incomplete data");

  const { submitForm, values, handleChange, handleSubmit } = useFormik({
    initialValues: {
      equity: "",
      riskPercent: "1.9",
      entry: "",
      stopLoss: "",
      ticker: "",
    },
    onSubmit: (values) => {
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
        setCalculatedSize(size.toString());
      } else {
        setCalculatedSize("Incomplete data");
      }
    },
  });

  useEffect(() => {
    submitForm(); // Auto-submit form on changes
  }, [values, conversionRates, submitForm]);

  return (
    <Container
      component={Paper}
      elevation={0}
      style={{
        marginTop: "20px",
        width: "300px",
      }}
    >
      <Accordion
        elevation={1}
        style={{ boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.1)" }}
      >
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="h6">Size Calculator</Typography>
        </AccordionSummary>
        <AccordionDetails
          style={{ flexDirection: "column", paddingTop: "0px" }}
        >
          <form onSubmit={handleSubmit}>
            <TextField
              name="equity"
              label="Equity"
              type="number"
              variant="outlined"
              fullWidth
              margin="dense"
              onChange={handleChange}
              value={values.equity}
              size="small"
            />
            <TextField
              name="riskPercent"
              label="Risk %"
              type="number"
              variant="outlined"
              fullWidth
              margin="dense"
              onChange={handleChange}
              value={values.riskPercent}
              size="small"
            />
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
            />
          </form>
          <Typography
            variant="body1"
            gutterBottom
            align="center"
            style={{ marginTop: "5px" }}
          >
            Calculated Size: {calculatedSize}
          </Typography>
        </AccordionDetails>
      </Accordion>
    </Container>
  );
};

export default SizeCalculator;
