/**
 * StockComparison.js
 * This component allows users to compare multiple stocks visually
 * by displaying their price histories on a single chart.
 */
import React, { useEffect, useState } from "react";
import Papa from "papaparse";
import axios from "axios";
import Select from "react-select"; // For searchable dropdowns
import "./StockComparison.css";
import { Line } from "react-chartjs-2";

function StockComparison() {
  // State variables
  const [stocks, setStocks] = useState([]); // Available stocks loaded from CSV
  const [stockSymbols, setStockSymbols] = useState([]); // Selected stocks for comparison
  const [comparisonData, setComparisonData] = useState([]); // Processed data for chart
  const [loading, setLoading] = useState(false); // Loading state for API calls
  const [errorMessage, setErrorMessage] = useState(""); // Error message

  const TWELVE_DATA_API_KEY = "7b8e5ad369c2468aa1dbcc62e0af2280"; // API key for stock data

  /**
   * Load available stocks from CSV file on component mount
   */
  useEffect(() => {
    const fetchCSV = async () => {
      const csvUrl = "/data/stocks.csv"; // Path to your CSV file
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
   * Fetches historical price data for all selected stocks
   * Processes the data for chart visualization
   */
  const fetchStockData = async () => {
    // Validate input
    if (stockSymbols.length === 0) {
      setErrorMessage("Please select at least one stock before comparing.");
      return;
    }

    setLoading(true);
    setErrorMessage("");

    try {
      // Create an array of promises for parallel API requests
      const promises = stockSymbols.map((stock) =>
        axios.get(
          `https://api.twelvedata.com/time_series?symbol=${stock.value}&interval=1day&apikey=${TWELVE_DATA_API_KEY}`
        )
      );
      
      // Wait for all API requests to complete
      const results = await Promise.all(promises);

      // Format the response data for the chart
      const formattedData = results.map((response, index) => {
        const data = response.data.values.reverse(); // Reverse to ensure ascending order by date
        return {
          label: stockSymbols[index].label,
          data: data.map((point) => parseFloat(point.close)), // Extract closing prices
          borderColor: `hsl(${index * 60}, 70%, 50%)`, // Dynamic color for each stock line
          fill: false,
          xLabels: data.map((point) => point.datetime), // Extract dates for x-axis
        };
      });

      setComparisonData(formattedData);
    } catch (error) {
      console.error("Error fetching stock data:", error);
      setErrorMessage("Failed to fetch stock data.");
    }

    setLoading(false);
  };

  /**
   * Removes a stock from the comparison list
   * @param {number} index - Index of the stock to remove
   */
  const handleRemoveStock = (index) => {
    const newStockSymbols = [...stockSymbols];
    newStockSymbols.splice(index, 1); // Remove the stock at the specified index
    setStockSymbols(newStockSymbols);
  };

  return (
    <div className="stock-comparison">
      <h3>Stock Comparison Tool</h3>

      {/* Stock Selection Fields */}
      {stockSymbols.map((symbol, index) => (
        <div key={index} className="input-field-group">
          <Select
            options={stocks}
            value={stockSymbols[index]} // Pre-selected stock
            onChange={(selectedOption) => {
              const newStockSymbols = [...stockSymbols];
              newStockSymbols[index] = selectedOption;
              setStockSymbols(newStockSymbols);
            }}
            placeholder="Search and select a stock..."
            isClearable
            className="react-select"
          />
          <button
            onClick={() => handleRemoveStock(index)}
            className="remove-button"
          >
            Remove
          </button>
        </div>
      ))}

      {/* Action Buttons */}
      <div className="buttons-container">
        <button
          onClick={() => setStockSymbols([...stockSymbols, null])} // Add a new empty selection
          className="add-button"
        >
          Add Stock
        </button>
        <button
          onClick={fetchStockData}
          disabled={loading}
          className="compare-button"
        >
          Compare Stocks
        </button>
      </div>

      {/* Loading and Error States */}
      {loading && <p className="loading">Loading data...</p>}
      {errorMessage && <p className="error-message">{errorMessage}</p>}

      {/* Comparison Chart */}
      {comparisonData.length > 0 && (
        <div className="chart-container">
          <Line
            data={{
              labels: comparisonData[0].xLabels, // Use dates from the first stock
              datasets: comparisonData,
            }}
            options={{
              responsive: true,
              plugins: {
                legend: {
                  display: true,
                  position: "bottom",
                },
              },
              scales: {
                x: { title: { display: true, text: "Date" } },
                y: { title: { display: true, text: "Price (USD)" } },
              },
            }}
          />
        </div>
      )}
    </div>
  );
}

export default StockComparison;