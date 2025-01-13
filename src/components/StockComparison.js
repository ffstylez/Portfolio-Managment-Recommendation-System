import React, { useEffect, useState } from "react";
import Papa from "papaparse";
import axios from "axios";
import Select from "react-select"; // Import react-select
import "./StockComparison.css";
import { Line } from "react-chartjs-2";

function StockComparison() {
  const [stocks, setStocks] = useState([]); // To store the parsed stocks from CSV
  const [stockSymbols, setStockSymbols] = useState([]); // Selected stock symbols
  const [comparisonData, setComparisonData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const TWELVE_DATA_API_KEY = "7b8e5ad369c2468aa1dbcc62e0af2280"; // Your Twelve Data API Key

  // Load the CSV file
  useEffect(() => {
    const fetchCSV = async () => {
      const csvUrl = "/data/stocks.csv"; // Path to your CSV file
      const response = await fetch(csvUrl);
      const csvText = await response.text();

      // Parse the CSV file
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

  const fetchStockData = async () => {
    if (stockSymbols.length === 0) {
      setErrorMessage("Please select at least one stock before comparing.");
      return;
    }

    setLoading(true);
    setErrorMessage("");

    try {
      const promises = stockSymbols.map((stock) =>
        axios.get(
          `https://api.twelvedata.com/time_series?symbol=${stock.value}&interval=1day&apikey=${TWELVE_DATA_API_KEY}`
        )
      );
      const results = await Promise.all(promises);

      const formattedData = results.map((response, index) => {
        const data = response.data.values.reverse(); // Ensure ascending order
        return {
          label: stockSymbols[index].label,
          data: data.map((point) => parseFloat(point.close)),
          borderColor: `hsl(${index * 60}, 70%, 50%)`, // Dynamic color for each stock
          fill: false,
          xLabels: data.map((point) => point.datetime),
        };
      });

      setComparisonData(formattedData);
    } catch (error) {
      console.error("Error fetching stock data:", error);
      setErrorMessage("Failed to fetch stock data.");
    }

    setLoading(false);
  };

  const handleRemoveStock = (index) => {
    const newStockSymbols = [...stockSymbols];
    newStockSymbols.splice(index, 1); // Remove the stock at the specified index
    setStockSymbols(newStockSymbols);
  };

  return (
    <div className="stock-comparison">
      <h3>Stock Comparison Tool</h3>

      {/* Stock Selection */}
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

      <div className="buttons-container">
        <button
          onClick={() => setStockSymbols([...stockSymbols, null])} // Add a new stock selection field
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

      {loading && <p className="loading">Loading data...</p>}
      {errorMessage && <p className="error-message">{errorMessage}</p>}

      {comparisonData.length > 0 && (
        <div className="chart-container">
          <Line
            data={{
              labels: comparisonData[0].xLabels, // Use xLabels from the first stock
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
