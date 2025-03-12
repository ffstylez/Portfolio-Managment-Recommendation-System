# InteractiveTools.js Documentation

## Overview
The InteractiveTools.js file implements a React component that provides various financial calculation and analysis tools for users of the Portfolio Management Recommendation System. It serves as a container for multiple specialized financial tools.

## Purpose
This component offers interactive financial tools that help users make informed investment decisions through stock calculations, comparisons, and investment simulations. It provides a unified interface for accessing these tools while maintaining the application's navigation structure.

## Component Structure

### State Management
The component uses React's useState hook to manage:
- Currently selected tool (`currentTool`)
- Modal visibility for logout confirmation (`showSureModal`)

### Sub-Components
The file imports and conditionally renders three major tool components:
1. **StockCalculator**: For calculating stock-related metrics
2. **StockComparison**: For comparing different stocks
3. **InvestmentSimulator**: For simulating investment scenarios

### Navigation Functions
The component includes several navigation functions using React Router's `useNavigate` hook:
- `handleStockBoardClick`: Navigate to dashboard
- `handleNewsAndInsightsClick`: Navigate to news page
- `handleInteractiveToolsClick`: Navigate to interactive tools
- `handleContactClick`: Navigate to contact page
- `handleLogoutClick`: Handle user logout

### UI Layout
The component structures the UI into several sections:
- Header with logo and user information
- Sidebar with navigation menu
- Main content area with tool selection and the current tool

## Component Features

### Tool Switching
Users can switch between different financial tools using button controls:
```javascript
const handleCalculatorClick = () => setCurrentTool("calculator");
const handleComparisonClick = () => setCurrentTool("comparison");
const handleSimulatorClick = () => setCurrentTool("simulator");
```

### Logout Confirmation
Implements a confirmation modal before logging out:
```javascript
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

## Dependencies
- React and React hooks (useState)
- React Router for navigation
- Imported tool components
- CSS styling from InteractiveTools.css
- Various asset images for UI elements

## Related Files
- **StockCalculator.js**: Component for stock calculations
- **StockComparison.js**: Component for comparing stocks
- **InvestmentSimulator.js**: Component for investment simulations
- **InteractiveTools.css**: Styling for this component
