import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Home from './components/Home';
import StockBoard from './components/StockBoard';
import UserPreferences from './components/UserPreferences';
import StockDetails from './components/StockDetails'; 
import ContactUs from './components/ContactUs'; 
import NewsAndInsights from './components/NewsAndInsights';
import InteractiveTools from './components/InteractiveTools';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/stockboard" element={<StockBoard />} />
        <Route path="/user-preferences" element={<UserPreferences />} />
        <Route path="/stock-details/:stockName" element={<StockDetails />} />
        <Route path="/contact-us" element={<ContactUs />} /> 
        <Route path="/NewsAndInsights" element={<NewsAndInsights />} /> 
        <Route path="/InteractiveTools" element={<InteractiveTools />} /> 
      </Routes>
    </Router>
  );
}

export default App;
