/**
 * InvestmentSimulator.js
 * This component provides a simulated investment environment where users can
 * buy virtual stocks and track their portfolio performance.
 */
import React, { useState, useEffect } from "react";
import Papa from "papaparse"; // For parsing CSV
import Select from "react-select"; // For searchable dropdown
import axios from "axios";
import { Pie } from "react-chartjs-2"; // For the pie chart
import "./InvestmentSimulator.css";

function InvestmentSimulator() {
  // State variables
  const [stocks, setStocks] = useState([]); // Available stocks loaded from CSV
  const [balance, setBalance] = useState(10000); // User's virtual balance
  const [portfolio, setPortfolio] = useState([]); // User's virtual stock portfolio
  const [selectedStock, setSelectedStock] = useState(null); // Currently selected stock
  const [numShares, setNumShares] = useState(0); // Number of shares to buy/sell
  const [loading, setLoading] = useState(false); // Loading state for API calls
  const [errorMessage, setErrorMessage] = useState(""); // Error message display

  const TWELVE_DATA_API_KEY = "7b8e5ad369c2468aa1dbcc62e0af2280"; // API key for stock data

  /**
   * Load available stocks from CSV file on component mount
   */
  useEffect(() => {
    const fetchCSV = async () => {
      const csvUrl = "/data/stocks.csv"; // Path to the CSV file
      const response = await fetch(csvUrl);
      const csvText = await response.text();

      // Parse the CSV file
      Papa.parse(csvText, {
        header: true,
        complete: (result) => {
          // Transform CSV data into format for react-select
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

  /**
   * Handles buying stocks
   * Validates input, fetches current price, and updates portfolio
   */
  const buyStock = async () => {
    setLoading(true);
    setErrorMessage("");

    // Input validation
    if (!selectedStock || numShares <= 0) {
      setErrorMessage("Please select a stock and enter the number of shares.");
      setLoading(false);
      return;
    }

    try {
      // Fetch current stock price from API
      const response = await axios.get(
        `https://api.twelvedata.com/time_series?symbol=${selectedStock.value}&interval=1day&apikey=${TWELVE_DATA_API_KEY}`
      );
      const stockPrice = parseFloat(response.data.values[0].close); // Most recent closing price
      const totalCost = stockPrice * numShares;

      // Check if user has enough balance
      if (balance >= totalCost) {
        // Update balance
        setBalance(balance - totalCost); 
        
        // Add stock to portfolio
        setPortfolio([
          ...portfolio,
          { symbol: selectedStock.value, shares: numShares, price: stockPrice },
        ]); 
      } else {
        setErrorMessage("Insufficient funds.");
      }
    } catch (error) {
      console.error("Error fetching stock price:", error);
      setErrorMessage("Failed to fetch stock data. Please try again later.");
    }
    setLoading(false);
  };

  /**
   * Handles selling stocks from portfolio
   * @param {string} symbol - Stock symbol to sell
   */
  const sellStock = (symbol) => {
    // Find the stock in portfolio
    const stockToSell = portfolio.find((stock) => stock.symbol === symbol);
    const stockPrice = stockToSell.price;

    // Update balance with sale proceeds
    setBalance(balance + stockToSell.shares * stockPrice);

    // Remove stock from portfolio
    setPortfolio(portfolio.filter((stock) => stock.symbol !== symbol));
  };

  /**
   * Prepares data for the pie chart visualization
   * @returns {Object} Chart.js data object
   */
  const pieChartData = () => {
    // Calculate total portfolio value
    const totalValue = portfolio.reduce(
      (sum, stock) => sum + stock.shares * stock.price,
      0
    );

    // Calculate percentages for each stock
    const labels = portfolio.map((stock) => stock.symbol);
    const data = portfolio.map(
      (stock) => ((stock.shares * stock.price) / totalValue) * 100
    );

    // Return in Chart.js format
    return {
      labels,
      datasets: [
        {
          data,
          backgroundColor: [
            "#FF6384",
            "#36A2EB",
            "#FFCE56",
            "#4BC0C0",
            "#9966FF",
          ],
          hoverBackgroundColor: [
            "#FF6384",
            "#36A2EB",
            "#FFCE56",
            "#4BC0C0",
            "#9966FF",
          ],
        },
      ],
    };
  };

  return (
    <div className="investment-simulator">
      <h3>Investment Simulator</h3>
      <p>Balance: ${balance.toFixed(2)}</p>

      {/* Stock Selection Form */}
      <div className="input-container">
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

        <div className="button-container">
          <button onClick={buyStock} disabled={loading}>
            Buy Stock
          </button>
        </div>
      </div>

      {/* Error message display */}
      {errorMessage && <p className="error-message">{errorMessage}</p>}

      {/* Portfolio Display */}
      <div>
        <h4>Your Portfolio</h4>
        {portfolio.length === 0 ? (
          <p>Your portfolio is empty.</p>
        ) : (
          <ul>
            {portfolio.map((stock, index) => (
              <li key={index}>
                {stock.symbol} - {stock.shares} shares @ ${stock.price.toFixed(
                  2
                )}{" "}
                each
                <button onClick={() => sellStock(stock.symbol)}>Sell</button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Portfolio Allocation Chart */}
      {portfolio.length > 0 && (
        <div className="chart-container">
          <h4>Portfolio Allocation</h4>
          <Pie data={pieChartData()} />
        </div>
      )}
    </div>
  );
}

export default InvestmentSimulator;