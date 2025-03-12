/**
 * Home.js
 * This component is the landing page for the InsightPredict application.
 * It provides a welcome message and user authentication functionality.
 */
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import logo from "../assets/logo.png";
import signImage from "../assets/sign.png";
import signImage2 from "../assets/sign2.jpg";
import "./Home.css";

const Home = () => {
  const navigate = useNavigate();

  // States for auth modal and form inputs
  const [showModal, setShowModal] = useState(false);
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");

  /**
   * Check for existing authentication token on component mount
   * Redirect to user profiles if already logged in
   */
  useEffect(() => {
    if (localStorage.getItem("token")) {
      navigate("/UserProfiles");
    }
  }, []);

  /**
   * Opens the login/signup modal
   */
  const handleLoginClick = () => {
    setShowModal(true);
  };

  /**
   * Closes the modal and resets all form fields
   */
  const handleCloseModal = () => {
    setShowModal(false);
    setEmail("");
    setPassword("");
    setConfirmPassword("");
    setError("");
  };

  /**
   * Switches the modal to signup mode
   */
  const handleSwitchToSignUp = () => {
    setIsLogin(false);
  };

  /**
   * Switches the modal to login mode
   */
  const handleSwitchToLogin = () => {
    setIsLogin(true);
  };

  /**
   * Validates email format using regex
   * @param {string} email - The email to validate
   * @returns {boolean} - Whether the email is valid
   */
  const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  /**
   * Handles login form submission
   * Validates inputs, submits to API, and processes response
   */
  const handleLogin = async () => {
    // Form validation
    if (!email) {
      setError("Email is required.");
      return;
    }

    if (!isValidEmail(email)) {
      setError("Invalid Email.");
      return;
    }

    if (!password) {
      setError("Password is required.");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    try {
      // Submit login request to API
      const response = await fetch("http://localhost:3001/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      if (response.ok) {
        // Handle successful login
        const data = await response.json();
        handleCloseModal();
        localStorage.setItem("token", data.token);
        localStorage.setItem("email", email);
        navigate("/UserProfiles");
      } else {
        // Handle login error
        const errorText = await response.text();
        setError(errorText.message || "Invalid credentials");
      }
    } catch (error) {
      console.error("Error during login:", error);
      setError("An error occurred");
    }
  };

  /**
   * Handles signup form submission
   * Validates inputs, submits to API, and processes response
   */
  const handleSignup = async () => {
    // Form validation
    if (!email) {
      setError("Email is required.");
      return;
    }

    if (!isValidEmail(email)) {
      setError("Invalid Email.");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    try {
      // Submit signup request to API
      const response = await fetch("http://localhost:3001/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
      if (data.message === "This email is already active.") {
        // Handle duplicate email error
        setError(data.message);
        // alert(data.message);
      } else {
        // Handle successful signup
        // alert(data.message);
        setError("");
        setEmail("");
        setPassword("");
        setConfirmPassword("");
        navigate("/user-preferences", { state: { email } });
        localStorage.setItem("token", data.token);
        localStorage.setItem("email", email);
        handleCloseModal();
      }
    } catch (error) {
      console.error("Error during signup:", error);
      setError("Failed to create an account.");
    }
  };

  return (
    <div className="home">
      {/* Header with navigation */}
      <header className="header">
        <div className="left-section">
          <img src={logo} alt="InsightPredict Logo" className="site-logo" />
          <nav className="nav-buttons">
            <button className="btn">Home</button>
            <button className="btn">Services</button>
            <button className="btn">About Us</button>
            <button className="btn" onClick={handleLoginClick}>
              Login
            </button>
          </nav>
        </div>
      </header>

      {/* Main welcome content */}
      <main className="main-content">
        <h1 className="welcome-text">
          Welcome to InsightPredict – where the future of your investments
          unfolds.
        </h1>
        <p className="description-text">
          Get ahead with cutting-edge stock predictions and make informed
          decisions with confidence.
        </p>
      </main>

      {/* Login/Signup Modal */}
      {showModal && (
        <div className="modal-overlay">
          <div className={`modal-content ${isLogin ? "login" : "signup"}`}>
            <div className="form-container">
              <>
                <h2>Login</h2>
                <input
                  type="email"
                  placeholder="Email"
                  value={email}
                  className="text-input"
                  onChange={(e) => setEmail(e.target.value)}
                />
                <input
                  type="password"
                  placeholder="Password"
                  className="text-input"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                {error && <p className="error-message">{error}</p>}
                <button onClick={handleLogin} className="button-formal">
                  Login
                </button>
              </>
            </div>
            <div className="image-container">
              <img
                src={isLogin ? signImage2 : signImage}
                alt="Sign Illustration"
              />
            </div>
            <span
              className="home-close-modal"
              style={{ alignSelf: "start", fontSize: "24px" }}
              onClick={handleCloseModal}
            >
              &times;
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;