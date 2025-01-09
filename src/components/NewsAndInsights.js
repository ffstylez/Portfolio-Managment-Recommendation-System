import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./NewsAndInsights.css";
import notificationBellIcon from "../assets/notification-bell.png";
import dashboardIcon from "../assets/dashboard.png";
import userIcon from "../assets/user.png";
import activityTrackerIcon from "../assets/activity-tracker.png";
import sendIcon from "../assets/send.png";
import logo from "../assets/logo.png";
import logout from "../assets/logout.png";
import calculater from "../assets/calculater.png";
import axios from "axios";

const NEWS_API_KEY = "7574195e62c64542bdd5f4bb5e8f69af"; // Replace with your NewsAPI key

function NewsAndInsights() {
  const [newsArticles, setNewsArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate(); // React Router hook for navigation

  useEffect(() => {
    // Fetch news from the NewsAPI
    const fetchNews = async () => {
      try {
        const response = await axios.get("https://newsapi.org/v2/everything", {
          params: {
            q: "stocks OR finance OR market", // Search query for stock/financial news
            pageSize: 5, // Limit the number of articles displayed
            apiKey: NEWS_API_KEY,
          },
        });
        setNewsArticles(response.data.articles);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching news:", err);
        setError("Failed to fetch news.");
        setLoading(false);
      }
    };

    fetchNews();
  }, []);

  const handleAlertClick = () => {
    alert("Notification button clicked!");
  };

  const handleStockBoardClick = () => {
    navigate("/stockboard");
  };
  const handleInteractiveToolsClick = () => {
    navigate("/InteractiveTools");
  };
  const handleContactClick = () => {
    navigate("/Contact-Us");
  };
  const handleLogoutClick = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("stockData");
    localStorage.removeItem("priceBuy")
    navigate("/");
  };
  const handleUserPreferencesClick = async () => {
    try {
      const token = localStorage.getItem("token"); // Get token from localStorage or cookies
      if (!token) {
        alert("Authentication token is missing. Please log in again.");
        return;
      }

      const response = await axios.get("http://localhost:3001/get-portfolio", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response && response.data) {
        alert(
          "You already have a portfolio, delete the current one to create a new one"
        );
        return;
      }
    } catch (error) {
      if (error.response && error.response.status === 404) {
        // Portfolio not found, allow navigation
        navigate("/user-preferences");
      } else {
        console.error("Error checking portfolio:", error.message);
        alert("An error occurred while checking your portfolio.");
      }
    }
  };

  if (loading) {
    return <div>Loading news...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <div>
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
        <aside className="sidebar">
          <nav className="menu">
            <a href="#" onClick={handleStockBoardClick}>
              <img src={dashboardIcon} alt="Dashboard" className="menu-icon" />
              Dashboard
            </a>
            <a href="#" onClick={handleUserPreferencesClick}>
              <img src={userIcon} alt="User Preference" className="menu-icon" />
              User Preference
            </a>
            <a href="#">
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
            <a href="#" onClick={handleLogoutClick}>
              <img src={logout} alt="Logout" className="menu-icon" />
              Logout
            </a>
          </nav>
        </aside>
        <main className="content">
          <h2 className="title">Latest News and Insights</h2>
          <div className="news-list">
            {newsArticles.map((article, index) => (
              <div className="news-item" key={index}>
                <h3>
                  <a
                    href={article.url}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {article.title}
                  </a>
                </h3>
                <p>{article.description}</p>
                <small>
                  Source: {article.source.name} | Published:{" "}
                  {new Date(article.publishedAt).toLocaleDateString()}
                </small>
              </div>
            ))}
          </div>
        </main>
      </div>
    </div>
  );
}

export default NewsAndInsights;
