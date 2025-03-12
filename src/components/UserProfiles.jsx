/**
 * UserProfiles.jsx
 * This component displays a dashboard of user profiles with the ability to create,
 * view, and manage portfolios for different users. It supports drag-and-drop reordering
 * of user cards and provides navigation to other parts of the application.
 */
import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { DndContext, closestCenter } from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable";
import {
  SortableContext,
  rectSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import axios from "axios";
import logo from "../assets/logo.png";
import logout from "../assets/logout.png";
import notificationBellIcon from "../assets/notification-bell.png";
import dashboardIcon from "../assets/dashboard.png";
import userIcon from "../assets/user.png";
import activityTrackerIcon from "../assets/activity-tracker.png";
import sendIcon from "../assets/send.png";
import calculater from "../assets/calculater.png";
import signImage from "../assets/sign.png";
import "./UserProfiles.css";

/**
 * ProfileCard component represents a single user in the dashboard
 * It can be dragged and includes buttons to view or create portfolios
 * 
 * @param {Object} props - Component props
 * @param {string} props.email - User email
 * @param {string} props.id - Unique identifier for the card
 * @param {boolean} props.hasPortfolio - Whether the user has a portfolio
 * @param {Function} props.onViewPortfolio - Handler for viewing a portfolio
 * @param {Function} props.onCreatePortfolio - Handler for creating a portfolio
 * @param {boolean} props.isPlaceholder - Whether this is a "create new" placeholder card
 * @param {Function} props.onCreateUser - Handler for creating a new user
 * @param {Function} props.onDeleteUser - Handler for deleting a user
 */
const ProfileCard = ({
  email,
  id,
  hasPortfolio,
  onViewPortfolio,
  onCreatePortfolio,
  isPlaceholder = false,
  onCreateUser,
  onDeleteUser,
}) => {
  // Set up drag-and-drop functionality using dnd-kit
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id });

  // Define card styles based on properties
  const style = {
    transform: isPlaceholder ? "none" : CSS.Transform.toString(transform),
    transition,
    background: isPlaceholder
      ? "#f0f0f0"
      : hasPortfolio
      ? "#ffffff"
      : "#f8d7da",
    padding: "20px",
    borderRadius: "10px",
    boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.1)",
    marginBottom: "10px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    cursor: isPlaceholder ? "pointer" : "grab", // Normal cards are draggable
    width: "250px",
    height: "150px",
    border: isPlaceholder
      ? "2px dashed #4caf50"
      : hasPortfolio
      ? "2px solid #4caf50"
      : "2px solid #dc3545",
  };

  // Render placeholder card for creating new users
  if (isPlaceholder) {
    return (
      <div ref={setNodeRef} style={style} onClick={onCreateUser}>
        <h3 style={{ margin: "10px 0", textAlign: "center", color: "#4caf50" }}>
          + Create New User
        </h3>
      </div>
    );
  }

  // Render user card with appropriate actions
  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <h3 style={{ margin: "10px 0", textAlign: "center" }}>
        {email.split("@")[0]}
      </h3>
      {!hasPortfolio && (
        <p style={{ color: "#dc3545", fontSize: "12px", marginBottom: "10px" }}>
          No Portfolio
        </p>
      )}

      {/* Conditional buttons based on portfolio existence */}
      {hasPortfolio ? (
        <button
          style={{
            background: "#4caf50",
            color: "white",
            border: "none",
            padding: "8px 12px",
            cursor: "pointer",
            borderRadius: "5px",
          }}
          onPointerDown={(e) => {
            e.stopPropagation(); // Prevent dragging
          }}
          onClick={(e) => {
            e.stopPropagation(); // Prevent dragging
            onViewPortfolio(email); // Call the correct function
          }}
        >
          View Portfolio
        </button>
      ) : (
        <button
          style={{
            background: "#dc3545",
            color: "white",
            border: "none",
            padding: "8px 12px",
            cursor: "pointer",
            borderRadius: "5px",
          }}
          onPointerDown={(e) => {
            e.stopPropagation(); // Prevent dragging
          }}
          onClick={(e) => {
            e.stopPropagation(); // Prevent dragging
            onCreatePortfolio(email); // Call the correct function
          }}
        >
          Create Portfolio
        </button>
      )}
      
      {/* Delete User Button */}
      <button
        style={{
          background: "#dc3545",
          color: "white",
          border: "none",
          padding: "8px 12px",
          cursor: "pointer",
          borderRadius: "5px",
          marginTop: "5px"
        }}
        onPointerDown={(e) => {
          e.stopPropagation(); // Prevent dragging when button is pressed down
          e.preventDefault(); // Prevent default behavior
        }}
        onClick={(e) => {
          e.stopPropagation(); // Prevent dragging
          e.preventDefault(); // Prevent default behavior
          onDeleteUser(email);
        }}
      >
        Delete User
      </button>
    </div>
  );
};

