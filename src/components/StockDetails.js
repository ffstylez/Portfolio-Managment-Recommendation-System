import React, { useEffect, useState } from 'react';
import Papa from 'papaparse';
import { useParams, useNavigate } from 'react-router-dom';
import { Line } from 'react-chartjs-2';
import axios from 'axios';
import 'chart.js/auto';
import './StockDetails.css';

const TWELVE_DATA_API_KEY = '7b8e5ad369c2468aa1dbcc62e0af2280';

function StockDetails() {
  const [stockDetails, setStockDetails] = useState(null);
  const [stockGraphData, setStockGraphData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timeframe, setTimeframe] = useState('30');
  const { stockName } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    Papa.parse('/data/stocks.csv', {
      download: true,
      header: true,
      complete: (results) => {
        const stock = results.data.find(
          (stock) => stock['Stock Ticker'] === stockName
        );
        if (stock) {
          setStockDetails(stock);
          fetchStockGraphData(stock['Stock Ticker'], timeframe);
        } else {
          setError('Stock not found!');
        }
        setLoading(false);
      },
      error: (error) => {
        console.error('Error parsing CSV:', error);
        setError('Failed to load stock data.');
        setLoading(false);
      },
    });
  }, [stockName, timeframe]);

  const fetchStockGraphData = async (ticker, timeframe) => {
    try {
      const daysAgo = (days) => {
        const date = new Date();
        date.setDate(date.getDate() - days);
        return date.toISOString().split('T')[0];
      };

      const daysMapping = {
        '7': 7,      // 1 Week
        '30': 30,    // 1 Month
        '90': 90,    // 3 Months
        '180': 180,  // 6 Months
        '365': 365,  // 1 Year
        '730': 730,  // 2 Years
        '1825': 1825, // 5 Years

      };
      

      const days = daysMapping[timeframe];

      const params = {
        symbol: ticker,
        interval: '1day',
        apikey: TWELVE_DATA_API_KEY,
      };

      if (days !== null) {
        params.start_date = daysAgo(days);
      }

      const response = await axios.get(`https://api.twelvedata.com/time_series`, {
        params,
      });

      const { values } = response.data;
      if (!values) {
        setError('No data available for the selected stock.');
        return;
      }

      const labels = values.map((entry) => entry.datetime);
      const data = values.map((entry) => parseFloat(entry.close));

      setStockGraphData({
        labels,
        datasets: [
          {
            label: `${ticker} Stock Price`,
            data,
            borderColor: 'rgba(75, 192, 192, 1)',
            backgroundColor: 'rgba(75, 192, 192, 0.2)',
            tension: 0.4,
          },
        ],
      });
    } catch (error) {
      console.error('Error fetching stock graph data:', error);
      setError('Failed to fetch stock graph data.');
    }
  };

  const handleTimeframeChange = (event) => {
    setTimeframe(event.target.value);
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <div className="stock-details-page">
      <div className="stock-details-container">
        <h1>{stockDetails['Stock Ticker']} - {stockDetails['Stock Name']}</h1>

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

        <div className="stock-info">
          <p><strong>Category:</strong> {stockDetails['Category']}</p>
          <p><strong>Explanation:</strong> {stockDetails['Stock Explain']}</p>
          <p><strong>Resources:</strong> <a href={stockDetails['Resources']} target="_blank" rel="noopener noreferrer">{stockDetails['Resources']}</a></p>
        </div>

        <button 
          onClick={() => navigate('/stockboard')} 
          className="return-button">
          Back to Stock Board
        </button>
      </div>
    </div>
  );
}

export default StockDetails;
