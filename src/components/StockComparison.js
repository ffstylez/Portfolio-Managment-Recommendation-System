import React, { useState } from 'react';
import axios from 'axios';
import './StockComparison.css';

function StockComparison() {
  const [stockSymbols, setStockSymbols] = useState([]);
  const [comparisonData, setComparisonData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');  

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

  const fetchStockData = async () => {
    if (stockSymbols.some(symbol => symbol.trim() === '')) {
      setErrorMessage('Please enter all stock symbols before comparing.');
      return;
    }

    setLoading(true);
    setErrorMessage(''); 

    try {
      const promises = stockSymbols.map(symbol => 
        axios.get(`https://api.twelvedata.com/time_series?symbol=${symbol}&interval=1day&apikey=7b8e5ad369c2468aa1dbcc62e0af2280`)
      );
      const results = await Promise.all(promises);
      setComparisonData(results.map(res => res.data));
    } catch (error) {
      console.error("Error fetching stock data", error);
    }
    setLoading(false);
  };

  const handleAddStock = () => {
    setStockSymbols([...stockSymbols, '']);
  };

  const handleSymbolChange = (index, value) => {
    const newSymbols = [...stockSymbols];
    newSymbols[index] = value;
    setStockSymbols(newSymbols);
  };

  return (
    <div className="stock-comparison">
      <h3>Stock Comparison Tool</h3>
      {stockSymbols.map((symbol, index) => (
        <div key={index} className="input-field-group">
          <select
            value={symbol}
            onChange={(e) => handleSymbolChange(index, e.target.value)}
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
      ))}
      <div className="buttons-container">
        <button onClick={handleAddStock} className="add-button">Add Stock</button>
        <button onClick={fetchStockData} disabled={loading} className="compare-button">Compare Stocks</button>
      </div>

      {loading && <p className="loading">Loading data...</p>}
      {errorMessage && <p className="error-message">{errorMessage}</p>}

      {comparisonData.length > 0 && (
        <table className="comparison-table">
          <thead>
            <tr>
              <th>Stock Symbol</th>
              <th>Close Price</th>
              <th>Open Price</th>
              <th>High</th>
              <th>Low</th>
            </tr>
          </thead>
          <tbody>
            {comparisonData.map((stock, index) => (
              <tr key={index}>
                <td>{stock.symbol}</td>
                <td>{stock.values[0].close}</td>
                <td>{stock.values[0].open}</td>
                <td>{stock.values[0].high}</td>
                <td>{stock.values[0].low}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default StockComparison;
