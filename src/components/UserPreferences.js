import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "./UserPreferences.css";
import logo from "../assets/logo.png";
import axios from "axios";

function UserPreferences() {
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState("");
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
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(true);

  useEffect(() => {
    async function getEmail() {
      const token = localStorage.getItem("token"); // Get token from localStorage or cookies
      const response = await fetch("http://localhost:3001/get-email", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`, // Include the token in the Authorization header
        },
      });

      if (response.ok) {
        const data = await response.json();
        setEmail(data.email);
      } else {
        console.error("Failed to fetch email");
      }
    }
    getEmail();
  }, []);

  const handleSelect = (question, answer) => {
    setResponses((prev) => ({ ...prev, [question]: answer }));
  };

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

  const handleFormSubmit = async (event) => {
    event.preventDefault();

    // Validate form before submission
    if (!validateForm()) {
      return;
    }

    const preferences = {
      email,
      ...responses,
    };

    setIsLoading(true);
    setErrorMessage("");

    try {
      const response = await fetch("http://localhost:3001/save-preferences", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(preferences),
      });

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      alert("Preferences saved successfully!");
      navigate("/stockboard");
    } catch (error) {
      console.error("Error saving preferences:", error);
      setErrorMessage("There was an error saving your preferences.");
    } finally {
      setIsLoading(false);
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  return (
    <div className="user-preferences">
      <header className="header">
        <div className="left-section">
          <img src={logo} alt="InsightPredict Logo" className="site-logo" />
        </div>
      </header>
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
            {/* Email */}
            <div className="form-group">
              <label>Email:</label>
              <input
                type="email"
                value={email}
                readOnly
                placeholder="Your Email"
              />
            </div>

            {/* Questions */}
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
                  Somewhat concerned—but I’d monitor before taking action
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
                  I’m comfortable taking high risks for the chance of high
                  returns.
                </div>
              </div>
            </div>

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

            {/* Submit Button */}
            <button
              type="submit"
              className="submit-button"
              disabled={isLoading}
            >
              {isLoading ? "Saving..." : "Save Preferences"}
            </button>
            {errorMessage && <p className="error-message">{errorMessage}</p>}
          </form>
        </main>
      </div>
    </div>
  );
}

export default UserPreferences;
