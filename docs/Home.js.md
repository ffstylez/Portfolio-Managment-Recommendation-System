# Home.js Documentation

## Overview
The Home.js file implements the landing page component for the Portfolio Management Recommendation System. It serves as the entry point for users and provides authentication functionality.

## Purpose
This component provides the first interaction point for users, offering a welcoming interface and handling user authentication through login and signup processes. It redirects authenticated users to their dashboard and new users to the preferences setup.

## Component Structure

### State Management
The component uses several React state variables:
- `showModal`: Controls the visibility of the authentication modal
- `isLogin`: Toggles between login and signup modes
- `email`, `password`, `confirmPassword`: Form input values
- `error`: Authentication error messages

### Authentication Flows
The component implements two main authentication flows:

#### Login Flow
1. Validates user inputs (email format, password length)
2. Sends credentials to backend API
3. Stores authentication token in localStorage
4. Redirects to dashboard on success

#### Signup Flow (Partial Implementation)
1. Validates user inputs (email format, password length, matching passwords)
2. Sends registration data to backend API
3. Stores authentication token in localStorage
4. Redirects to user preferences setup

### UI Sections
The component structures the UI into:
- Header with logo and navigation
- Main content with welcome message
- Authentication modal with dynamic content based on login/signup mode

## Component Features

### Auto-Redirect for Authenticated Users
Checks for existing authentication token on load:
```javascript
useEffect(() => {
  if (localStorage.getItem("token")) {
    navigate("/UserProfiles");
  }
}, []);
```

### Form Validation
Includes validation for:
- Email format using regex
- Password length requirements
- Password matching for signup

```javascript
const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};
```

### Error Handling
Displays user-friendly error messages for:
- Missing required fields
- Invalid email format
- Password requirements
- Backend authentication errors

### Modal Display
Uses conditional rendering for the authentication modal:
```javascript
{showModal && (
  <div className="modal-overlay">
    <div className={`modal-content ${isLogin ? "login" : "signup"}`}>
      {/* Modal content */}
    </div>
  </div>
)}
```

## Dependencies
- React and React hooks (useState, useEffect)
- React Router for navigation
- CSS styling from Home.css
- Image assets for visual elements

## Related Files
- **Home.css**: Styling for the home component
- Backend API endpoints for authentication
- UserPreferences component (navigated to after signup)
