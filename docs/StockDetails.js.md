# StockDetails.js Documentation

## Overview
The StockDetails component provides comprehensive information about individual stocks within the Portfolio Management Recommendation System. It displays detailed stock information, interactive price charts with adjustable timeframes, and relevant company data for users to make informed investment decisions.

## Purpose
This component serves as a detailed view for individual stocks, allowing users to analyze historical performance, access key information, and visualize price trends over customizable time periods. It bridges the gap between portfolio overview and in-depth stock analysis.

## Key Components

### State Management
- `stockDetails`: Stores the fundamental information about the selected stock
- `stockGraphData`: Manages the processed data for the chart visualization
- `loading`: Controls loading state during data fetching
- `error`: Handles and displays error messages
- `timeframe`: Tracks the selected time period for the chart

### Data Sources
- Parses stock information from a local CSV file
- Fetches historical price data from the Twelve Data API
- Dynamically generates chart data based on selected timeframes

### Interactive Chart
- Implements a line chart visualization using react-chartjs-2
- Provides multiple timeframe options (1 week to 5 years)
- Displays closing prices over the selected period
- Updates dynamically when timeframe changes

## API Integration
- Uses axios to fetch data from the Twelve Data API
- Handles API responses and errors gracefully
- Transforms API data into chart-compatible format

## Key Functions

### `fetchStockGraphData(ticker, timeframe)`
Fetches historical price data for the specified stock and timeframe, then formats it for chart display.

### `daysAgo(days)`
Helper function that calculates a date X days before the current date for API requests.

### `handleTimeframeChange(event)`
Updates the selected timeframe and triggers a new data fetch.

## UI Features
- Responsive price chart with line visualization
- Dropdown selector for time period adjustment
- Stock information section with company details
- Return button for navigation back to the portfolio view
- Loading and error states for user feedback

## Data Manipulation
The component handles several data transformations:
- Date formatting for chart labels
- Price data extraction and parsing
- Dynamic chart configuration based on user selections
- Date range calculations for API parameters

## Dependencies
- React Router for navigation and parameter handling
- Chart.js and react-chartjs-2 for data visualization
- Axios for API requests
- PapaParse for CSV parsing

## Usage
This component is accessed when a user clicks on a specific stock from their portfolio view, with the stock symbol passed as a URL parameter. It provides a self-contained view with its own navigation control back to the portfolio.
