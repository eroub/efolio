// Libraries
import React, { useState, useEffect } from "react";
import { useFormik } from "formik";
import styled from "styled-components";
import { TextField, Typography } from "@mui/material";
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

// Styled components
const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin: 20px;
`;

const Header = styled.h1`
  margin-bottom: 20px;
`;

const FormRow = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  max-width: 600px; /* Adjust the width as needed */
  margin-bottom: 10px;
`;

const FormField = styled.div`
  width: calc(33.3% - 10px);
`;

const AccountsContainer = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  max-width: 600px; /* Adjust the width as needed */
`;

const AccountCard = styled.div`
  border: 1px solid #ccc;
  padding: 10px;
  margin: 5px;
  flex-basis: calc(50% - 10px);
`;

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
  const { values, handleChange } = useFormik({
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
    <Container>
      <Header>Size Calculator</Header>
      <FormRow>
        <FormField>
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
        </FormField>
        <FormField>
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
        </FormField>
        <FormField>
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
        </FormField>
      </FormRow>
      <FormRow>
        <Typography variant="subtitle1">
          Pips: {pipDifference !== null ? pipDifference : "N/A"}
        </Typography>{" "}
      </FormRow>
      <AccountsContainer>
        {accounts.map((account) => (
          <AccountCard key={account.accountID}>
            <div>{account.accountName}</div>
            <div>Equity: {formatCurrency(account.equity)}</div>
            <div>Risk %: {account.defaultRiskPercent}</div>
            <div>Size: {formatSizeInK(calculatedSizes[account.accountID])}</div>
          </AccountCard>
        ))}
      </AccountsContainer>
    </Container>
  );
};

export default Sizing;
