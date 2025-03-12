/**
 * InteractiveTools.js
 * This component provides a container for various financial tools in the
 * InsightPredict application, allowing users to switch between different
 * calculators and simulators.
 */
import React, { useState } from "react";
import "./InteractiveTools.css";
import { useNavigate } from "react-router-dom";
import notificationBellIcon from "../assets/notification-bell.png";
import dashboardIcon from "../assets/dashboard.png";
import userIcon from "../assets/user.png";
import activityTrackerIcon from "../assets/activity-tracker.png";
import sendIcon from "../assets/send.png";
import logo from "../assets/logo.png"; 
import logout from "../assets/logout.png"; 
import StockCalculator from "./StockCalculator"; // Tool component
import StockComparison from "./StockComparison"; // Tool component
import InvestmentSimulator from "./InvestmentSimulator"; // Tool component
import calculater from "../assets/calculater.png";
import axios from "axios";

function InteractiveTools() {
  // State to track which tool is currently selected (default: calculator)
  const [currentTool, setCurrentTool] = useState("calculator"); 
  // State to control logout confirmation modal visibility
  const [showSureModal, setShowSureModal] = useState(false);
  
  const navigate = useNavigate();

  /**
   * Tool selection handlers - switch between different tools
   */
  const handleCalculatorClick = () => setCurrentTool("calculator");
  const handleComparisonClick = () => setCurrentTool("comparison");
  const handleSimulatorClick = () => setCurrentTool("simulator");

  /**
   * Handle notification bell click - displays a simple alert
   */
  const handleAlertClick = () => {
    alert("Notification button clicked!");
  };

  /**
   * Navigation handlers - navigate to different sections of the app
   */
  const handleStockBoardClick = () => {
    navigate("/UserProfiles");
  };

  const handleNewsAndInsightsClick = () => {
    navigate("/NewsAndInsights");
  };

  const handleInteractiveToolsClick = () => {
    navigate("/InteractiveTools");
  };

  const handleContactClick = () => {
    navigate("/contact-us");
  };

  /**
   * Closes the logout confirmation modal
   */
  const handleCloseSureModal = () => {
    setShowSureModal(false);
  };

  /**
   * Handles user logout
   * Removes all relevant items from localStorage and redirects to home page
   */
  const handleLogoutClick = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("stockData");
    localStorage.removeItem("priceBuy");
    localStorage.removeItem("storedFor");
    navigate("/");
  };

  return (
    <div>
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
          <button className="alert-button" onClick={handleAlertClick}>
            <img
              src={notificationBellIcon}
              alt="Notification Bell"
              className="alert-icon"
            />
          </button>
          <div className="user-info">
            <span className="user-name">User User</span>
          </div>
        </div>
      </header>

      <div className="container">
        {/* Sidebar Navigation Menu */}
        <aside className="sidebar">
          <nav className="menu">
            <a href="#" onClick={handleStockBoardClick}>
              <img src={dashboardIcon} alt="Dashboard" className="menu-icon" />
              Dashboard
            </a>
            <a href="#" onClick={handleNewsAndInsightsClick}>
              <img
                src={activityTrackerIcon}
                alt="NewsAndInsights"
                className="menu-icon"
              />
              News And Insights
            </a>
            <a href="#" onClick={handleInteractiveToolsClick}>
              <img
                src={calculater}
                alt="InteractiveTools"
                className="menu-icon"
              />
              Interactive Tools
            </a>
            <a href="#" onClick={handleContactClick}>
              <img src={sendIcon} alt="Contact Us" className="menu-icon" />
              Contact Us
            </a>
            <a href="#" onClick={() => setShowSureModal(true)}>
              <img src={logout} alt="Logout" className="menu-icon" />
              Logout
            </a>
          </nav>
        </aside>

        {/* Main Content Area */}
        <main className="content">
          <h2>Interactive Tools</h2>

          {/* Tool Selection Buttons */}
          <div className="button-container">
            <button onClick={handleCalculatorClick}>Stock Calculator</button>
            <button onClick={handleComparisonClick}>
              Stock Comparison Tool
            </button>
            <button onClick={handleSimulatorClick}>Investment Simulator</button>
          </div>

          {/* Conditional Rendering of Selected Tool */}
          <div>
            {currentTool === "calculator" && <StockCalculator />}
            {currentTool === "comparison" && <StockComparison />}
            {currentTool === "simulator" && <InvestmentSimulator />}
          </div>
        </main>
      </div>
    </div>
  );
}

export default InteractiveTools;