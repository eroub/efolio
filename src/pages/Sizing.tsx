// Libraries
import React, { useState, useEffect, useCallback, useMemo } from "react";
import styled from "styled-components";
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
// API service
import http from "../services/http";
// Internal Utilities / Assets / Themes
import {
  calculateSize,
  calculatePipDifference,
} from "../utils/tradeCalculations";
import { formatSizeInK } from "../utils/formatters";
// Types and Intefaces
import { Account } from "../models/AccountTypes";

// Styled components
const CustomContainer = styled(Container)`
  width: 475px !important;
  // max-width: 'none'; // Override the max-width if necessary
  padding: 0; // Remove padding if needed
`;

// Adjust the AccordionDetails to give more room on the right
const CustomAccordionDetails = styled(AccordionDetails)`
  padding: 8px 16px 16px; // Adjust padding to give more space
  display: flex;
  flex-direction: column;
`;

const InputContainer = styled.div`
  display: flex;
  justify-content: space-between; // Spread out the fields evenly
  align-items: center; // Center align the items vertically
  grid-column: 1 / -1; // Span across all columns
`;

const PipsDisplay = styled(Typography)`
  padding: 18px 0; 
`;

const AccountsGrid = styled.div`
  grid-area: accounts;
  width: 100%;
`;

const AccountCard = styled.div`
  margin: 8px 0; // Add margin around each card if necessary
  box-sizing: border-box; // Ensure padding is included in the width calculation
  border: 1px solid #ccc;
  padding: 10px;
  // padding-top: 18px;
  position: relative;
  display: flex;
  flex-direction: column;
  grid-column: 1;
  width: 100%;
  justify-content: space-between;
  background-color: ${({ theme }) => theme.containerBackgroundColor};
`;

const AccountLabel = styled.label`
  position: absolute;
  top: -9px; // Half of the font-size to center it vertically on the border line
  left: 10px;
  background-color: ${({ theme }) => theme.containerBackgroundColor};
  color: ${({ theme }) => theme.textColor};
  padding: 0 5px;
  font-weight: bold;
  font-size: 16px;
  color: rgba(0, 0, 0, 0.54);
`;

const AccountInfo = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

interface SizingProps {
  conversionRates: Record<string, number>;
}

// Modified Account type to allow for editable fields
type EditableAccount = Account & {
  editableEquity: string;
  editableRiskPercent: string;
};

// Define the type for the calculatedSizes object
type CalculatedSizesType = {
  [key: number]: number;
};

