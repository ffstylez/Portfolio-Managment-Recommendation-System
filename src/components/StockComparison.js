import React, { useState } from "react";
import axios from "axios";
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
import { Line } from 'react-chartjs-2';
import './StockComparison.css';

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

function StockComparison() {
  const [stockSymbols, setStockSymbols] = useState([]);
  const [comparisonData, setComparisonData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const stocks = [
    { symbol: 'AAPL', name: 'Apple' },
    { symbol: 'GOOGL', name: 'Google' },
    { symbol: 'MSFT', name: 'Microsoft' },
    { symbol: 'NVDA', name: 'Nvidia' },
    { symbol: 'TSM', name: 'TSMC' },
    { symbol: 'INTC', name: 'Intel' },
    { symbol: 'AMD', name: 'AMD' },
    { symbol: 'META', name: 'Meta' },
    { symbol: 'PFE', name: 'Pfizer' },
    { symbol: 'JNJ', name: 'Johnson & Johnson' },
  ];

  const fetchStockData = async () => {
    if (stockSymbols.some(symbol => symbol.trim() === '')) {
      setErrorMessage("Please select all stock symbols before comparing.");
      return;
    }

    setLoading(true);
    setErrorMessage("");

    try {
      const promises = stockSymbols.map((symbol) =>
        axios.get(`https://api.twelvedata.com/time_series?symbol=${symbol}&interval=1day&apikey=7b8e5ad369c2468aa1dbcc62e0af2280`)
      );
      const results = await Promise.all(promises);
      const data = results.map((res, index) => ({
        symbol: stockSymbols[index],
        name: stocks.find((s) => s.symbol === stockSymbols[index])?.name || stockSymbols[index],
        values: res.data.values.reverse(), // Reverse for chronological order
      }));
      setComparisonData(data);
    } catch (error) {
      console.error("Error fetching stock data", error);
      setErrorMessage("Failed to fetch stock data.");
    } finally {
      setLoading(false);
    }
  };

  const handleAddStock = () => {
    setStockSymbols([...stockSymbols, ""]);
  };

  const handleSymbolChange = (index, value) => {
    const newSymbols = [...stockSymbols];
    newSymbols[index] = value;
    setStockSymbols(newSymbols);
  };

  // Prepare data for the chart
  const chartData = {
    labels: comparisonData[0]?.values.map((val) => val.datetime) || [], // Dates
    datasets: comparisonData.map((stock, index) => ({
      label: stock.name,
      data: stock.values.map((val) => parseFloat(val.close)), // Close prices
      borderColor: `rgba(${(index * 50) % 255}, ${(index * 100) % 255}, ${(index * 150) % 255}, 0.6)`,
      backgroundColor: `rgba(${(index * 50) % 255}, ${(index * 100) % 255}, ${(index * 150) % 255}, 0.2)`,
      borderWidth: 2,
    })),
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: "top",
      },
      title: {
        display: true,
        text: "Stock Comparison - Close Prices Over Time",
      },
    },
    scales: {
      x: {
        title: {
          display: true,
          text: "Date",
        },
      },
      y: {
        title: {
          display: true,
          text: "Close Price",
        },
      },
    },
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
        <div className="chart-container">
          <Line data={chartData} options={chartOptions} />
        </div>
      )}
    </div>
  );
}

export default StockComparison;
