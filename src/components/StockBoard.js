/**
 * StockBoard.js
 * This component displays a user's stock portfolio with real-time market data.
 * It provides both table and chart views of the portfolio with sorting capabilities.
 */
import React, { useEffect, useState, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "./StockBoard.css";
import axios from "axios";
import { RotatingLines } from "react-loader-spinner";
import notificationBellIcon from "../assets/notification-bell.png";
import dashboardIcon from "../assets/dashboard.png";
import userIcon from "../assets/user.png";
import activityTrackerIcon from "../assets/activity-tracker.png";
import sendIcon from "../assets/send.png";
import logo from "../assets/logo.png";
import logout from "../assets/logout.png";
import calculater from "../assets/calculater.png";
import PortfolioChart from "./PortfolioChart"; // Chart visualization component

/**
 * @param {string} userEmail - Email of the currently logged in user
 */
function StockBoard({ userEmail }) {
  // Extract email from URL params
  const { email } = useParams();
  
  // State variables
  const [showModal, setShowModal] = useState(false); // Delete confirmation modal
  const [showSureModal, setShowSureModal] = useState(false); // Logout confirmation modal
  const [data, setData] = useState([]); // Stock data from API
  const [priceBuy, setPriceBuy] = useState({}); // Purchase prices for stocks
  const [initialInvestment, setInitialInvestment] = useState(0); // Initial investment amount
  const [loading, setLoading] = useState(true); // Loading state
  const [error, setError] = useState(null); // Error state
  const [sortConfig, setSortConfig] = useState({ key: null, direction: null }); // Table sorting configuration
  const [tickers, setTickers] = useState([]); // Stock symbols in portfolio
  const [weights, setWeights] = useState([]); // Portfolio allocation weights
  const [view, setView] = useState(() => {
    return localStorage.getItem('currentViewState') || 'table'; // Default to table view
  });
  const [updatingHistoricalData, setUpdatingHistoricalData] = useState(false); // Historical data update status
  const navigate = useNavigate(); // React Router hook for navigation
  const [showPortfolioChart, setShowPortfolioChart] = useState(false); // Portfolio chart visibility

  // API keys for Finnhub
  const FINNHUB_API_KEY1 = "ctjbr29r01quipmtn8mgctjbr29r01quipmtn8n0";
  const FINNHUB_API_KEY2 = "cttf39pr01qqhvb0f4r0cttf39pr01qqhvb0f4rg";

  /**
   * Fetch initial investment amount from user preferences
   */
  useEffect(() => {
    if (!email) return;

    const fetchInitialInvestment = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) throw new Error("Authentication token is missing.");
        const decodedEmail = decodeURIComponent(email);
        
        const response = await axios.get(
          "http://localhost:3001/user-preferences",
          {
            headers: { Authorization: `Bearer ${token}` },
            params: { email: decodedEmail },
          }
        );

        if (response.data && response.data["Initial Investment"]) {
          setInitialInvestment(parseFloat(response.data["Initial Investment"]));
        } else {
          console.error("Initial Investment not found.");
        }
      } catch (error) {
        console.error("Error fetching initial investment:", error.message);
      }
    };

    fetchInitialInvestment();
  }, [email]);

  /**
   * Fetch portfolio data or use cached data if available
   */
  useEffect(() => {
    if (!initialInvestment) return; // Wait for initialInvestment
    
    // Check for cached portfolio data
    const cachedPortfolioKey = `portfolio_${email}`;
    const cachedPortfolio = localStorage.getItem(cachedPortfolioKey);
    
    if (cachedPortfolio) {
      // Use cached portfolio data
      const portfolioData = JSON.parse(cachedPortfolio);
      setPriceBuy(portfolioData.priceBuy || {});
      setTickers(portfolioData.selected_assets || []);
      setWeights(portfolioData.weights || []);
      
      // Check for cached stock data
      if (localStorage.getItem("storedFor") === email && 
          localStorage.getItem("stockData")) {
        setData(JSON.parse(localStorage.getItem("stockData")));
        setLoading(false);
      }
      
      return; // Skip API call if cached data exists
    }
    
    /**
     * Fetch portfolio data from API
     */
    const fetchPortfolio = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");
        if (!token) throw new Error("Authentication token is missing.");

        const response = await axios.get(
          `http://localhost:3001/get-portfolio`,
          {
            headers: { Authorization: `Bearer ${token}` },
            params: { email },
          }
        );

        if (!response.data)
          throw new Error("No portfolio found for this user.");

        const portfolioData = response.data;
        
        // Cache the portfolio data
        localStorage.setItem(cachedPortfolioKey, JSON.stringify(portfolioData));
        
        // Set state with portfolio data
        setPriceBuy(portfolioData.priceBuy || {});
        setTickers(portfolioData.selected_assets || []);
        setWeights(portfolioData.weights || []);
      } catch (error) {
        console.error("Error fetching portfolio:", error.message);
        setError("Failed to fetch portfolio.");
        setLoading(false);
      }
    };

    fetchPortfolio();
  }, [initialInvestment, email]);

  /**
   * Update historical data on initial load
   */
  useEffect(() => {
    const updateHistoricalData = async () => {
      if (tickers.length === 0) return;
      
      try {
        setUpdatingHistoricalData(true);
        const token = localStorage.getItem("token");
        if (!token) throw new Error("Authentication token is missing.");
        
        // Call the endpoint to update historical data for all tickers
        await axios.get(
          "http://localhost:3001/update-all-historical-data",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        
        setUpdatingHistoricalData(false);
      } catch (error) {
        console.error("Error updating historical data:", error.message);
        setUpdatingHistoricalData(false);
      }
    };
    
    updateHistoricalData();
  }, [tickers]);

  /**
   * Fetch stock data only when tickers/weights change and we don't have cached data
   */
  useEffect(() => {
    // Skip if no tickers/weights or if loading state is cleared by cache
    if (tickers.length === 0 || weights.length === 0) return;
    
    // If we have valid cached stock data, skip fetch
    if (localStorage.getItem("storedFor") === email && 
        localStorage.getItem("stockData") && 
        data.length > 0) {
      setLoading(false);
      return;
    }
    
    /**
     * Fetch current stock data from Finnhub API
     */
    const fetchStockData = async () => {
      try {
        let stockData = [];
        setLoading(true);
        
        // Loop through each ticker to fetch its data
        for (let i = 0; i < tickers.length; i++) {
          const symbol = tickers[i];
          try {
            // Fetch both quote and company profile data in parallel
            const [quoteResponse, profileResponse] = await Promise.all([
              axios.get(
                `https://finnhub.io/api/v1/quote?symbol=${symbol}&token=${FINNHUB_API_KEY1}`
              ),
              axios.get(
                `https://finnhub.io/api/v1/stock/profile2?symbol=${symbol}&token=${FINNHUB_API_KEY1}`
              ),
            ]);

            const currentPrice = quoteResponse.data.c;
            const buyPrice = priceBuy[symbol] || 0;
            
            // Calculate total percent change from buy price to current price
            const totalChangePercent = buyPrice > 0 ? 
              ((currentPrice - buyPrice) / buyPrice) * 100 : 0;

            // Add stock data to the array
            stockData.push({
              symbol,
              companyName: profileResponse.data.name || symbol,
              price: currentPrice,
              changePercent: quoteResponse.data.dp, // Daily percent change from Finnhub
              totalChangePercent: totalChangePercent, // Total change since purchase
              weightInPortfolio: weights[i],
              marketCap: profileResponse.data.marketCapitalization || "N/A",
              unitsOwned: (
                (initialInvestment * weights[i]) /
                buyPrice
              ).toFixed(2),
            });
          } catch (error) {
            console.error(
              `Failed to fetch data for ticker: ${symbol}`,
              error.message
            );
          }

          // Add a debounce delay to avoid API rate limits
          await new Promise((resolve) => setTimeout(resolve, 300));
        }
        
        // Update state and cache
        setData(stockData);
        localStorage.setItem("stockData", JSON.stringify(stockData));
        localStorage.setItem("storedFor", email);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching stock data:", error.message);
        setError("Failed to fetch stock data.");
        setLoading(false);
      }
    };

    fetchStockData();
  }, [tickers, weights, email, initialInvestment]);

  /**
   * Delete the user's portfolio
   */
  const deletePortfolio = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        alert("Authentication token is missing. Please log in again.");
        return;
      }

      const response = await axios.delete(
        "http://localhost:3001/delete-portfolio",
        {
          headers: { Authorization: `Bearer ${token}` },
          params: { email },
        }
      );

      if (response.status === 200) {
        alert("Portfolio deleted successfully!");
        setData([]);
        // Clear specifically this portfolio's cache
        localStorage.removeItem(`portfolio_${email}`);
        localStorage.removeItem("stockData");
        localStorage.removeItem("storedFor");
      } else {
        alert("Failed to delete portfolio.");
      }
    } catch (error) {
      console.error("Error deleting portfolio:", error);
      alert("An error occurred while deleting the portfolio.");
    } finally {
      setShowModal(false);
    }
  };

  /**
   * Set up auto-refresh every minute
   */
  useEffect(() => {
    const interval = setInterval(() => {
      console.log("Refreshing page...");
      
      // Save current view state in localStorage before refreshing
      localStorage.setItem('currentViewState', view);
      
      window.location.reload();
    }, 60000); // Refresh every minute
    
    return () => clearInterval(interval);
  }, [view]); 

  /**
   * Navigate to stock details page when a row is clicked
   * @param {string} symbol - Stock symbol to view details
   */
  const handleRowClick = (symbol) => {
    navigate(`/stock-details/${symbol}`);
  };

  /**
   * Show delete portfolio confirmation modal
   */
  const handleDeleteClick = () => {
    setShowModal(true);
  };
  
  /**
   * Close the delete confirmation modal
   */
  const handleCloseModal = () => {
    setShowModal(false);
  };
  
  /**
   * Close the logout confirmation modal
   */
  const handleCloseSureModal = () => {
    setShowSureModal(false);
  };

  /**
   * Handle user logout
   * Remove tokens and redirect to home page
   */
  const handleLogoutClick = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("stockData");
    localStorage.removeItem("storedFor");
    // Don't remove portfolio cache on logout
    navigate("/");
  };

  /**
   * Handle column sorting in table view
   * @param {string} key - Column key to sort by
   */
  const handleSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key) {
      if (sortConfig.direction === "asc") {
        direction = "desc";
      } else if (sortConfig.direction === "desc") {
        direction = null; // Reset to original (unsorted)
      }
    }
    setSortConfig({ key: direction ? key : null, direction });
  };

  /**
   * Sort data based on current sort configuration
   * @returns {Array} - Sorted data array
   */
  const sortedData = React.useMemo(() => {
    if (!sortConfig.direction) {
      return data; // Return original data if unsorted
    }

    return [...data].sort((a, b) => {
      const aValue =
        sortConfig.key === "priceBuy" ? priceBuy[a.symbol] : a[sortConfig.key];
      const bValue =
        sortConfig.key === "priceBuy" ? priceBuy[b.symbol] : b[sortConfig.key];

      if (aValue < bValue) {
        return sortConfig.direction === "asc" ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortConfig.direction === "asc" ? 1 : -1;
      }
      return 0;
    });
  }, [data, sortConfig, priceBuy]);

  /**
   * Get sort indicator arrow for a column
   * @param {string} key - Column key
   * @returns {string} - Arrow character or space
   */
  const getSortIndicator = (key) => {
    if (sortConfig.key === key) {
      if (sortConfig.direction === "asc") return "▲";
      if (sortConfig.direction === "desc") return "▼";
    }
    return " "; // No arrow for unsorted
  };

  /**
   * Toggle between table and chart views
   * @param {string} selectedView - View to switch to ('table' or 'chart')
   */
  const handleViewToggle = (selectedView) => {
    setView(selectedView);
  };

  // Show error message if fetch fails
  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div>
      {/* Loading Overlay */}
      {(loading || updatingHistoricalData) && (
        <div className="modal-overlay">
          <div className="modal-content-delete">
            <RotatingLines
              height="96"
              width="96"
              color="grey"
              strokeWidth="5"
              animationDuration="0.75"
              ariaLabel="rotating-lines-loading"
              wrapperStyle={{}}
              wrapperClass=""
            />
            <p style={{ marginLeft: "20px" }}>
              {updatingHistoricalData ? "Updating historical data..." : "Loading..."}
            </p>
          </div>
        </div>
      )}
      
      {/* Delete Portfolio Confirmation Modal */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content-delete">
            <span className="close-modal" onClick={handleCloseModal}>
              &times;
            </span>
            <div className="form-container">
              <div>
                <h2>Are you sure?</h2>
                <button
                  onClick={deletePortfolio}
                  className="button-formal-delete-yes"
                >
                  Yes
                </button>
                <button
                  onClick={handleCloseModal}
                  className="button-formal-delete-no"
                >
                  No
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Logout Confirmation Modal */}
      {showSureModal && (
        <div className="modal-overlay">
          <div className="modal-content-delete">
            <span className="close-modal" onClick={handleCloseSureModal}>
              &times;
            </span>
            <div className="form-container">
              <div>
                <h2>Are you sure?</h2>
                <button
                  onClick={handleLogoutClick}
                  className="button-formal-delete-yes"
                >
                  Yes
                </button>
                <button
                  onClick={handleCloseSureModal}
                  className="button-formal-delete-no"
                >
                  No
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Header Section */}
      <header className="header">
        <div className="left-section">
          <img src={logo} alt="InsightPredict Logo" className="site-logo" />
        </div>
        <div className="right-section">
          <button
            className="alert-button"
            onClick={() => alert("Notification button clicked!")}
          >
            <img
              src={notificationBellIcon}
              alt="Notification Bell"
              className="alert-icon"
            />
          </button>
          <div className="user-info">
            <div className="right-section">
              <p className="user-email">Logged in as: {email}</p>
            </div>
          </div>
        </div>
      </header>
      
      <div className="container">
        {/* Sidebar Navigation */}
        <aside className="sidebar">
          <nav className="menu">
            <a
              href="#"
              onClick={() => {
                navigate("/UserProfiles");
              }}
            >
              <img src={dashboardIcon} alt="Dashboard" className="menu-icon" />
              Dashboard
            </a>
            <a href="#" onClick={() => navigate("/NewsAndInsights")}>
              <img
                src={activityTrackerIcon}
                alt="NewsAndInsights"
                className="menu-icon"
              />
              News And Insights
            </a>
            <a href="#" onClick={() => navigate("/InteractiveTools")}>
              <img
                src={calculater}
                alt="InteractiveTools"
                className="menu-icon"
              />
              Interactive Tools
            </a>
            <a href="#" onClick={() => navigate("/contact-us")}>
              <img src={sendIcon} alt="Contact Us" className="menu-icon" />
              Contact Us
            </a>
            <a href="#" onClick={() => setShowSureModal(true)}>
              <img src={logout} alt="Logout" className="menu-icon" />
              Logout
            </a>
          </nav>
        </aside>
        
        {/* Main Content */}
        <main className="content">
          <div className="actions">
            <h2 className="title">Stock Data</h2>
            <button className="delete-button" onClick={handleDeleteClick}>
              Delete Portfolio
            </button>
          </div>
          
          {/* View Toggle Buttons */}
          <div className="view-toggle">
            <button 
              className={`view-toggle-button ${view === 'table' ? 'active' : ''}`}
              onClick={() => handleViewToggle('table')}
            >
              Table View
            </button>
            <button 
              className={`view-toggle-button ${view === 'chart' ? 'active' : ''}`}
              onClick={() => handleViewToggle('chart')}
            >
              Chart View
            </button>
          </div>
          
          {/* Show Table or Chart based on selected view */}
          {view === 'table' ? (
            <table className="stock-table">
              <thead>
                <tr>
                  <th data-sortable onClick={() => handleSort("companyName")}>
                    Company Name{" "}
                    <span className="sort-indicator">
                      {getSortIndicator("companyName")}
                    </span>
                  </th>
                  <th data-sortable onClick={() => handleSort("marketCap")}>
                    Current Market Cap{" "}
                    <span className="sort-indicator">
                      {getSortIndicator("marketCap")}
                    </span>
                  </th>
                  <th data-sortable onClick={() => handleSort("priceBuy")}>
                    Price Buy{" "}
                    <span className="sort-indicator">
                      {getSortIndicator("priceBuy")}
                    </span>
                  </th>
                  <th data-sortable onClick={() => handleSort("price")}>
                    Current Price{" "}
                    <span className="sort-indicator">
                      {getSortIndicator("price")}
                    </span>
                  </th>
                  <th data-sortable onClick={() => handleSort("changePercent")}>
                    Percent Change From Yesterday{" "}
                    <span className="sort-indicator">
                      {getSortIndicator("changePercent")}
                    </span>
                  </th>
                  <th data-sortable onClick={() => handleSort("totalChangePercent")}>
                    Total Percent Change{" "}
                    <span className="sort-indicator">
                      {getSortIndicator("totalChangePercent")}
                    </span>
                  </th>
                  <th
                    data-sortable
                    onClick={() => handleSort("weightInPortfolio")}
                  >
                    Weight in Portfolio{" "}
                    <span className="sort-indicator">
                      {getSortIndicator("weightInPortfolio")}
                    </span>
                  </th>
                  <th data-sortable onClick={() => handleSort("unitsOwned")}>
                    Units Owned{" "}
                    <span className="sort-indicator">
                      {getSortIndicator("unitsOwned")}
                    </span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {sortedData.length >= 1 ? (
                  sortedData.map((stock, index) => (
                    <tr key={index}>
                      <td>
                        <button
                          className="stock-button"
                          onClick={() => handleRowClick(stock.symbol)}
                        >
                          {stock.companyName}
                        </button>
                      </td>
                      <td>{stock.marketCap?.toFixed(2) || "N/A"}</td>
                      <td>{priceBuy[stock.symbol]?.toFixed(2) || "N/A"}</td>
                      <td>{stock.price?.toFixed(2) || "N/A"}</td>
                      <td>{stock.changePercent?.toFixed(2) || "N/A"}</td>
                      <td>{stock.totalChangePercent?.toFixed(2) || "N/A"}</td>
                      <td>{stock.weightInPortfolio}</td>
                      <td>{stock.unitsOwned || "N/A"}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="8" className="no-data-cell">
                      <button
                        className="generate-portfolio-button"
                        onClick={() => navigate("/user-preferences")}
                      >
                        Generate Portfolio
                      </button>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          ) : (
            // Chart View
            <div>
              {sortedData.length >= 1 ? (
                <PortfolioChart 
                  tickers={tickers} 
                  weights={weights} 
                  priceBuy={priceBuy} 
                  initialInvestment={initialInvestment} 
                />
              ) : (
                <div className="no-data-cell">
                  <button
                    className="generate-portfolio-button"
                    onClick={() => navigate("/user-preferences")}
                  >
                    Generate Portfolio
                  </button>
                </div>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default StockBoard;