# PortfolioChart.js Documentation

## Overview
The PortfolioChart component visualizes a user's investment portfolio performance over time using interactive line charts. It displays the total portfolio value, performance metrics, and allows users to view data across different time periods.

## Purpose
This component transforms raw historical stock data into meaningful visual representations of portfolio value changes, helping users understand their investment performance at a glance and make more informed financial decisions.

## Key Components

### State Management
- `chartData`: Stores processed time-series data for rendering
- `timeInterval`: Controls the time period displayed (1d, 1w, 1m, etc.)
- `isLoading`: Tracks the loading state during API calls
- `error`: Captures and displays any errors during data fetching

### Data Processing
The component implements several data processing functions:
- Aggregates historical data across multiple stocks
- Calculates weighted portfolio values based on owned units
- Filters data based on selected time interval
- Computes performance metrics (initial value, current value, change)

### Interactive Features
- Time interval selector (1 day to 6 months)
- Tooltip displaying precise values on hover
- Responsive chart layout that adapts to container size
- Color-coded performance indicators

## API Integration
- Makes authenticated requests to backend for historical stock data
- Processes response data into chart-friendly format
- Implements error handling for API failures

## Key Functions

### `fetchHistoricalData()`
Retrieves historical price data for each ticker in the portfolio and processes it into a unified dataset showing portfolio value over time.

### `intervalToDays(interval)`
Converts user-friendly time interval selections (1d, 1w, 1m) into numerical day values for data filtering.

### `getFilteredData()`
Filters the complete dataset to match the currently selected time interval.

## Visualization Components
Uses Recharts library for rendering:
- `LineChart`: Main chart component
- `Line`: Renders the portfolio value line
- `XAxis` & `YAxis`: Display date and value scales
- `Tooltip`: Shows detailed information on hover
- `CartesianGrid`: Provides reference lines
- `Legend`: Labels the data series

## Performance Considerations
- Only fetches data when portfolio composition changes
- Implements loading indicators during data processing
- Performs calculations efficiently to handle large datasets
- Formats date labels appropriately based on time interval

## Dependencies
- Recharts for visualization
- Axios for API requests
- React hooks for state management
- RotatingLines for loading animation

## Usage
This component is used as a child component within the StockBoard, rendering when the user selects the chart view option.