const Sizing: React.FC<SizingProps> = ({ conversionRates }) => {
  const [ticker, setTicker] = useState("");
  const [entry, setEntry] = useState("");
  const [stopLoss, setStopLoss] = useState("");
  const [accounts, setAccounts] = useState<EditableAccount[]>([]);
  const [pipDifference, setPipDifference] = useState<number | null>(null);

  const handleTickerChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setTicker(event.target.value);
  };

  const handleEntryChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setEntry(event.target.value);
  };

  const handleStopLossChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setStopLoss(event.target.value);
  };

  // Fetch accounts data on component mount
  useEffect(() => {
    const fetchAccountsData = async () => {
      try {
        const response = await http.get("/api/accounts/equityAmounts");
        // Initialize the state with strings to ensure the fields are always controlled
        const enrichedAccounts = response.data.map(
          (account: EditableAccount) => ({
            ...account,
            editableEquity: account.equity?.toString() || "", // Ensure a string is always provided
            editableRiskPercent: account.defaultRiskPercent?.toString() || "", // Ensure a string is always provided
          }),
        );
        setAccounts(enrichedAccounts);
      } catch (error) {
        console.error("Error fetching accounts data", error);
      }
    };

    fetchAccountsData();
  }, []);

  // Calculate pip difference whenever entry or stopLoss changes
  useEffect(() => {
    if (entry && stopLoss) {
      const pip = calculatePipDifference(Number(entry), Number(stopLoss));
      setPipDifference(pip);
    }
  }, [entry, stopLoss]);

  const handleFieldChange = useCallback(
    (
      accountID: number,
      field: "editableEquity" | "editableRiskPercent",
      value: string,
    ) => {
      setAccounts((prevAccounts) =>
        prevAccounts.map((acc) =>
          acc.accountID === accountID ? { ...acc, [field]: value } : acc,
        ),
      );
    },
    [],
  );

  // Use the useMemo hook with the defined type for the calculatedSizes object
  const calculatedSizes = useMemo(() => {
    const sizes: CalculatedSizesType = {}; // Use the type here
    accounts.forEach((account) => {
      const size = calculateSize(
        parseFloat(account.editableEquity),
        parseFloat(account.editableRiskPercent),
        parseFloat(entry),
        parseFloat(stopLoss),
        ticker,
        conversionRates,
      );
      sizes[account.accountID] = size;
    });
    return sizes;
  }, [accounts, entry, stopLoss, ticker, conversionRates]);

  // Step value to determine how much to increase/decrease entry/SL when pressing "up"
  const getStepValue = (ticker: string) => {
    if (ticker.slice(-3) === "JPY") {
      return 0.005;
    }
    return 0.00005;
  };

  return (
    <CustomContainer component={Paper} elevation={0}>
    <Accordion
      elevation={1}
      style={{ boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.5)" }}
    >
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <Typography variant="h6">Size Calculator</Typography>
      </AccordionSummary>
      <CustomAccordionDetails>
      <InputContainer>
        <TextField
          name="ticker"
          label="Ticker"
          type="text"
          variant="outlined"
          fullWidth
          margin="dense"
          onChange={handleTickerChange}
          value={ticker}
          size="small"
        />
        <TextField
          name="entry"
          label="Entry"
          type="number"
          variant="outlined"
          fullWidth
          margin="dense"
          onChange={handleEntryChange}
          value={entry}
          size="small"
          inputProps={{ step: getStepValue(ticker) }}
          style={{marginLeft: "8px"}}
        />
        <TextField
          name="stopLoss"
          label="Stop Loss"
          type="number"
          variant="outlined"
          fullWidth
          margin="dense"
          onChange={handleStopLossChange}
          value={stopLoss}
          size="small"
          inputProps={{ step: getStepValue(ticker) }}
          style={{marginLeft: "8px", marginRight: "8px"}}
        />
        <PipsDisplay variant="subtitle1">
          Pips: {pipDifference !== null ? pipDifference : "N/A"}
        </PipsDisplay>{" "}
      </InputContainer>
      <AccountsGrid>
        {accounts.map((account) => (
          <AccountCard key={account.accountID}>
            <AccountLabel>{account.accountName}</AccountLabel>
            <AccountInfo>
              <TextField
                label="Equity"
                type="number"
                variant="outlined"
                value={account.editableEquity}
                onChange={(e) =>
                  handleFieldChange(
                    account.accountID,
                    "editableEquity",
                    e.target.value,
                  )
                }
                size="small"
                margin="dense"
                InputLabelProps={{
                  shrink: true,
                }}
                style={{ width: "30%", flex: 1 }}
              />
              <TextField
                label="Risk %"
                type="number"
                variant="outlined"
                value={account.editableRiskPercent}
                onChange={(e) =>
                  handleFieldChange(
                    account.accountID,
                    "editableRiskPercent",
                    e.target.value,
                  )
                }
                size="small"
                margin="dense"
                InputLabelProps={{
                  shrink: true,
                }}
                inputProps={{ step: 0.01 }}
                style={{
                  width: "20%",
                  flex: 1,
                  marginLeft: "8px",
                  marginRight: "8px",
                }}
              />
              <Typography variant="body2">
                <b>{formatSizeInK(calculatedSizes[account.accountID])} ({(calculatedSizes[account.accountID]/100000).toFixed(2)})</b>
              </Typography>
            </AccountInfo>
          </AccountCard>
        ))}
      </AccountsGrid>
      </CustomAccordionDetails>
      </Accordion>
    </CustomContainer>
  );
};

export default Sizing;
