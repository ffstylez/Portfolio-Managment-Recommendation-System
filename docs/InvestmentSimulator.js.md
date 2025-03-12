# InvestmentSimulator.js Documentation

## Overview
The InvestmentSimulator component provides a virtual environment for users to practice investment strategies without financial risk. It simulates buying and selling stocks with a virtual balance, allowing users to learn about portfolio management in a safe, educational setting.

## Purpose
This tool helps users gain practical investment experience, understand market dynamics, and test various portfolio allocation strategies before applying them to real investments. It serves as both an educational resource and a decision support tool.

## Key Components

### State Management
- `stocks`: Available stocks loaded from CSV data
- `balance`: User's virtual account balance
- `portfolio`: Current holdings in the virtual portfolio
- `selectedStock`: Currently selected stock for transactions
- `numShares`: Number of shares to buy or sell
- `loading`: Tracks API request states
- `errorMessage`: Stores validation or API error messages

### Data Sources
- Loads stock symbols and names from a CSV file
- Fetches real-time price data from Twelve Data API
- Calculates portfolio value and allocation dynamically

### Transaction Simulation
- Buy functionality with balance and input validation
- Sell functionality with portfolio updates
- Price tracking for profit/loss calculation
- Portfolio allocation visualization

## Visualization
- Pie chart showing portfolio allocation percentages
- Color-coded sectors for different holdings
- Interactive elements for better understanding of distribution

## Key Functions

### `buyStock()`
Validates inputs, fetches current stock price, calculates cost, and updates user's portfolio and balance if funds are sufficient.

### `sellStock(symbol)`
Removes the specified stock from the portfolio and adds its value back to the user's balance.

### `pieChartData()`
Prepares data for the pie chart visualization, calculating percentage allocations for each holding.

## User Interface
- Stock selection with searchable dropdown
- Share quantity input
- Buy button with validation
- Portfolio list with sell options
- Visual representation of portfolio allocation
- Balance display

## Data Flow
1. User selects a stock and enters share quantity
2. System fetches current price when buy is clicked
3. Transaction is validated against available balance
4. Portfolio and balance are updated accordingly
5. Pie chart refreshes to show new allocation

## Dependencies
- React Select for searchable dropdown
- Papa Parse for CSV parsing
- Axios for API requests
- React-ChartJS-2 for pie chart visualization
- Custom CSS for styling

## Integration
This component is part of the Interactive Tools section and can be accessed from the main navigation menu.

## Limitations
- Uses virtual balance only; not connected to real trading
- Stock data limited to symbols included in the CSV file
- Price data depends on external API availability
