// Libraries
import React, { useState, useEffect } from "react";
import { useFormik } from "formik";
import { TextField, Grid, Card, CardContent, Typography } from "@mui/material";
// API service
import http from "../services/http";
// Internal Utilities / Assets / Themes
import {
  calculateSize,
  calculatePipDifference,
} from "../utils/tradeCalculations";
import { formatSizeInK, formatCurrency } from "../utils/formatters";
// Types and Intefaces
import { Account } from "../models/AccountTypes";

interface SizingProps {
  conversionRates: Record<string, number>;
}

const Sizing: React.FC<SizingProps> = ({ conversionRates }) => {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [pipDifference, setPipDifference] = useState<number | null>(null);
  const [calculatedSizes, setCalculatedSizes] = useState<
    Record<number, number>
  >({});

  // Fetch accounts data on component mount
  useEffect(() => {
    const fetchAccountsData = async () => {
      try {
        const response = await http.get("/api/accounts/equityAmounts");
        setAccounts(response.data);
      } catch (error) {
        console.error("Error fetching accounts data", error);
      }
    };

    fetchAccountsData();
  }, []);

  // Formik setup
  const { values, handleChange, handleSubmit } = useFormik({
    initialValues: {
      ticker: "",
      entry: "",
      stopLoss: "",
      riskPercent: "",
    },
    onSubmit: (values) => {
      // Triggered when the form is submitted
      // You can place your calculation logic here if needed
    },
  });

  // Function to calculate sizes for all accounts
  useEffect(() => {
    if (!values.entry || !values.stopLoss || !values.ticker) {
      return;
    }

    const newSizes = accounts.reduce((sizes, account) => {
      const size = calculateSize(
        account.equity,
        account.defaultRiskPercent,
        Number(values.entry),
        Number(values.stopLoss),
        values.ticker,
        conversionRates,
      );
      return { ...sizes, [account.accountID]: size };
    }, {});

    setCalculatedSizes(newSizes);
  }, [values, accounts, conversionRates]);

  // Calculate pip difference whenever entry or stopLoss changes
  useEffect(() => {
    if (values.entry && values.stopLoss) {
      const pip = calculatePipDifference(
        Number(values.entry),
        Number(values.stopLoss),
      );
      setPipDifference(pip);
    }
  }, [values.entry, values.stopLoss]);

  // Step value to determine how much to increase/decrease entry/SL when pressing "up"
  const getStepValue = (ticker: string) => {
    if (ticker.slice(-3) === "JPY") {
      return 0.005;
    }
    return 0.00005;
  };

  return (
    <div>
      <Grid container spacing={2} style={{ padding: "20px" }}>
        <Grid item xs={12}>
          <Typography variant="h4" gutterBottom>
            Sizing
          </Typography>
        </Grid>

        <Grid item xs={12} md={6}>
          <form onSubmit={handleSubmit}>
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
          </form>
          <Typography variant="subtitle1">
            Pips: {pipDifference !== null ? pipDifference : "N/A"}
          </Typography>
        </Grid>

        {accounts.map((account) => (
          <Grid item xs={12} md={6} key={account.accountID}>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="h6">{account.accountName}</Typography>
                <Typography>
                  Equity: {formatCurrency(account.equity)}
                </Typography>
                <Typography>Risk %: {account.defaultRiskPercent}%</Typography>
                <Typography>
                  Size: {formatSizeInK(calculatedSizes[account.accountID])}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </div>
  );
};

export default Sizing;
