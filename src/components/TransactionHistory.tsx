import React, { useState, useEffect } from "react";
import http from "../services/http";
import { useAuth } from "../auth/AuthContext";

const TransactionHistory: React.FC = () => {
  const [transactions, setTransactions] = useState<any[]>([]); // Replace 'any' with your transaction type
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { auth } = useAuth();

  useEffect(() => {
    const fetchTransactions = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await http.get(
          `/api/transactions/${auth.selectedAccount}`,
        );
        setTransactions(response.data.transactions);
        setError(null);
      } catch (error: any) {
        setError(error.message);
      }
      setIsLoading(false);
    };
    fetchTransactions();
  }, [auth]);

  return (
    <div>
      {isLoading && <div>Loading...</div>}
      {error && <div>{error}</div>}
      <table>
        <thead>
          <tr>
            <th>Type</th>
            <th>Amount</th>
            <th>Date</th>
          </tr>
        </thead>
        <tbody>
          {transactions.map((transaction, index) => (
            <tr key={index}>
              <td>{transaction.type}</td>
              <td>{transaction.amount}</td>
              <td>{transaction.date}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default TransactionHistory;
