import React, { useState, useEffect, ChangeEvent, FormEvent } from 'react';
import axios from 'axios';

const port = process.env.REACT_APP_APIPORT || 3001;
const url = process.env.REACT_APP_APIURL || `http://localhost:${port}`;

const http = axios.create({
  baseURL: url,
  headers: {
    'Content-type': 'application/json',
  },
});

interface Trade {
  ID: number;
  datetime_opened: string;
  datetime_closed: string;
  ticker: string;
  // Add the rest of the trade properties
}

const TradeJournal: React.FC = () => {
  const [trades, setTrades] = useState<Trade[]>([]);
  const [newTrade, setNewTrade] = useState<{ ticker: string }>({ ticker: '' });

  useEffect(() => {
    const fetchTrades = async () => {
      try {
        const response = await http.get<Trade[]>('/api/trades');
        setTrades(response.data);
      } catch (error) {
        console.error('Error fetching trades:', error);
      }
    };

    fetchTrades();
  }, []);

  const submitForm = async (e: FormEvent) => {
    e.preventDefault();
    try {
      const response = await http.post<Trade>('/api/trades', newTrade);

      if (response.status === 201) {
        const trade = response.data;
        setTrades([...trades, trade]);
        setNewTrade({ ticker: '' });
      } else {
        console.error('Error creating trade:', response.statusText);
      }
    } catch (error) {
      console.error('Error creating trade:', error);
    }
  };

  return (
    <div>
      <h1>Trade Journal</h1>
      <form onSubmit={submitForm}>
        <input
          type="text"
          placeholder="Ticker"
          value={newTrade.ticker}
          onChange={(e: ChangeEvent<HTMLInputElement>) =>
            setNewTrade({ ...newTrade, ticker: e.target.value })
          }
        />
        {/* Add other form fields for the other trade properties */}
        <button type="submit">Add Trade</button>
      </form>
      <table>
        <thead>
          <tr>
            <th>Ticker</th>
            {/* Add other headers for the other trade properties */}
          </tr>
        </thead>
        <tbody>
          {trades.map((trade) => (
            <tr key={trade.ID}>
              <td>{trade.ticker}</td>
              {/* Add other table cells for the other trade properties */}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default TradeJournal;
