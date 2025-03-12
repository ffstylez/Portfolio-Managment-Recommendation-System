# ContactUs.js Documentation

## Overview
The ContactUs.js file implements a React component that displays contact information for the Portfolio Management Recommendation System. It provides users with a way to reach out to the system administrators.

## Purpose
This component serves as a simple contact page where users can find contact details for the system administrators. It maintains the consistent layout and navigation structure of the application while providing a dedicated space for contact information.

## Component Structure

### State Management
The component uses minimal state, primarily for managing the logout confirmation modal:
- `showSureModal`: Controls the visibility of the logout confirmation dialog

### Navigation Functions
The component includes several navigation handlers using React Router's `useNavigate` hook:
- `handleDashBoardClick`: Navigate to dashboard
- `handleNewsAndInsightsClick`: Navigate to news page
- `handleInteractiveToolsClick`: Navigate to tools page
- `handleContactClick`: Navigate to current page (contact)
- `handleLogoutClick`: Handle user logout

### UI Layout
The component follows the application's standard layout pattern:
- Header with logo and notification icon
- Sidebar with navigation menu
- Main content area with contact information

## Component Features

### Contact Information Display
Displays structured contact information for system administrators:
```jsx
<div>
  <h3>Our Information</h3>
  <br />
  <p>
    <strong>Bayan Yahia</strong> - bayan@example.com - 123456789
  </p>
  <br />
  <p>
    <strong>Adeeb Ganadry</strong> - adeeb@example.com - 987654321
  </p>
</div>
```

### Logout Confirmation
Implements a confirmation modal before logging out:
```jsx
{showSureModal && (
  <div className="modal-overlay">
    <div className="modal-content-delete">
      {/* Modal content */}
    </div>
  </div>
)}
```

### Session Management
Handles user logout by clearing local storage:
```javascript
const handleLogoutClick = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("stockData");
  localStorage.removeItem("priceBuy");
  localStorage.removeItem("storedFor");
  navigate("/");
};
```

## Navigation System
Provides consistent navigation through the sidebar menu:
```jsx
<aside className="sidebar">
  <nav className="menu">
    <a href="#" onClick={handleDashBoardClick}>
      <img src={dashboardIcon} alt="Dashboard" className="menu-icon" />
      Dashboard
    </a>
    {/* Other navigation links */}
  </nav>
</aside>
```

## Dependencies
- React and React hooks (useState)
- React Router for navigation
- Various image assets for UI elements
- Axios (imported but not used in this component)

## Related Files
- UserProfiles component (dashboard)
- NewsAndInsights component
- InteractiveTools component
- CSS styles (likely shared with other components)
