/**
 * UserPreferences.js
 * This component provides a questionnaire to collect user risk tolerance and investment preferences.
 * The collected data is used to generate personalized investment portfolios.
 */
import React, { useState, useEffect } from "react";
import { TailSpin } from "react-loader-spinner";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import "./UserPreferences.css";
import logo from "../assets/logo.png";
import axios from "axios";

function UserPreferences() {
  const navigate = useNavigate();
  const location = useLocation();
  const { email } = useParams(); // Extract email from URL
  
  // State variables
  const [responses, setResponses] = useState({
    familiar: "",
    portfolioDrop: "",
    riskInvestments: "",
    volatility: "",
    drawdown1: "",
    drawdown2: "",
    drawdown3: "",
    investmentHorizon: "",
    initialInvestment: "",
    portfolioSize: "",
  });
  const [errorMessage, setErrorMessage] = useState(""); // Error message
  const [isLoading, setIsLoading] = useState(false); // Loading state
  const [progress, setProgress] = useState(0); // Form completion progress
  const [isModalOpen, setIsModalOpen] = useState(true); // Welcome modal visibility

  /**
   * Updates the response state when a user selects an answer
   * @param {string} question - Question identifier
   * @param {string} answer - Selected answer value
   */
  const handleSelect = (question, answer) => {
    setResponses((prev) => ({ ...prev, [question]: answer }));
  };

  /**
   * Validates that all questions have been answered
   * @returns {boolean} - True if form is valid, false otherwise
   */
  const validateForm = () => {
    for (const [key, value] of Object.entries(responses)) {
      if (!value) {
        setErrorMessage(
          `Please answer the question: ${key.replace(/([A-Z])/g, " $1")}`
        );
        return false;
      }
    }
    setErrorMessage("");
    return true;
  };

  /**
   * Handles form submission
   * Validates form, sends data to API, and navigates to profile page on success
   * @param {Event} event - Form submission event
   */
  const handleFormSubmit = async (event) => {
    event.preventDefault();

    // Validate form before submission
    if (!validateForm()) {
      return;
    }

    // Prepare data for API
    const preferences = {
      email,
      ...responses,
    };

    setIsLoading(true);
    setErrorMessage("");

    try {
      // Send preferences to API
      const response = await fetch("http://localhost:3001/save-preferences", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + localStorage.getItem("token"),
        },
        body: JSON.stringify(preferences),
      });

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      alert("Preferences saved successfully!");
      navigate("/UserProfiles");
    } catch (error) {
      console.error("Error saving preferences:", error);
      setErrorMessage("There was an error saving your preferences.");
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Closes the welcome modal
   */
  const closeModal = () => {
    setIsModalOpen(false);
  };

  return (
    <div className="user-preferences">
      {/* Header */}
      <header className="header">
        <div className="left-section">
          <img src={logo} alt="InsightPredict Logo" className="site-logo" />
        </div>
      </header>
      
      {/* Welcome Modal */}
      {isModalOpen && (
        <div className="modal">
          <div className="modal-content">
            <span className="close-button" onClick={closeModal}>
              &times;
            </span>
            <h3>Set Your Preferences</h3>
            <p>so we can make the best predictions for you!</p>
            <button className="great-button" onClick={closeModal}>
              OK!
            </button>
          </div>
        </div>
      )}

      <div className="container">
        <main className="content">
          <h2>Risk Tolerance Questionnaire</h2>
          <form onSubmit={handleFormSubmit} className="preference-form">
            {/* Email Display (Read-only) */}
            <div className="form-group">
              <label>Email:</label>
              <input
                type="email"
                value={email}
                readOnly
                placeholder="Your Email"
              />
            </div>

            {/* Question 1: Market Familiarity */}
            <div className="form-group">
              <label>
                How familiar are you with the stock market, bonds, derivatives,
                etc.?
              </label>
              <div className="cards">
                <div
                  className={`card ${
                    responses.familiar === "1" ? "selected" : ""
                  }`}
                  onClick={() => handleSelect("familiar", "1")}
                >
                  Not at all familiar i rely on guidance from advisors.
                </div>
                <div
                  className={`card ${
                    responses.familiar === "2" ? "selected" : ""
                  }`}
                  onClick={() => handleSelect("familiar", "2")}
                >
                  Somewhat familiar I do my own research but still cautious.
                </div>
                <div
                  className={`card ${
                    responses.familiar === "3" ? "selected" : ""
                  }`}
                  onClick={() => handleSelect("familiar", "3")}
                >
                  Very familiar, I actively trade or follow markets closely.
                </div>
              </div>
            </div>
            
            {/* Question 2: Portfolio Drop Reaction */}
            <div className="form-group">
              <label>
                If your portfolio dropped by 10% in one month, how would you
                react?
              </label>
              <div className="cards">
                <div
                  className={`card ${
                    responses.portfolioDrop === "1" ? "selected" : ""
                  }`}
                  onClick={() => handleSelect("portfolioDrop", "1")}
                >
                  Very anxious—I would likely sell to avoid further losses
                </div>
                <div
                  className={`card ${
                    responses.portfolioDrop === "2" ? "selected" : ""
                  }`}
                  onClick={() => handleSelect("portfolioDrop", "2")}
                >
                  Somewhat concerned—but I'd monitor before taking action
                </div>
                <div
                  className={`card ${
                    responses.portfolioDrop === "3" ? "selected" : ""
                  }`}
                  onClick={() => handleSelect("portfolioDrop", "3")}
                >
                  Comfortable—I understand that fluctuations happen
                </div>
              </div>
            </div>

            {/* Question 3: Risk Tolerance */}
            <div className="form-group">
              <label>
                How do you feel about taking risks in your investments?
              </label>
              <div className="cards">
                <div
                  className={`card ${
                    responses.riskInvestments === "1" ? "selected" : ""
                  }`}
                  onClick={() => handleSelect("riskInvestments", "1")}
                >
                  I am very risk averse and want to protiritize safety.
                </div>
                <div
                  className={`card ${
                    responses.riskInvestments === "2" ? "selected" : ""
                  }`}
                  onClick={() => handleSelect("riskInvestments", "2")}
                >
                  I can take moderate risks but prefer some level of security.
                </div>
                <div
                  className={`card ${
                    responses.riskInvestments === "3" ? "selected" : ""
                  }`}
                  onClick={() => handleSelect("riskInvestments", "3")}
                >
                  I'm comfortable taking high risks for the chance of high
                  returns.
                </div>
              </div>
            </div>

            {/* Question 4: Returns vs Volatility */}
            <div className="form-group">
              <label>
                Which scenario aligns best with your preference for returns and
                volatility?
              </label>
              <div className="cards">
                <div
                  className={`card ${
                    responses.volatility === "1" ? "selected" : ""
                  }`}
                  onClick={() => handleSelect("volatility", "1")}
                >
                  Small but steady returns with very low volatility
                </div>
                <div
                  className={`card ${
                    responses.volatility === "2" ? "selected" : ""
                  }`}
                  onClick={() => handleSelect("volatility", "2")}
                >
                  Medium returns with moderate volatility
                </div>
                <div
                  className={`card ${
                    responses.volatility === "3" ? "selected" : ""
                  }`}
                  onClick={() => handleSelect("volatility", "3")}
                >
                  Potentially high returns with high volatility
                </div>
              </div>
            </div>

            {/* Question 5: Drawdown Tolerance (1 Month) */}
            <div className="form-group">
              <label>
                What level of portfolio drawdown would you feel comfortable
                tolerating in 1 month?
              </label>
              <div className="cards">
                <div
                  className={`card ${
                    responses.drawdown1 === "1" ? "selected" : ""
                  }`}
                  onClick={() => handleSelect("drawdown1", "1")}
                >
                  Less than 5%.
                </div>
                <div
                  className={`card ${
                    responses.drawdown1 === "2" ? "selected" : ""
                  }`}
                  onClick={() => handleSelect("drawdown1", "2")}
                >
                  Between 5% and 15%.
                </div>
                <div
                  className={`card ${
                    responses.drawdown1 === "3" ? "selected" : ""
                  }`}
                  onClick={() => handleSelect("drawdown1", "3")}
                >
                  More than 15%
                </div>
              </div>
            </div>
            
            {/* Question 6: Drawdown Tolerance (2 Months) */}
            <div className="form-group">
              <label>
                What level of portfolio drawdown would you feel comfortable
                tolerating in 2 month?
              </label>
              <div className="cards">
                <div
                  className={`card ${
                    responses.drawdown2 === "1" ? "selected" : ""
                  }`}
                  onClick={() => handleSelect("drawdown2", "1")}
                >
                  Less than 5%.
                </div>
                <div
                  className={`card ${
                    responses.drawdown2 === "2" ? "selected" : ""
                  }`}
                  onClick={() => handleSelect("drawdown2", "2")}
                >
                  Between 5% and 15%.
                </div>
                <div
                  className={`card ${
                    responses.drawdown2 === "3" ? "selected" : ""
                  }`}
                  onClick={() => handleSelect("drawdown2", "3")}
                >
                  More than 15%
                </div>
              </div>
            </div>
            
            {/* Question 7: Drawdown Tolerance (3 Months) */}
            <div className="form-group">
              <label>
                What level of portfolio drawdown would you feel comfortable
                tolerating in 3 month?
              </label>
              <div className="cards">
                <div
                  className={`card ${
                    responses.drawdown3 === "1" ? "selected" : ""
                  }`}
                  onClick={() => handleSelect("drawdown3", "1")}
                >
                  Less than 5%.
                </div>
                <div
                  className={`card ${
                    responses.drawdown3 === "2" ? "selected" : ""
                  }`}
                  onClick={() => handleSelect("drawdown3", "2")}
                >
                  Between 5% and 15%.
                </div>
                <div
                  className={`card ${
                    responses.drawdown3 === "3" ? "selected" : ""
                  }`}
                  onClick={() => handleSelect("drawdown3", "3")}
                >
                  More than 15%
                </div>
              </div>
            </div>

            {/* Investment Horizon Dropdown */}
            <div className="form-group">
              <label>Select Investment Horizon:</label>
              <select
                value={responses.investmentHorizon}
                onChange={(e) =>
                  handleSelect("investmentHorizon", e.target.value)
                }
                className="dropdown"
              >
                <option value="" disabled>
                  Choose an option
                </option>
                <option value="2">2 Months</option>
                <option value="3">3 Months</option>
                <option value="4">4 Months</option>
                <option value="5">5 Months</option>
                <option value="6">6 Months</option>
                <option value="8">8 Months</option>
                <option value="12">12 Months</option>
              </select>
            </div>
            
            {/* Portfolio Size Dropdown */}
            <div className="form-group">
              <label>Portfolio Size:</label>
              <select
                value={responses.portfolioSize}
                onChange={(e) => handleSelect("portfolioSize", e.target.value)}
                className="dropdown"
              >
                <option value="" disabled>
                  Choose an option
                </option>
                <option value="15">15 Companies</option>
                <option value="20">20 Companies</option>
                <option value="25">25 Companies</option>
              </select>
            </div>
            
            {/* Initial Investment Input */}
            <div className="form-group">
              <label>Initial Investment:</label>
              <input
                value={responses.initialInvestment}
                type={"number"}
                min={1000}
                required
                onKeyDown={(e) => {
                  // Disallow "e", "+", "-", and other unwanted keys
                  if (
                    e.key === "e" ||
                    e.key === "E" ||
                    e.key === "+" ||
                    e.key === "-"
                  ) {
                    e.preventDefault();
                  }
                }}
                onChange={(e) =>
                  handleSelect("initialInvestment", e.target.value)
                }
                className="dropdown"
              ></input>
            </div>
            
            {/* Loading Spinner */}
            {isLoading ? (
              <TailSpin
                visible={true}
                height="200"
                width="200"
                color="#4fa94d"
                ariaLabel="tail-spin-loading"
                radius="1"
                wrapperStyle={{ margin: "auto" }}
                wrapperClass=""
              />
            ) : (
              ""
            )}

            {/* Submit Button */}
            <button
              type="submit"
              className="submit-button"
              disabled={isLoading}
            >
              {isLoading ? "Saving..." : "Save Preferences"}
            </button>
            
            {/* Error Message Display */}
            {errorMessage && <p className="error-message">{errorMessage}</p>}
          </form>
        </main>
      </div>
    </div>
  );
}

export default UserPreferences;