/**
 * Main UserProfiles component
 * Displays a dashboard of user profiles and handles user management
 */
const UserProfiles = () => {
  // State variables
  const [users, setUsers] = useState([]); // List of users 
  const navigate = useNavigate(); // React Router navigation hook
  const [showSureModal, setShowSureModal] = React.useState(false); // Logout confirmation modal
  const [showRegisterModal, setShowRegisterModal] = React.useState(false); // User registration modal
  const [email, setEmail] = React.useState(""); // New user email
  const [password, setPassword] = React.useState(""); // New user password
  const [confirmPassword, setConfirmPassword] = React.useState(""); // Password confirmation
  const [error, setError] = React.useState(""); // Error message
  const [userToDelete, setUserToDelete] = useState(null); // User being deleted
  const [showDeleteModal, setShowDeleteModal] = useState(false); // Delete confirmation modal

  /**
   * Shows the delete confirmation modal for a user
   * @param {string} email - Email of the user to delete
   */
  const handleDeleteUser = (email) => {
    setUserToDelete(email);
    setShowDeleteModal(true);
  };

  /**
   * Confirms and executes user deletion
   */
  const confirmDelete = async () => {
    try {
      await axios.delete(`http://localhost:3001/delete-user/${userToDelete}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
      });
      
      // Update state to remove deleted user
      setUsers(users.filter(user => user.email !== userToDelete));
      setShowDeleteModal(false);
      setUserToDelete(null);
    } catch (error) {
      console.error("Error deleting user:", error);
    }
  };

  /**
   * Navigates to a user's portfolio
   * @param {string} email - User email
   */
  const handleProfileClick = (email) => {
    navigate(`/stockboard/${encodeURIComponent(email)}`);
  };

  /**
   * Validates email format
   * @param {string} email - Email to validate
   * @returns {boolean} - Whether the email is valid
   */
  const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  /**
   * Handles user registration form submission
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
      // Submit registration to API
      const response = await fetch("http://localhost:3001/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + localStorage.getItem("token"),
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
      if (data.message === "This email is already active.") {
        setError(data.message);
      } else {
        // Clear form and reload on success
        setError("");
        setEmail("");
        setPassword("");
        setConfirmPassword("");
        window.location.reload();
      }
    } catch (error) {
      console.error("Error during signup:", error);
      setError("Failed to create an account.");
    }
  };

  /**
   * Closes the user registration modal
   */
  const handleCloseRegisterModal = () => {
    setShowRegisterModal(false);
  };

  /**
   * Navigates to portfolio creation page for a user
   * @param {string} email - User email
   */
  const handleCreatePortfolioClick = (email) => {
    navigate(`/user-preferences/${encodeURIComponent(email)}`);
  };

  /**
   * Shows the user registration modal
   */
  const handleCreateUserClick = () => {
    setShowRegisterModal(true);
  };

  /**
   * Handles notification bell click
   */
  const handleAlertClick = () => {
    alert("Notification button clicked!");
  };

  /**
   * Navigation handlers for different app sections
   */
  const handleInteractiveToolsClick = () => {
    navigate("/InteractiveTools");
  };
  const handleContactClick = () => {
    navigate("/contact-us");
  };
  const handleNewsAndInsightsClick = () => {
    navigate("/NewsAndInsights");
  };

  /**
   * Closes the logout confirmation modal
   */
  const handleCloseSureModal = () => {
    setShowSureModal(false);
  };

  /**
   * Handles user logout
   * Clears local storage and navigates to home page
   */
  const handleLogoutClick = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("stockData");
    localStorage.removeItem("priceBuy");
    localStorage.removeItem("storedFor");
    navigate("/");
  };

  /**
   * Fetch all users on component mount
   */
  useEffect(() => {
    axios
      .get("http://localhost:3001/all-users", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      })
      .then((response) => setUsers(response.data))
      .catch((error) => console.error("Error fetching users:", error));
  }, []);

  /**
   * Handles reordering of user cards via drag and drop
   * @param {Object} event - Drag end event from dnd-kit
   */
  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = users.findIndex((user) => user.email === active.id);
    const newIndex = users.findIndex((user) => user.email === over.id);

    if (oldIndex === -1 || newIndex === -1) return; 

    const newUsers = arrayMove(users, oldIndex, newIndex); 

    setUsers(newUsers);
  };

  return (
    <div>
      {/* Logout Confirmation Modal */}
      {showSureModal && (
        <div className="modal-overlay">
          <div className="modal-content-delete">
            <div style={{ display: "flex", flexDirection: "row" }}>
              <span className="close-modal" onClick={handleCloseSureModal}>
                &times;
              </span>
            </div>
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
      
      {/* User Registration Modal */}
      {showRegisterModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="form-container">
              <h2 style={{ marginBottom: "15px" }}>Create New User</h2>
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
            </div>
            <div className="image-container">
              <img src={signImage} alt="Sign Illustration" />
            </div>
            <span
              className="home-close-modal"
              style={{ alignSelf: "start", fontSize: "24px" }}
              onClick={handleCloseRegisterModal}
            >
              &times;
            </span>
          </div>
        </div>
      )}
      
      {/* User Deletion Confirmation Modal */}
      {showDeleteModal && (
        <div className="modal-overlay">
          <div className="modal-content-delete">
            <h2>Confirm Delete</h2>
            <p>Are you sure you want to delete user {userToDelete}?</p>
            <div>
              <button onClick={confirmDelete} className="button-formal-delete-yes">
                Yes
              </button>
              <button 
                onClick={() => setShowDeleteModal(false)} 
                className="button-formal-delete-no"
              >
                No
              </button>
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
            <span className="user-name">
              User {"" + localStorage.getItem("email")}
            </span>
          </div>
        </div>
      </header>
      
      <div className="container">
        {/* Sidebar Navigation */}
        <aside className="sidebar">
          <nav className="menu">
            <a href="#">
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
        
        {/* User Profiles Grid with Drag-and-Drop */}
        <div className="profile-container">
          <h2>User Profiles</h2>
          <DndContext
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={users.map((user) => user.email)}
              strategy={rectSortingStrategy}
            >
              <div className="grid-container">
                {/* Map each user to a profile card */}
                {users.map((user) => (
                  <ProfileCard
                    key={user.email}
                    id={user.email}
                    email={user.email}
                    hasPortfolio={user.hasPortfolio}
                    onViewPortfolio={handleProfileClick}
                    onCreatePortfolio={handleCreatePortfolioClick}
                    onDeleteUser={handleDeleteUser} 
                  />
                ))}
                
                {/* Placeholder card for creating new users */}
                <ProfileCard
                  isPlaceholder
                  onCreateUser={handleCreateUserClick}
                />
              </div>
            </SortableContext>
          </DndContext>
        </div>
      </div>
    </div>
  );
};

export default UserProfiles;