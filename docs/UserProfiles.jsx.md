# UserProfiles.jsx Documentation

## Overview
The UserProfiles component serves as the central dashboard for the Portfolio Management Recommendation System, providing an administrative interface to manage multiple user profiles. It implements a drag-and-drop interface for organizing user cards and offers quick access to portfolio management functions.

## Purpose
This component enables system administrators or main users to:
- View all registered users and their portfolio status
- Create new user accounts
- Manage existing user portfolios 
- Delete user accounts
- Access portfolios for detailed analysis
- Navigate to other system features

## Key Components

### State Management
- `users`: Array of user objects with email and portfolio status
- `showSureModal`: Controls logout confirmation dialog
- `showRegisterModal`: Controls user creation interface
- `showDeleteModal`: Controls user deletion confirmation
- `userToDelete`: Tracks which user is pending deletion
- Form fields for registration (email, password, confirmPassword)

### Interactive UI Elements
- Drag and drop functionality for organizing user cards
- Confirmation modals for critical actions
- User registration form
- Profile cards with conditional rendering based on portfolio status
- Navigation sidebar with system-wide access

### ProfileCard Component
An inner component that displays user information with:
- Email identification
- Visual indicators for portfolio status
- Action buttons (View Portfolio, Create Portfolio, Delete User)
- Drag-and-drop handlers for reordering

## API Integration
- Fetches user list from backend with authentication
- Submits new user registrations
- Handles user deletion requests
- Maintains authenticated sessions via tokens

## Key Functions

### `handleDragEnd(event)`
Manages the reordering of user cards through drag-and-drop functionality using the DndKit library.

### `handleCreateUserClick()`
Opens the registration modal for adding new users to the system.

### `handleDeleteUser(email)`
Initiates the user deletion process by setting up the confirmation dialog.

### `confirmDelete()`
Executes the user deletion API call and updates the UI accordingly.

### `handleProfileClick(email)` & `handleCreatePortfolioClick(email)`
Navigation handlers that direct to portfolio viewing or creation pages.

### `handleSignup()`
Validates registration form inputs and submits new user data to the backend.

## Dependencies
- React and React hooks for state management
- React Router for navigation
- Axios for API requests
- @dnd-kit libraries for drag-and-drop functionality
- Custom CSS for styling

## Integration Points
- Connects to multiple backend API endpoints for user management
- Links to other main system components (StockBoard, UserPreferences, etc.)
- Manages JWT authentication for secure API calls

## User Experience Features
- Visual differentiation between users with and without portfolios
- Confirmation dialogs for destructive actions
- Consistent navigation through the sidebar menu
- Form validation with helpful error messages
- Drag-and-drop interface for organizing users
