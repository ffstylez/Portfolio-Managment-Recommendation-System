/**
 * PortfolioChart.js
 * This component creates a line chart visualization of portfolio value over time.
 * It fetches historical data for stocks in the portfolio and calculates combined value.
 */
import React, { useState, useEffect } from 'react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';
import axios from 'axios';
import { RotatingLines } from "react-loader-spinner";

/**
 * @param {Array} tickers - Array of stock symbols in portfolio
 * @param {Array} weights - Array of weights corresponding to each stock
 * @param {Object} priceBuy - Object mapping stock symbols to purchase prices
 * @param {number} initialInvestment - Initial investment amount
 */
function PortfolioChart({ tickers, weights, priceBuy, initialInvestment }) {
  // State variables
  const [chartData, setChartData] = useState([]); // Historical portfolio value data
  const [timeInterval, setTimeInterval] = useState('1m'); // Time interval filter (default: 1 month)
  const [isLoading, setIsLoading] = useState(true); // Loading state
  const [error, setError] = useState(null); // Error state

  /**
   * Converts time interval string to number of days
   * @param {string} interval - Time interval code
   * @returns {number} - Equivalent number of days
   */
  const intervalToDays = (interval) => {
    switch(interval) {
      case '1d': return 1;
      case '3d': return 3;
      case '1w': return 7;
      case '2w': return 14;
      case '1m': return 30;
      case '2m': return 60;
      case '3m': return 90;
      case '5m': return 150;
      case '6m': return 180;
      default: return 30; // Default to 1 month
    }
  };

  /**
   * Filters chart data based on selected time interval
   * @returns {Array} - Filtered chart data
   */
  const getFilteredData = () => {
    if (!chartData.length) return [];
    
    const days = intervalToDays(timeInterval);
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    
    return chartData.filter(item => {
      const itemDate = new Date(item.date);
      return itemDate >= cutoffDate;
    });
  };

  /**
   * Fetches historical data for each stock and calculates portfolio value over time
   */
  useEffect(() => {
    const fetchHistoricalData = async () => {
      if (!tickers.length || !weights.length) return;
      
      try {
        setIsLoading(true);
        setError(null);
        
        // Get authentication token
        const token = localStorage.getItem('token');
        if (!token) throw new Error('Authentication token is missing');
        
        // Fetch historical data for each ticker
        const portfolioDataPromises = tickers.map(async (ticker, index) => {
          try {
            const response = await axios.get(
              `http://localhost:3001/get-historical-data`,
              {
                headers: { Authorization: `Bearer ${token}` },
                params: { symbol: ticker }
              }
            );
            
            return {
              ticker,
              weight: weights[index],
              buyPrice: priceBuy[ticker] || 0,
              historicalData: response.data
            };
          } catch (err) {
            console.error(`Error fetching data for ${ticker}:`, err.message);
            return null;
          }
        });
        
        // Wait for all API requests to complete
        const portfolioData = await Promise.all(portfolioDataPromises);
        const validPortfolioData = portfolioData.filter(data => data !== null);
        
        if (validPortfolioData.length === 0) {
          throw new Error('Failed to fetch historical data for any stock');
        }
        
        // Find the earliest common date across all stocks
        let earliestDate = new Date();
        validPortfolioData.forEach(stock => {
          if (stock.historicalData.length > 0) {
            const stockEarliestDate = new Date(stock.historicalData[0].date);
            if (stockEarliestDate < earliestDate) {
              earliestDate = stockEarliestDate;
            }
          }
        });
        
        // Create a map of dates to total portfolio values
        const dateValueMap = new Map();
        
        // Calculate portfolio value for each date
        validPortfolioData.forEach(stock => {
          const { ticker, weight, historicalData } = stock;
          // Calculate units of stock based on initial investment and weight
          const stockUnits = (initialInvestment * weight) / stock.buyPrice;
          
          historicalData.forEach(dataPoint => {
            const { date, close } = dataPoint;
            const stockValue = stockUnits * close;
            
            // Add stock value to date total or create new entry
            if (dateValueMap.has(date)) {
              dateValueMap.set(date, dateValueMap.get(date) + stockValue);
            } else {
              dateValueMap.set(date, stockValue);
            }
          });
        });
        
        // Convert map to array and sort by date
        const chartDataArray = Array.from(dateValueMap.entries())
          .map(([date, value]) => ({ date, value: parseFloat(value.toFixed(2)/1000) }))
          .sort((a, b) => new Date(a.date) - new Date(b.date));
        
        setChartData(chartDataArray);
        setIsLoading(false);
      } catch (err) {
        console.error('Error creating chart data:', err.message);
        setError('Failed to load portfolio chart data');
        setIsLoading(false);
      }
    };
    
    fetchHistoricalData();
  }, [tickers, weights, priceBuy, initialInvestment]);

  // Show loading indicator while fetching data
  if (isLoading) {
    return (
      <div className="chart-loading-container">
        <RotatingLines
          height="60"
          width="60"
          color="grey"
          strokeWidth="5"
          animationDuration="0.75"
          wrapperStyle={{ marginBottom: "20px" }}
        />
        <p>Loading chart data...</p>
      </div>
    );
  }
  
  // Show error message if data fetch fails
  if (error) {
    return <div className="chart-error">Error: {error}</div>;
  }
  
  // Get data filtered by selected time interval
  const filteredData = getFilteredData();
  
  // Show message if no data for selected time period
  if (filteredData.length === 0) {
    return <div className="no-chart-data">No data available for the selected time period</div>;
  }

  // Calculate portfolio performance metrics
  const firstValue = filteredData[0]?.value || 0;
  const lastValue = filteredData[filteredData.length - 1]?.value || 0;
  const totalChange = lastValue - firstValue;
  const percentChange = firstValue > 0 ? (totalChange / firstValue) * 100 : 0;

  return (
    <div className="portfolio-chart-container">
      {/* Chart Header with Summary */}
      <div className="chart-header">
        <h3>Portfolio Value Over Time</h3>
        <div className="portfolio-summary">
          <div className="summary-item">
            <span>Initial Value:</span> ${initialInvestment.toFixed(2)/1000}
          </div>
          <div className="summary-item">
            <span>Current Value:</span> ${lastValue.toFixed(2)}
          </div>
          <div className="summary-item" style={{ color: totalChange >= 0 ? 'green' : 'red' }}>
            <span>Total Change:</span> ${totalChange.toFixed(2)/1000} ({percentChange.toFixed(2)}%)
          </div>
        </div>
        
        {/* Time Interval Selector */}
        <div className="time-interval-selector">
          <span>Time Interval:</span>
          <select 
            value={timeInterval} 
            onChange={(e) => setTimeInterval(e.target.value)}
          >
            <option value="1d">1 Day</option>
            <option value="3d">3 Days</option>
            <option value="1w">1 Week</option>
            <option value="2w">2 Weeks</option>
            <option value="1m">1 Month</option>
            <option value="2m">2 Months</option>
            <option value="3m">3 Months</option>
            <option value="5m">5 Months</option>
            <option value="6m">6 Months</option>
          </select>
        </div>
      </div>
      
      {/* Portfolio Value Chart */}
      <ResponsiveContainer width="100%" height={400}>
        <LineChart
          data={filteredData}
          margin={{ top: 20, right: 30, left: 20, bottom: 10 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis 
            dataKey="date" 
            tickFormatter={(tick) => {
              const date = new Date(tick);
              return `${date.getMonth() + 1}/${date.getDate()}`;
            }}
          />
          <YAxis 
            tickFormatter={(tick) => `$${tick}`}
            domain={[0, 'auto']} // Always start Y-axis from 0
            allowDataOverflow={false} // Prevent data from overflowing chart area
          />
          <Tooltip 
            formatter={(value) => [`$${value}`, 'Portfolio Value']}
            labelFormatter={(label) => {
              const date = new Date(label);
              return date.toLocaleDateString();
            }}
          />
          <Legend />
          <Line 
            type="monotone" 
            dataKey="value" 
            stroke="#16a085" 
            strokeWidth={2}
            activeDot={{ r: 8 }} 
            name="Portfolio Value"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export default PortfolioChart;