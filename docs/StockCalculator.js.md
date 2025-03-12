# StockCalculator.js Documentation

## Overview
The StockCalculator component provides a simple yet powerful tool for users to calculate potential earnings or losses from stock investments within the Portfolio Management Recommendation System. It enables quick "what-if" scenarios by combining current market data with user-defined investment parameters.

## Purpose
This component serves as a financial planning tool that helps users evaluate investment opportunities by calculating potential returns based on the current market prices. It bridges the gap between raw stock data and actionable financial insights by contextualizing price information in terms of actual investment outcomes.

## Key Components

### State Management
- `stocks`: Stores the complete list of available stocks from CSV data
- `stockSymbol`: Tracks the currently selected stock for calculation
- `numShares`: Manages the user-entered number of shares
- `initialInvestment`: Holds the user-specified initial investment amount
- `earnings`: Stores the calculated earnings/loss result
- `loading`: Controls loading state during API requests
- `error`: Handles error messages for user feedback

### Stock Selection
- Implements a searchable dropdown for easy stock discovery
- Loads stock options from CSV file with ticker and name information
- Provides clear labeling and formatting for stock selection

### Investment Parameters
- Number of shares input with numeric validation
- Initial investment amount input with numeric validation
- Clear input fields with appropriate labeling

### Results Display
- Shows calculated earnings/losses with appropriate formatting
- Color-codes results (green for profit, red for loss)
- Displays loading state during calculations
- Shows validation errors when inputs are invalid

## API Integration
- Connects to the Twelve Data API for current stock prices
- Uses the most recent closing price for calculations
- Handles API errors gracefully with user feedback

## Key Functions

### `calculateEarnings()`
Validates inputs, fetches current stock price data, and calculates the potential earnings or loss from the investment.

## Data Calculation
The component performs a simple but effective calculation:
```
Earnings = (Current Price × Number of Shares) - Initial Investment
```
- Positive result indicates profit
- Negative result indicates loss

## Dependencies
- React Select for enhanced dropdown functionality
- Axios for API requests
- PapaParse for CSV data parsing

## Usage
This calculator is accessed from the Interactive Tools section of the application. Users can utilize it for quick investment scenario planning without affecting their actual portfolio. It serves as both an educational tool and a decision support mechanism for potential investments.

## Technical Details
- Input validation prevents calculations with invalid data
- Error handling for API failures
- Accessible numeric inputs with appropriate constraints
- Real-time API data ensures calculations use current market prices
