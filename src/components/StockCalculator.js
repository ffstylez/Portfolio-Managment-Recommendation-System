import React, { useState } from 'react';
import axios from 'axios';
import './StockCalculator.css'; 

function StockCalculator() {
  const [stockSymbol, setStockSymbol] = useState('');
  const [numShares, setNumShares] = useState(0);
  const [initialInvestment, setInitialInvestment] = useState(0);
  const [earnings, setEarnings] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(''); 

  const stocks = [
    { symbol: 'AAPL', name: 'Apple' },
    { symbol: 'GOOGL', name: 'Google' },
    { symbol: 'MSFT', name: 'Microsoft' },
    { symbol: 'NVDA', name: 'Nvidia' },
    { symbol: 'TSM', name: 'TSMC' },
    { symbol: 'INTC', name: 'Intel' },
    { symbol: 'AMD', name: 'AMD' },
    { symbol: 'CSCO', name: 'Cisco' },
    { symbol: 'ORCL', name: 'Oracle' },
    { symbol: 'META', name: 'Meta' },
    { symbol: 'PFE', name: 'Pfizer' },
    { symbol: 'JNJ', name: 'Johnson & Johnson' },
    { symbol: 'MRK', name: 'Merck' },
    { symbol: 'ABBV', name: 'AbbVie' },
    { symbol: 'BMY', name: 'Bristol Myers Squibb' },
    { symbol: 'GSK', name: 'GlaxoSmithKline' },
    { symbol: 'LLY', name: 'Eli Lilly' },
    { symbol: 'CVS', name: 'CVS Health' },
    { symbol: 'AMGN', name: 'Amgen' },
    { symbol: 'MDT', name: 'Medtronic' },
    { symbol: 'JPM', name: 'JPMorgan Chase' },
    { symbol: 'BAC', name: 'Bank of America' },
    { symbol: 'WFC', name: 'Wells Fargo' },
    { symbol: 'C', name: 'Citigroup' },
    { symbol: 'GS', name: 'Goldman Sachs' },
    { symbol: 'MS', name: 'Morgan Stanley' },
    { symbol: 'USB', name: 'U.S. Bancorp' },
    { symbol: 'AXP', name: 'American Express' },
    { symbol: 'V', name: 'Visa' },
    { symbol: 'MA', name: 'Mastercard' },
    { symbol: 'XOM', name: 'ExxonMobil' },
    { symbol: 'TOT', name: 'TotalEnergies' },
    { symbol: 'CVX', name: 'Chevron' },
    { symbol: 'BP', name: 'BP' },
    { symbol: 'SLB', name: 'Schlumberger' },
    { symbol: 'ENB', name: 'Enbridge' },
    { symbol: 'PXD', name: 'Pioneer Natural Resources' },
    { symbol: 'COP', name: 'ConocoPhillips' },
    { symbol: 'OXY', name: 'Occidental Petroleum' },
    { symbol: 'KO', name: 'Coca-Cola' },
    { symbol: 'PEP', name: 'PepsiCo' },
    { symbol: 'PG', name: 'Procter & Gamble' },
    { symbol: 'TGT', name: 'Target' },
    { symbol: 'WMT', name: 'Walmart' },
    { symbol: 'COST', name: 'Costco' },
    { symbol: 'MCD', name: 'McDonald’s' },
    { symbol: 'DIS', name: 'Disney' },
    { symbol: 'SBUX', name: 'Starbucks' },
    { symbol: 'CL', name: 'Colgate-Palmolive' }
  ];

  const calculateEarnings = async () => {
    setError('');
    setEarnings(null);

    if (!stockSymbol || numShares <= 0 || initialInvestment <= 0) {
      setError('Please make sure all fields are filled out correctly.');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.get(
        `https://api.twelvedata.com/time_series?symbol=${stockSymbol}&interval=1day&apikey=7b8e5ad369c2468aa1dbcc62e0af2280`
      );
      const stockHistory = response.data.values; 

      if (!stockHistory || stockHistory.length === 0) {
        setError('No data available for the given stock symbol.');
        setLoading(false);
        return;
      }

      const finalPrice = parseFloat(stockHistory[0].close); 
      const earnings = (finalPrice * numShares) - initialInvestment; 
      setEarnings(earnings);
    } catch (error) {
      console.error('Error fetching stock data', error);
      setError('Failed to fetch stock data. Please try again later.');
    }
    setLoading(false);
  };

  return (
    <div className="stock-calculator">
      <h3>Stock Calculator</h3>
      <div className="input-container">
        <div className="input-field-group">
          <label>Stock Symbol</label>
          <select
            value={stockSymbol}
            onChange={(e) => setStockSymbol(e.target.value)}
            className="input-field"
          >
            <option value="">Select a stock</option>
            {stocks.map((stock) => (
              <option key={stock.symbol} value={stock.symbol}>
                {stock.name} ({stock.symbol})
              </option>
            ))}
          </select>
        </div>

        <div className="input-field-group">
          <label>Number of Shares</label>
          <input
            type="number"
            placeholder="Number of Shares"
            value={numShares}
            onChange={(e) => setNumShares(e.target.value)}
            className="input-field"
          />
        </div>

        <div className="input-field-group">
          <label>Initial Investment</label>
          <input
            type="number"
            placeholder="Initial Investment"
            value={initialInvestment}
            onChange={(e) => setInitialInvestment(e.target.value)}
            className="input-field"
          />
        </div>

        <button onClick={calculateEarnings} disabled={loading}>Calculate Earnings</button>
      </div>

      {error && <p className="error-message">{error}</p>}

      {earnings !== null && !loading && (
        <p className="result">Your potential earnings: ${earnings.toFixed(2)}</p>
      )}
      {loading && <p className="loading">Loading...</p>}
    </div>
  );
}

export default StockCalculator;
