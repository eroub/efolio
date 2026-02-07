// Maverick.tsx
// Maverick: trader tools + (moved) legacy dashboard charts.

import React, { useCallback, useEffect, useMemo, useState } from "react";
import styled from "styled-components";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Container,
  Grid,
  Paper,
  SelectChangeEvent,
  TextField,
  Typography,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

import http from "../services/http";
import { convertToTimeZone } from "../utils/dates";
import { calculatePipDifference, calculateSize } from "../utils/tradeCalculations";

import Error from "../components/Error";
import Loading from "../components/Loading";
import TradeStatistics from "../components/Statistics/Statistics";
import Charts from "../components/Charts/Chart";
import WinLossPieChart from "../components/Charts/WinLossPieChart";
import ComparisonChart from "../components/Charts/ComparisonBarChart";
import ModeSelection from "../components/ModeSelection";

// import TradeInit from "../components/TradeManagement/TradeInit"; // disabled

import { Account } from "../models/AccountTypes";
import { PartialTrade, Trade } from "../models/TradeTypes";
import { useAuth } from "../auth/AuthContext";

const CustomContainer = styled(Container)`
  width: 100% !important;
  padding: 0;
  max-width: none !important; /* match TradeJournal full-width layout */
  overflow-x: hidden;
`;

const CustomAccordionDetails = styled(AccordionDetails)`
  padding: 8px 16px 16px;
  display: flex;
  flex-direction: column;
`;

const InputContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  grid-column: 1 / -1;
`;

const PipsDisplay = styled(Typography)`
  padding: 18px 0;
`;

const AccountsGrid = styled.div`
  grid-area: accounts;
  width: 100%;
`;

const AccountCard = styled.div`
  margin: 8px 0;
  box-sizing: border-box;
  border: 1px solid #ccc;
  padding: 10px;
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
  top: -9px;
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

type EditableAccount = Account & {
  editableEquity: string;
  editableRiskPercent: string;
};

type CalculatedSizesType = {
  [key: number]: number;
};

interface MaverickProps {
  conversionRates: Record<string, number>;
}

