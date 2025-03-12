# UserPreferences.js Documentation

## Overview
The UserPreferences component implements an interactive questionnaire that captures users' investment preferences, risk tolerance, and financial goals. This data is crucial for generating personalized portfolio recommendations tailored to each user's individual needs.

## Purpose
This component serves as the data collection mechanism that drives the portfolio recommendation engine. By gathering specific information about a user's investment approach, the system can create optimized portfolios that balance risk and return according to personal preferences.

## Key Features

### Interactive Questionnaire
The component presents a series of questions about:
- Investment familiarity and experience
- Risk tolerance and comfort with market volatility
- Reaction to potential portfolio declines
- Drawdown tolerance across different time periods
- Investment horizon (time frame)
- Initial investment amount
- Desired portfolio size

### Card-Based Selection
- Uses interactive "card" elements for preference selection
- Provides visual feedback for selected options
- Implements an intuitive click-based interface

### Form Validation
- Ensures all required fields are completed
- Validates numerical inputs for investment amounts
- Provides clear error messages for incomplete or invalid responses

### Welcome Modal
- Orients users to the preference collection process
- Emphasizes the importance of accurate responses
- Can be dismissed when ready to proceed

## API Integration

### Data Submission
- Collects all preference data into a structured format
- Authenticates using JWT from localStorage
- Submits data to the `/save-preferences` endpoint
- Handles success and error responses appropriately

## State Management

### User Responses
- Tracks selections for all questionnaire items
- Maintains form validation status
- Manages loading states during API operations
- Controls modal visibility

## Component Flow

1. User is welcomed with an introductory modal
2. User answers a series of questions about investment preferences
3. User selects numeric preferences from dropdown menus
4. Form validates all inputs before submission
5. On successful submission, user is redirected to their portfolio view
6. On error, appropriate feedback is displayed

## Technical Implementation

### State Variables
- `responses`: Object containing all user preference selections
- `errorMessage`: String for validation and submission errors
- `isLoading`: Boolean for API request status
- `progress`: Number tracking questionnaire completion
- `isModalOpen`: Boolean controlling the welcome modal

### Key Functions
- `handleSelect(question, answer)`: Updates response state for question cards
- `validateForm()`: Ensures all required fields are completed
- `handleFormSubmit(event)`: Processes form submission with validation

## UI Components
- Header with logo and branding
- Welcome modal with instructions
- Card-based selection interface
- Dropdown selectors for numeric preferences
- Submit button with loading indicator
- Validation error messages

## Styling
The component uses custom CSS from `UserPreferences.css` to create:
- Visually distinct selection cards
- Clear visual feedback for selected options
- Responsive layout for various screen sizes
- Consistent branding and color scheme

## Dependencies
- React for component structure and state management
- React Router for navigation and URL parameter handling
- TailSpin from react-loader-spinner for loading animation
- Axios for API communication
- Custom CSS for styling
