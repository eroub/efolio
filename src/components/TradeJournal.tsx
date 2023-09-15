import React, { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import axios from 'axios';
import http from '../http';  // Import the Axios configuration

interface Trade {
  id: number;
  datetimeIn: string;
  datetimeOut: string;
  totalHrs: number;
  ticker: string;
  direction: "Long" | "Short";
  equity: number;
  entry: number;
  stopLoss: number;
  target: number;
  size: number;
  risk: number;
  estGain: number;
  estRR: number;
  exit: number;
  projPL: number;
  realPL: number;
  commission: number;
  percentChange: number;
  realRR: number;
  pips: number;
  mfe: number;
  mae: number;
  mfeRatio: number;
  maeRatio: number;
  type: string;
  screenshot: string;
  comment: string;
  // USD specific fields
  riskUSD: number;
  estGainUSD: number;
  projPLUSD: number;
}

const convertToStandardDateTime = (input: string) => {
  const date = new Date(input);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
};

const calculateRiskPercent = (
  entry: number,
  stopLoss: number,
  size: number,
  equity: number,
  ticker: string,
  conversionRates: Record<string, number>
) => {
  const absDifference = Math.abs(stopLoss - entry);
  const lotSize = size;
  let calculatedRisk = 0;

  if (ticker.endsWith("USD")) {
    calculatedRisk = (absDifference * lotSize) / equity;
  } else {
    const quoteCurrency = ticker.slice(-3);
    const exchangeRate = conversionRates[quoteCurrency] || 1;
    calculatedRisk = (absDifference * lotSize) / (exchangeRate * equity);
  }

  return calculatedRisk * 100; // Multiply by 100 to get percentage
};

const calculateEstimatedGain = (
  entry: number,
  target: number,
  size: number,
  equity: number,
  ticker: string,
  conversionRates: Record<string, number>
) => {
  const absDifferenceGain = Math.abs(target - entry);
  const lotSize = size;
  let calculatedGain = 0;

  if (ticker.endsWith("USD")) {
    calculatedGain = (absDifferenceGain * lotSize) / equity;
  } else {
    const quoteCurrency = ticker.slice(-3);
    const exchangeRate = conversionRates[quoteCurrency] || 1;
    calculatedGain = (absDifferenceGain * lotSize) / (exchangeRate * equity);
  }

  return calculatedGain * 100; // Multiply by 100 to get percentage
};

const calculateEstimatedRR = (riskPercent: number, estimatedGain: number) => {
  return estimatedGain / riskPercent;
};

const TradeJournal: React.FC = () => {
  const [trades, setTrades] = useState<Trade[]>([]);
  const [riskPercent, setRiskPercent] = useState<number>(0);
  const [estimatedGain, setEstimatedGain] = useState<number>(0);
  const [estimatedRR, setEstimatedRR] = useState<number>(0);
  
  const { register, handleSubmit, control, watch } = useForm<Trade>();


  // Fetch trades from the server
  useEffect(() => {
    const fetchTrades = async () => {
      try {
        const response = await http.get('/api/trades');
        setTrades(response.data);
      } catch (error) {
        console.error('Error fetching trades', error);
      }
    };
    fetchTrades();
  }, []);

  const onSubmit = async (data: Trade) => {
    try {

      if (data.datetimeIn) {
        data.datetimeIn = convertToStandardDateTime(data.datetimeIn);
      }
      const response = await http.post('/api/trades', data);
      // Update local state with the new trade
      setTrades([...trades, response.data]);
    } catch (error) {
      console.error('Error submitting trade', error);
    }
  };

  const [conversionRates, setConversionRates] = useState<Record<string, number>>({});
  useEffect(() => {
    const fetchConversionRates = async () => {
      try {
        const response = await axios.get('https://v6.exchangerate-api.com/v6/8db55165607b79288936de0b/latest/USD');
        console.log(response.data);
        if (response.data.result === "success") {
          const allRates = response.data.conversion_rates;
          const neededRates = ['AUD', 'USD', 'CHF', 'EUR', 'GBP', 'JPY', 'NZD', 'CAD'];
          const filteredRates = Object.fromEntries(
            Object.entries(allRates).filter(([key]) => neededRates.includes(key))
          );
          setConversionRates(filteredRates as Record<string, number>);
        } else {
          console.error('API response was not successful:', response.data);
        }
      } catch (error: any) {
        console.error('Error fetching conversion rates:', error);
      }
    };
    // Fetch the conversion rates immediately upon component mount
    fetchConversionRates();
  }, []);

  const equity = watch("equity");
  const entry = watch("entry");
  const stopLoss = watch("stopLoss");
  const target = watch("target");
  const size = watch("size");
  const ticker = watch("ticker");

  useEffect(() => {
    console.log('useEffect triggered for risk calculation');
  
    if (entry && stopLoss && size && equity && ticker) {
      const riskPercentValue = calculateRiskPercent(entry, stopLoss, size, equity, ticker, conversionRates);
      setRiskPercent(parseFloat(riskPercentValue.toFixed(3)));
      console.log('Risk %:', riskPercentValue);
    }
  
    if (entry && target && size && equity && ticker) {
      const estimatedGainValue = calculateEstimatedGain(entry, target, size, equity, ticker, conversionRates);
      setEstimatedGain(parseFloat(estimatedGainValue.toFixed(3)));
      console.log('Estimated Gain %:', estimatedGainValue);
    }
  
    if (riskPercent && estimatedGain) {
      const estimatedRRValue = calculateEstimatedRR(riskPercent, estimatedGain);
      setEstimatedRR(parseFloat(estimatedRRValue.toFixed(3)));
      console.log('Estimated R:R:', estimatedRRValue);
    }
  
  }, [equity, entry, stopLoss, target, size, conversionRates, ticker, estimatedGain, riskPercent]);
  
  return (
    <div>
      <h1>Trade Journal</h1>

      <div className="trade-form">
        <div className="left-side">
          <form onSubmit={handleSubmit(onSubmit)}>
            
            {/* Datetime In */}
            <Controller
              name="datetimeIn"
              control={control}
              defaultValue=""
              rules={{ required: 'Datetime In is required' }}
              render={({ field }) => <input {...field} type="datetime-local" placeholder="Datetime In" />}
            />
            
            <div className="inline-fields">
              <input {...register("ticker", { required: 'Ticker is required' })} placeholder="Ticker" />
              <select {...register("direction", { required: 'Direction is required' })}>
                <option value="Long">Long</option>
                <option value="Short">Short</option>
              </select>
            </div>

            {/* Equity */}
            <input {...register("equity", { required: 'Equity is required', valueAsNumber: true })} placeholder="Equity" />
            {/* Entry */}
            <input {...register("entry", { required: 'Entry is required', valueAsNumber: true })} placeholder="Entry" />
            {/* Stop Loss */}
            <input {...register("stopLoss", { required: 'Stop Loss is required', valueAsNumber: true })} placeholder="Stop Loss" />
            {/* Target */}
            <input {...register("target", { required: 'Target is required', valueAsNumber: true })} placeholder="Target" />
            {/* Size */}
            <input {...register("size", { required: 'Size is required', valueAsNumber: true })} placeholder="Size" />

            {/* Type */}
            <select {...register("type")}>
              <option value="Low Base">Low Base</option>
              <option value="High Base">High Base</option>
              <option value="Bear Rally">Bear Rally</option>
              <option value="Bull Pullback">Bull Pullback</option>
              <option value="Bear Reversal">Bear Reversal</option>
              <option value="Bull Reversal">Bull Reversal</option>
              <option value="Ascending Triangle">Ascending Triangle</option>
              <option value="Descending Triangle">Descending Triangle</option>
            </select>

            <button type="submit">Submit</button>
          </form>
        </div>

        <div className="right-side">
          <div>Risk %: {riskPercent}</div>
          <div>Estimated Gain %: {estimatedGain}</div>
          <div>Estimated R:R: {estimatedRR}</div>
        </div>
      </div>

      {/* Display list of trades */}
      <ul>
        {trades.map((trade) => (
          <li key={trade.id}>{trade.ticker}</li>
        ))}
      </ul>

      
      {/* Display conversion rates */}
      <div>
        <h2>Conversion Rates</h2>
        <ul>
          {Object.keys(conversionRates).map((key) => (
            <li key={key}>{`${key}/USD: ${conversionRates[key]}`}</li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default TradeJournal;