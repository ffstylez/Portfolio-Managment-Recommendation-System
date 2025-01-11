import React, { useState, useEffect } from "react";
import Papa from "papaparse"; // For parsing CSV
import Select from "react-select"; // For searchable dropdown
import axios from "axios";
import "./InvestmentSimulator.css";

function InvestmentSimulator() {
  const [stocks, setStocks] = useState([]); // Stocks loaded from CSV
  const [balance, setBalance] = useState(10000); // User's balance
  const [portfolio, setPortfolio] = useState([]); // User's portfolio
  const [selectedStock, setSelectedStock] = useState(null); // Selected stock
  const [numShares, setNumShares] = useState(0); // Number of shares to buy/sell
  const [loading, setLoading] = useState(false); // Loading state
  const [errorMessage, setErrorMessage] = useState(""); // Error message

  const TWELVE_DATA_API_KEY = "7b8e5ad369c2468aa1dbcc62e0af2280"; // Your Twelve Data API Key

  // Load stocks from CSV
  useEffect(() => {
    const fetchCSV = async () => {
      const csvUrl = "/data/stocks.csv"; // Path to the CSV file
      const response = await fetch(csvUrl);
      const csvText = await response.text();

      // Parse the CSV
      Papa.parse(csvText, {
        header: true,
        complete: (result) => {
          const stockList = result.data.map((row) => ({
            value: row["Stock Ticker"],
            label: `${row["Stock Name"]} (${row["Stock Ticker"]})`,
          }));
          setStocks(stockList);
        },
        error: (error) => {
          console.error("Error parsing CSV:", error);
        },
      });
    };

    fetchCSV();
  }, []);

  const buyStock = async () => {
    setLoading(true);
    setErrorMessage("");

    if (!selectedStock || numShares <= 0) {
      setErrorMessage("Please select a stock and enter the number of shares.");
      setLoading(false);
      return;
    }

    try {
      const response = await axios.get(
        `https://api.twelvedata.com/time_series?symbol=${selectedStock.value}&interval=1day&apikey=${TWELVE_DATA_API_KEY}`
      );
      const stockPrice = parseFloat(response.data.values[0].close); // Most recent price
      const totalCost = stockPrice * numShares;

      if (balance >= totalCost) {
        setBalance(balance - totalCost); // Deduct cost from balance
        setPortfolio([
          ...portfolio,
          { symbol: selectedStock.value, shares: numShares, price: stockPrice },
        ]); // Add stock to portfolio
      } else {
        setErrorMessage("Insufficient funds.");
      }
    } catch (error) {
      console.error("Error fetching stock price:", error);
      setErrorMessage("Failed to fetch stock data. Please try again later.");
    }
    setLoading(false);
  };

  const sellStock = (symbol) => {
    const stockToSell = portfolio.find((stock) => stock.symbol === symbol);
    const stockPrice = stockToSell.price;

    // Update balance
    setBalance(balance + stockToSell.shares * stockPrice);

    // Remove stock from portfolio
    setPortfolio(portfolio.filter((stock) => stock.symbol !== symbol));
  };

  return (
    <div className="investment-simulator">
      <h3>Investment Simulator</h3>
      <p>Balance: ${balance.toFixed(2)}</p>

      <div>
        {/* Searchable Dropdown for Stock Selection */}
        <label>Select Stock Symbol:</label>
        <Select
          options={stocks}
          value={selectedStock}
          onChange={(selectedOption) => setSelectedStock(selectedOption)}
          placeholder="Search and select a stock..."
          isClearable
          className="react-select"
        />

        <label>Enter Number of Shares:</label>
        <input
          type="number"
          value={numShares}
          onChange={(e) => setNumShares(Number(e.target.value))}
          placeholder="Enter number of shares"
        />

        <button onClick={buyStock} disabled={loading}>
          Buy Stock
        </button>
      </div>

      {errorMessage && <p className="error-message">{errorMessage}</p>}

      <div>
        <h4>Your Portfolio</h4>
        {portfolio.length === 0 ? (
          <p>Your portfolio is empty.</p>
        ) : (
          <ul>
            {portfolio.map((stock, index) => (
              <li key={index}>
                {stock.symbol} - {stock.shares} shares @ ${stock.price.toFixed(2)} each
                <button onClick={() => sellStock(stock.symbol)}>Sell</button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

export default InvestmentSimulator;
