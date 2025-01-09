import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import logo from "../assets/logo.png";
import signImage from "../assets/sign.png";
import signImage2 from "../assets/sign2.jpg";
import "./Home.css";

const Home = () => {
  const navigate = useNavigate();

  const [showModal, setShowModal] = useState(false);
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (localStorage.getItem("token")) {
      navigate("/stockboard");
    }
  }, []);

  const handleLoginClick = () => {
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEmail("");
    setPassword("");
    setConfirmPassword("");
    setError("");
  };

  const handleSwitchToSignUp = () => {
    setIsLogin(false);
  };

  const handleSwitchToLogin = () => {
    setIsLogin(true);
  };

  const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleLogin = async () => {
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
      const response = await fetch("http://localhost:3001/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      if (response.ok) {
        const data = await response.json();
        handleCloseModal();
        localStorage.setItem("token", data.token);
        navigate("/stockboard");
      } else {
        const errorText = await response.text();
        setError(errorText.message || "Invalid credentials");
      }
    } catch (error) {
      console.error("Error during login:", error);
      setError("An error occurred");
    }
  };

  const handleSignup = async () => {
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
      const response = await fetch("http://localhost:3001/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
      if (data.message === "This email is already active.") {
        setError(data.message);
        // alert(data.message);
      } else {
        // alert(data.message);
        setError("");
        setEmail("");
        setPassword("");
        setConfirmPassword("");
        navigate("/user-preferences", { state: { email } });
        localStorage.setItem("token", data.token);
        handleCloseModal();
      }
    } catch (error) {
      console.error("Error during signup:", error);
      setError("Failed to create an account.");
    }
  };

  return (
    <div className="home">
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

      {showModal && (
        <div className="modal-overlay">
          <div className={`modal-content ${isLogin ? "login" : "signup"}`}>
            <span className="close-modal" onClick={handleCloseModal}>
              &times;
            </span>
            <div className="form-container">
              {isLogin ? (
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
                  <p>
                    Don't have an account?{" "}
                    <span
                      onClick={handleSwitchToSignUp}
                      className="toggle-link"
                    >
                      Sign up here
                    </span>
                  </p>
                </>
              ) : (
                <>
                  <h2>Sign Up</h2>
                  <input
                    type="email"
                    placeholder="Email"
                    className="text-input"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                  <input
                    type="password"
                    placeholder="Password"
                    className="text-input"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <input
                    type="password"
                    placeholder="Confirm Password"
                    className="text-input"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />

                  {error && <p className="error-message">{error}</p>}

                  <button onClick={handleSignup} className="button-formal">
                    Sign Up
                  </button>
                  <p>
                    Already have an account?{" "}
                    <span onClick={handleSwitchToLogin} className="toggle-link">
                      Login here
                    </span>
                  </p>
                </>
              )}
            </div>
            <div className="image-container">
              <img
                src={isLogin ? signImage2 : signImage}
                alt="Sign Illustration"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;
