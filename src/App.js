/**
 * App.js
 * This is the main application component that defines the routing structure
 * for the InsightPredict application. It sets up all the routes and maps them
 * to their corresponding components.
 */
import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Home from "./components/Home";
import StockBoard from "./components/StockBoard";
import UserPreferences from "./components/UserPreferences";
import StockDetails from "./components/StockDetails";
import ContactUs from "./components/ContactUs";
import NewsAndInsights from "./components/NewsAndInsights";
import InteractiveTools from "./components/InteractiveTools";
import UserProfiles from "./components/UserProfiles";

/**
 * Main App component that defines the application's routing structure
 * Uses React Router to navigate between different components based on URL
 * 
 * @returns {JSX.Element} The Router with defined Routes
 */
function App() {
  return (
    <Router>
      <Routes>
        {/* Landing page / login page */}
        <Route path="/" element={<Home />} />
        
        {/* User's stock portfolio view with dynamic email parameter */}
        <Route path="/stockboard/:email" element={<StockBoard />} />
        
        {/* Risk tolerance questionnaire and preferences with dynamic email parameter */}
        <Route path="/user-preferences/:email" element={<UserPreferences />} />
        
        {/* Detailed stock view with historical data and charts */}
        <Route path="/stock-details/:stockName" element={<StockDetails />} />
        
        {/* Contact information page */}
        <Route path="/contact-us" element={<ContactUs />} />
        
        {/* Financial news and market insights page */}
        <Route path="/NewsAndInsights" element={<NewsAndInsights />} />
        
        {/* Calculator tools, comparisons, and simulators page */}
        <Route path="/InteractiveTools" element={<InteractiveTools />} />
        
        {/* Dashboard showing all user profiles */}
        <Route path="/UserProfiles" element={<UserProfiles />} />
      </Routes>
    </Router>
  );
}

export default App;