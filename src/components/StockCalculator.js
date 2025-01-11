import React, { useState, useEffect } from "react";
import Papa from "papaparse"; // For parsing CSV
import Select from "react-select"; // For searchable dropdown
import axios from "axios";
import "./StockCalculator.css";

function StockCalculator() {
  const [stocks, setStocks] = useState([]); // To store stocks parsed from CSV
  const [stockSymbol, setStockSymbol] = useState(null); // Selected stock symbol
  const [numShares, setNumShares] = useState(0); // Number of shares
  const [initialInvestment, setInitialInvestment] = useState(0); // Initial investment
  const [earnings, setEarnings] = useState(null); // Calculated earnings
  const [loading, setLoading] = useState(false); // Loading state
  const [error, setError] = useState(""); // Error message

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

  const calculateEarnings = async () => {
    setError("");
    setEarnings(null);

    if (!stockSymbol || numShares <= 0 || initialInvestment <= 0) {
      setError("Please make sure all fields are filled out correctly.");
      return;
    }

    setLoading(true);
    try {
      const response = await axios.get(
        `https://api.twelvedata.com/time_series?symbol=${stockSymbol.value}&interval=1day&apikey=${TWELVE_DATA_API_KEY}`
      );
      const stockHistory = response.data.values;

      if (!stockHistory || stockHistory.length === 0) {
        setError("No data available for the given stock symbol.");
        setLoading(false);
        return;
      }

      const finalPrice = parseFloat(stockHistory[0].close); // Most recent price
      const earnings = finalPrice * numShares - initialInvestment; // Calculate earnings
      setEarnings(earnings);
    } catch (error) {
      console.error("Error fetching stock data", error);
      setError("Failed to fetch stock data. Please try again later.");
    }
    setLoading(false);
  };

  return (
    <div className="stock-calculator">
      <h3>Stock Calculator</h3>
      <div className="input-container">
        {/* Stock Dropdown */}
        <div className="input-field-group">
          <label>Stock Symbol:</label>
          <Select
            options={stocks}
            value={stockSymbol}
            onChange={(selectedOption) => setStockSymbol(selectedOption)}
            placeholder="Search and select a stock..."
            isClearable
            className="react-select"
          />
        </div>

        {/* Number of Shares */}
        <div className="input-field-group">
          <label>Number of Shares:</label>
          <input
            type="number"
            placeholder="Number of Shares"
            value={numShares}
            onChange={(e) => setNumShares(Number(e.target.value))}
            className="input-field"
          />
        </div>

        {/* Initial Investment */}
        <div className="input-field-group">
          <label>Initial Investment:</label>
          <input
            type="number"
            placeholder="Initial Investment"
            value={initialInvestment}
            onChange={(e) => setInitialInvestment(Number(e.target.value))}
            className="input-field"
          />
        </div>

        <div className="button-container">
          <button onClick={calculateEarnings} disabled={loading}>
            Calculate Earnings
          </button>
        </div>
      </div>

      {error && <p className="error-message">{error}</p>}

      {earnings !== null && !loading && (
        <p className="result">
          Your potential earnings:{" "}
          <span
            style={{
              color: earnings >= 0 ? "green" : "red",
              fontWeight: "bold",
            }}
          >
            ${earnings.toFixed(2)}
          </span>
        </p>
      )}
      {loading && <p className="loading">Loading...</p>}
    </div>
  );
}

export default StockCalculator;
