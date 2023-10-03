import React, { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { calculateSize } from '../../utils/tradeCalculations';

interface SizeCalculatorProps {
  conversionRates: Record<string, number>;
}

const SizeCalculator: React.FC<SizeCalculatorProps> = ({ conversionRates }) => {
  const { control, getValues, watch } = useForm();
  const [calculatedSize, setCalculatedSize] = useState('Incomplete data');

  const formValues = watch(); // Watch for all value changes

  useEffect(() => {
    const handleCalculation = () => {
      const { equity, riskPercent, entry, stopLoss, ticker } = getValues();

      if (equity && riskPercent && entry && stopLoss && ticker) {
        const size = calculateSize(Number(equity), Number(riskPercent), Number(entry), Number(stopLoss), ticker, conversionRates);
        setCalculatedSize(size.toString());
      } else {
        setCalculatedSize('Incomplete data');
      }
    };

    handleCalculation(); // Call this function within useEffect
  }, [getValues, conversionRates, formValues]); // Added formValues to the dependency list

  return (
    <div>
      <h2>Size Calculator</h2>
      <Controller
        name="equity"
        control={control}
        defaultValue=""
        render={({ field }) => <input {...field} placeholder="Equity" type="number" />}
      />
      <Controller
        name="riskPercent"
        control={control}
        defaultValue="1.9"
        render={({ field }) => <input {...field} placeholder="Risk %" type="number" />} // Changed to number
      />
      <Controller
        name="entry"
        control={control}
        defaultValue=""
        render={({ field }) => <input {...field} placeholder="Entry" type="number" />}
      />
      <Controller
        name="stopLoss"
        control={control}
        defaultValue=""
        render={({ field }) => <input {...field} placeholder="Stop Loss" type="number" />}
      />
      <Controller
        name="ticker"
        control={control}
        defaultValue=""
        render={({ field }) => <input {...field} placeholder="Ticker" type="text" />}
      />
      <p>Calculated Size: {calculatedSize}</p>
    </div>
  );
};

export default SizeCalculator;
