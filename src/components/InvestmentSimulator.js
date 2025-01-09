import React, { useState } from 'react';
import axios from 'axios';
import './InvestmentSimulator.css'; 

function InvestmentSimulator() {
  const [balance, setBalance] = useState(10000); 
  const [portfolio, setPortfolio] = useState([]);
  const [selectedStock, setSelectedStock] = useState('');
  const [numShares, setNumShares] = useState(0);
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

  const buyStock = async () => {
    setLoading(true);
    setErrorMessage(''); 
    if (!selectedStock || numShares <= 0) {
      setErrorMessage('Please select a stock and enter the number of shares.');
      setLoading(false);
      return;
    }

    try {
      const response = await axios.get(`https://api.twelvedata.com/time_series?symbol=${selectedStock}&interval=1day&apikey=7b8e5ad369c2468aa1dbcc62e0af2280`);
      const stockPrice = parseFloat(response.data.values[0].close); 
      const totalCost = stockPrice * numShares;

      if (balance >= totalCost) {
        setBalance(balance - totalCost);
        setPortfolio([...portfolio, { symbol: selectedStock, shares: numShares, price: stockPrice }]);
      } else {
        alert("Insufficient funds");
      }
    } catch (error) {
      console.error("Error fetching stock price", error);
      setErrorMessage('Error fetching stock data. Please try again.');
    }
    setLoading(false);
  };

  const sellStock = (symbol) => {
    const stockToSell = portfolio.find(stock => stock.symbol === symbol);
    const stockPrice = stockToSell.price;
    setBalance(balance + stockToSell.shares * stockPrice);
    setPortfolio(portfolio.filter(stock => stock.symbol !== symbol));
  };

  return (
    <div className="investment-simulator">
      <h3>Investment Simulator</h3>
      <p>Balance: ${balance.toFixed(2)}</p>

      <div>
        <label>Select Stock Symbol</label>
        <select
          value={selectedStock}
          onChange={(e) => setSelectedStock(e.target.value)}
        >
          <option value="">Select a stock</option>
          {stocks.map((stock) => (
            <option key={stock.symbol} value={stock.symbol}>
              {stock.name} ({stock.symbol})
            </option>
          ))}
        </select>

        <label>Enter Number of Shares</label>
        <input
          type="number"
          value={numShares}
          onChange={(e) => setNumShares(Number(e.target.value))}
        />
        <button onClick={buyStock} disabled={loading}>Buy Stock</button>
      </div>

      {errorMessage && <p className="error-message">{errorMessage}</p>} 

      <div>
        <h4>Your Portfolio</h4>
        <ul>
          {portfolio.map((stock, index) => (
            <li key={index}>
              {stock.symbol} - {stock.shares} shares @ ${stock.price} each
              <button onClick={() => sellStock(stock.symbol)}>Sell</button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default InvestmentSimulator;
