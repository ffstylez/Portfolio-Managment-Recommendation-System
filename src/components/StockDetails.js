/**
 * StockDetails.js
 * This component displays detailed information about a specific stock,
 * including a price chart with adjustable timeframes and additional stock information.
 */
import React, { useEffect, useState } from "react";
import Papa from "papaparse";
import { useParams, useNavigate } from "react-router-dom";
import { Line } from "react-chartjs-2";
import axios from "axios";
import "chart.js/auto";
import "./StockDetails.css";

const TWELVE_DATA_API_KEY = "7b8e5ad369c2468aa1dbcc62e0af2280"; // API key for stock data

function StockDetails() {
  // State variables
  const [stockDetails, setStockDetails] = useState(null); // Stock information from CSV
  const [stockGraphData, setStockGraphData] = useState(null); // Processed chart data
  const [loading, setLoading] = useState(true); // Loading state
  const [error, setError] = useState(null); // Error state
  const [timeframe, setTimeframe] = useState("30"); // Selected time period (default: 30 days)
  
  // URL parameters and navigation
  const { stockName } = useParams(); // Extract stock symbol from URL
  const navigate = useNavigate(); // React Router navigation hook

  /**
   * Load stock details from CSV and fetch chart data on component mount
   * Re-fetch when timeframe changes
   */
  useEffect(() => {
    // Parse CSV to get stock details
    Papa.parse("/data/stocks.csv", {
      download: true,
      header: true,
      complete: (results) => {
        // Find the specific stock by ticker
        const stock = results.data.find(
          (stock) => stock["Stock Ticker"] === stockName
        );
        if (stock) {
          setStockDetails(stock);
          fetchStockGraphData(stock["Stock Ticker"], timeframe);
        } else {
          setError("Stock not found!");
        }
        setLoading(false);
      },
      error: (error) => {
        console.error("Error parsing CSV:", error);
        setError("Failed to load stock data.");
        setLoading(false);
      },
    });
  }, [stockName, timeframe]); // Re-fetch when stock or timeframe changes

  /**
   * Fetches historical price data for the selected stock and timeframe
   * @param {string} ticker - Stock symbol
   * @param {string} timeframe - Time period in days
   */
  const fetchStockGraphData = async (ticker, timeframe) => {
    try {
      // Helper function to calculate date N days ago
      const daysAgo = (days) => {
        const date = new Date();
        date.setDate(date.getDate() - days);
        return date.toISOString().split("T")[0];
      };

      // Map dropdown values to number of days
      const daysMapping = {
        7: 7, // 1 Week
        30: 30, // 1 Month
        90: 90, // 3 Months
        180: 180, // 6 Months
        365: 365, // 1 Year
        730: 730, // 2 Years
        1825: 1825, // 5 Years
      };

      const days = daysMapping[timeframe];

      // Set up API request parameters
      const params = {
        symbol: ticker,
        interval: "1day",
        apikey: TWELVE_DATA_API_KEY,
      };

      // Add start_date if days is defined
      if (days !== null) {
        params.start_date = daysAgo(days);
      }

      // Fetch data from API
      const response = await axios.get(
        `https://api.twelvedata.com/time_series`,
        {
          params,
        }
      );

      const { values } = response.data;
      if (!values) {
        setError("No data available for the selected stock.");
        return;
      }

      // Process data for Chart.js
      const labels = values.map((entry) => entry.datetime).reverse(); // Dates for x-axis
      const data = values.map((entry) => parseFloat(entry.close)); // Closing prices

      // Format data for Chart.js
      setStockGraphData({
        labels,
        datasets: [
          {
            label: `${ticker} Stock Price`,
            data,
            borderColor: "rgba(75, 192, 192, 1)",
            backgroundColor: "rgba(75, 192, 192, 0.2)",
            tension: 0.4,
          },
        ],
      });
    } catch (error) {
      console.error("Error fetching stock graph data:", error);
      setError("Failed to fetch stock graph data.");
    }
  };

  /**
   * Handles timeframe dropdown changes
   * @param {Event} event - Change event from select element
   */
  const handleTimeframeChange = (event) => {
    setTimeframe(event.target.value);
  };

  // Show loading state
  if (loading) {
    return <div>Loading...</div>;
  }

  // Show error state
  if (error) {
    return <div>{error}</div>;
  }

  return (
    <div className="stock-details-page">
      <div className="stock-details-container">
        {/* Stock Header */}
        <h1>
          {stockDetails["Stock Ticker"]} - {stockDetails["Stock Name"]}
        </h1>

        {/* Timeframe Selector */}
        <div className="timeframe-selector">
          <label htmlFor="timeframe">Select Timeframe:</label>
          <select
            id="timeframe"
            value={timeframe}
            onChange={handleTimeframeChange}
            className="timeframe-dropdown"
          >
            <option value="7">1 Week</option>
            <option value="30">1 Month</option>
            <option value="90">3 Months</option>
            <option value="180">6 Months</option>
            <option value="365">1 Year</option>
            <option value="730">2 Years</option>
            <option value="1825">5 Years</option>
          </select>
        </div>

        {/* Stock Price Chart */}
        <div className="graph-section">
          <h3>Price Chart</h3>
          {stockGraphData ? (
            <Line data={stockGraphData} />
          ) : (
            <div className="graph-placeholder">
              <p>Loading graph data...</p>
            </div>
          )}
        </div>

        {/* Additional Stock Information */}
        <div className="stock-info">
          <p>
            <strong>Category:</strong> {stockDetails["Category"]}
          </p>
          <p>
            <strong>Explanation:</strong> {stockDetails["Stock Explain"]}
          </p>
          <p>
            <strong>Resources:</strong>{" "}
            <a
              href={stockDetails["Resources"]}
              target="_blank"
              rel="noopener noreferrer"
            >
              {stockDetails["Resources"]}
            </a>
          </p>
        </div>

        {/* Navigation Button */}
        <button
          onClick={() => navigate("/stockboard/" + localStorage.getItem("storedFor"))}
          className="return-button"
        >
          Back to User Profiles
        </button>
      </div>
    </div>
  );
}

export default StockDetails;