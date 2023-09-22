import React, { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
// Functions for calculating risk %, estimated gain %, and estimated R:R
import {
  calculateRiskPercent,
  calculateEstimatedGain,
  calculateEstimatedRR,
} from "../utils/tradeCalculations";
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
  const { control, watch, handleSubmit } = useForm<PartialTrade>();
  const [riskPercent, setRiskPercent] = useState<number>(0);
  const [estimatedGain, setEstimatedGain] = useState<number>(0);
  const [estimatedRR, setEstimatedRR] = useState<number>(0);

  // Form values used in calculations
  const equity = watch("equity");
  const entry = watch("entry");
  const stopLoss = watch("stopLoss");
  const target = watch("target");
  const size = watch("size");
  const ticker = watch("ticker");

  const submitTrade = (formData: PartialTrade) => {
    console.log(formData);
    if (
      formData.datetimeIn &&
      formData.ticker &&
      formData.direction &&
      formData.equity &&
      formData.entry &&
      formData.stopLoss &&
      formData.target &&
      formData.size
    ) {
      // Update ticker to include "/" delimiter and add calculated fields
      const updatedTicker = preprocessTicker(formData.ticker);
      const updatedData: PartialTrade = {
        ...formData,
        ticker: updatedTicker,
        risk: riskPercent,
        estGain: estimatedGain,
        estRR: estimatedRR,
      };

      addTrade(updatedData);
    } else {
      alert("Please fill in all required fields.");
    }
  };

  useEffect(() => {
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
  }, [
    equity,
    entry,
    stopLoss,
    target,
    size,
    conversionRates,
    ticker,
    estimatedGain,
    riskPercent,
  ]);

  return (
    <div>
      <div className="left-side">
        <form onSubmit={handleSubmit(submitTrade)}>
          <Controller
            name="datetimeIn"
            control={control}
            render={({ field }) => (
              <input type="datetime-local" {...field} required />
            )}
          />
          <Controller
            name="ticker"
            control={control}
            render={({ field }) => (
              <input type="text" placeholder="Ticker" {...field} required />
            )}
          />
          <Controller
            name="direction"
            control={control}
            defaultValue="Long"
            render={({ field }) => (
              <select {...field} required>
                <option value="" disabled>
                  Select Direction
                </option>
                <option value="Long">Long</option>
                <option value="Short">Short</option>
              </select>
            )}
          />
          <Controller
            name="equity"
            control={control}
            render={({ field }) => (
              <input
                type="number"
                placeholder="Equity"
                value={field.value || ""}
                onChange={field.onChange}
                onBlur={field.onBlur}
              />
            )}
          />
          <Controller
            name="entry"
            control={control}
            render={({ field }) => (
              <input
                type="number"
                placeholder="Entry"
                value={field.value || ""}
                onChange={field.onChange}
                onBlur={field.onBlur}
              />
            )}
          />
          <Controller
            name="stopLoss"
            control={control}
            render={({ field }) => (
              <input
                type="number"
                placeholder="Stop Loss"
                value={field.value || ""}
                onChange={field.onChange}
                onBlur={field.onBlur}
              />
            )}
          />
          <Controller
            name="target"
            control={control}
            render={({ field }) => (
              <input
                type="number"
                placeholder="Target"
                value={field.value || ""}
                onChange={field.onChange}
                onBlur={field.onBlur}
              />
            )}
          />
          <Controller
            name="size"
            control={control}
            render={({ field }) => (
              <input
                type="number"
                placeholder="Size"
                value={field.value || ""}
                onChange={field.onChange}
                onBlur={field.onBlur}
              />
            )}
          />
          <Controller
            name="type"
            control={control}
            render={({ field }) => (
              <select
                value={field.value || ""}
                onChange={field.onChange}
                onBlur={field.onBlur}
              >
                <option value="" disabled>
                  Select Type
                </option>
                <option value="Low Base">Low Base</option>
                <option value="High Base">High Base</option>
                <option value="Bear Rally">Bear Rally</option>
                <option value="Bull Pullback">Bull Pullback</option>
                <option value="Bear Reversal">Bear Reversal</option>
                <option value="Bull Reversal">Bull Reversal</option>
                <option value="Ascending Triangle">Ascending Triangle</option>
                <option value="Descending Triangle">Descending Triangle</option>
              </select>
            )}
          />
          <button type="submit">Add Trade</button>
        </form>
      </div>
      <div className="right-side">
        <div>Risk %: {riskPercent}</div>
        <div>Estimated Gain %: {estimatedGain}</div>
        <div>Estimated R:R: {estimatedRR}</div>
      </div>
    </div>
  );
};

export default TradeInit;
