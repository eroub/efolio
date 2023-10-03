import React from 'react';
import { useForm } from 'react-hook-form';
import { calculatePipDifference } from '../../utils/tradeCalculations';

const PipCalculator = () => {
  const { register, watch } = useForm();
  const num1 = watch('num1');
  const num2 = watch('num2');

  const pipDifference = num1 && num2 ? 
    calculatePipDifference(num1, num2) : 
    'Enter both numbers';

  return (
    <div>
      <h2>PIP Difference Calculator</h2>
      <input {...register('num1')} placeholder="First Number" type="number" />
      <input {...register('num2')} placeholder="Second Number" type="number" />
      <p>Calculated PIP Difference: {pipDifference}</p>
    </div>
  );
};

export default PipCalculator;