export default function Maverick({ conversionRates }: MaverickProps) {
  // -------- Legacy dashboard data (moved from TradeJournal) --------
  const [trades, setTrades] = useState<Trade[]>([]);
  const [accountFilteredTrades, setFilteredTrades] = useState<Trade[]>([]);
  const [triggerFetch, setTriggerFetch] = useState(false);
  const [comparisonMode, setComparisonMode] = useState<string>("R:R");
  const handleComparisonModeChange = (event: SelectChangeEvent<string>) => setComparisonMode(event.target.value);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // -------- Maverick tools state (size calc + trade init) --------
  const [ticker, setTicker] = useState("");
  const [entry, setEntry] = useState("");
  const [stopLoss, setStopLoss] = useState("");
  const [accounts, setAccounts] = useState<EditableAccount[]>([]);
  const [pipDifference, setPipDifference] = useState<number | null>(null);

  const { auth } = useAuth();
  const selectedAccount = auth.selectedAccount;

  // Fetch trades (same as TradeJournal)
  useEffect(() => {
    const fetchTrades = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await http.get("/api/trades");
        // Convert date fields to the desired time zone
        const timeZone = process.env.REACT_APP_TIMEZONE || "UTC";
        const convertedTrades = response.data.map((trade: Trade) => {
          if (trade.datetimeIn) trade.datetimeIn = convertToTimeZone(trade.datetimeIn, timeZone);
          if (trade.datetimeOut) trade.datetimeOut = convertToTimeZone(trade.datetimeOut, timeZone);
          return trade;
        });
        setTrades(convertedTrades);
        setError(null);
      } catch (e: any) {
        setError(e?.message || "Failed to load trades");
      } finally {
        setIsLoading(false);
      }
    };
    fetchTrades();
  }, [triggerFetch]);

  // Filter trades by selected account (same default behavior as TradeJournal)
  useEffect(() => {
    if (selectedAccount) {
      setFilteredTrades(trades.filter((t) => t.accountID === selectedAccount));
    } else {
      setFilteredTrades(trades.filter((t) => t.accountID === 3));
    }
  }, [trades, selectedAccount]);

  const closedTrades = useMemo(
    () => accountFilteredTrades.filter((t) => t.status === "Closed").sort((a, b) => b.id - a.id) as Trade[],
    [accountFilteredTrades]
  );

  const mostRecentTrade: Trade | null = useMemo(() => (closedTrades.length ? closedTrades[0] : null), [closedTrades]);

  // Maverick: fetch accounts
  useEffect(() => {
    const fetchAccountsData = async () => {
      try {
        const response = await http.get("/api/accounts/equityAmounts");
        const enriched = response.data.map((account: EditableAccount) => ({
          ...account,
          editableEquity: account.equity?.toString() || "",
          editableRiskPercent: account.defaultRiskPercent?.toString() || "",
        }));
        setAccounts(enriched);
      } catch (e) {
        console.error("Error fetching accounts data", e);
      }
    };
    fetchAccountsData();
  }, []);

  useEffect(() => {
    if (entry && stopLoss) setPipDifference(calculatePipDifference(Number(entry), Number(stopLoss)));
  }, [entry, stopLoss]);

  const handleFieldChange = useCallback(
    (accountID: number, field: "editableEquity" | "editableRiskPercent", value: string) => {
      setAccounts((prev) => prev.map((acc) => (acc.accountID === accountID ? { ...acc, [field]: value } : acc)));
    },
    []
  );

  const calculatedSizes = useMemo(() => {
    const sizes: CalculatedSizesType = {};
    accounts.forEach((account) => {
      sizes[account.accountID] = calculateSize(
        parseFloat(account.editableEquity),
        parseFloat(account.editableRiskPercent),
        parseFloat(entry),
        parseFloat(stopLoss),
        ticker,
        conversionRates
      );
    });
    return sizes;
  }, [accounts, entry, stopLoss, ticker, conversionRates]);

  const getStepValue = (t: string) => (t.slice(-3) === "JPY" ? 0.005 : 0.00005);

  const addInitialTrade = async (newTrade: PartialTrade) => {
    const payload = { ...newTrade, accountID: selectedAccount };
    await http.post("/api/trades", payload);
    setTriggerFetch((x) => !x);
  };

  return (
    <CustomContainer component={Paper} elevation={0}>
      {isLoading && <Loading />}
      {error && <Error message={error} />}

      {/* Maverick tools row */}
      <Grid container spacing={2} style={{ marginBottom: 12 }}>
        <Grid item xs={6}>
          <Accordion elevation={1} style={{ boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.5)" }}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="h6">Size Calculator</Typography>
            </AccordionSummary>
            <CustomAccordionDetails>
              <InputContainer>
                <TextField name="ticker" label="Ticker" type="text" variant="outlined" fullWidth margin="dense" onChange={(e) => setTicker(e.target.value)} value={ticker} size="small" />
                <TextField name="entry" label="Entry" type="number" variant="outlined" fullWidth margin="dense" onChange={(e) => setEntry(e.target.value)} value={entry} size="small" inputProps={{ step: getStepValue(ticker) }} style={{ marginLeft: "8px" }} />
                <TextField name="stopLoss" label="Stop Loss" type="number" variant="outlined" fullWidth margin="dense" onChange={(e) => setStopLoss(e.target.value)} value={stopLoss} size="small" inputProps={{ step: getStepValue(ticker) }} style={{ marginLeft: "8px", marginRight: "8px" }} />
                <PipsDisplay variant="subtitle1">Pips: {pipDifference !== null ? pipDifference : "N/A"}</PipsDisplay>
              </InputContainer>

              <AccountsGrid>
                {accounts.map((account) => (
                  <AccountCard key={account.accountID}>
                    <AccountLabel>{String((account as any).accountName ?? (account as any).name ?? (account as any).accountID)}</AccountLabel>
                    <AccountInfo>
                      <TextField label="Equity" type="number" variant="outlined" value={account.editableEquity} onChange={(e) => handleFieldChange(account.accountID, "editableEquity", e.target.value)} size="small" style={{ marginRight: 8 }} />
                      <TextField label="Risk %" type="number" variant="outlined" value={account.editableRiskPercent} onChange={(e) => handleFieldChange(account.accountID, "editableRiskPercent", e.target.value)} size="small" style={{ marginRight: 8 }} />
                      <Typography variant="subtitle1" style={{ fontWeight: 650 }}>
                        Size: {Number.isFinite(Number(calculatedSizes[account.accountID])) ? Number(calculatedSizes[account.accountID]).toFixed(2) : "0"}
                      </Typography>
                    </AccountInfo>
                  </AccountCard>
                ))}
              </AccountsGrid>
            </CustomAccordionDetails>
          </Accordion>
        </Grid>

        {/* TradeInit temporarily disabled (was causing runtime crash on some prod builds) */}
        <Grid item xs={6}></Grid>
      </Grid>

      {/* Legacy dashboard charts moved from home */}
      {closedTrades.length ? (
        <>
          <Grid container>
            <Grid item xs={9} style={{ display: "flex", alignItems: "center" }}>
              <TradeStatistics closedTrades={closedTrades} />
            </Grid>
            <Grid item xs={3} style={{ display: "flex", flexDirection: "column", justifyContent: "center" }}>
              <h3>Win Loss %</h3>
              <WinLossPieChart trades={closedTrades} />
              <h3>
                Win/Loss Comparison (
                <ModeSelection comparisonMode={comparisonMode} handleComparisonModeChange={handleComparisonModeChange} />
                )
              </h3>
              <ComparisonChart trades={closedTrades} mode={comparisonMode} />
            </Grid>
          </Grid>

          <Charts closedTrades={closedTrades} />
        </>
      ) : null}
    </CustomContainer>
  );
}
