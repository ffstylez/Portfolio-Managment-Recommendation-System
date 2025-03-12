# StockComparison.js Documentation

## Overview
The StockComparison component is an interactive tool within the Portfolio Management Recommendation System that allows users to compare the historical performance of multiple stocks side by side. It provides visual representation through line charts and supports dynamic addition and removal of stocks for comparison.

## Purpose
This component empowers users to make data-driven investment decisions by directly comparing stock performances over the same time period. Users can identify correlations, divergences, and relative strengths between different securities, gaining insights that help with portfolio diversification and optimization.

## Key Components

### State Management
- `stocks`: Stores the complete list of available stocks from CSV data
- `stockSymbols`: Tracks the currently selected stocks for comparison
- `comparisonData`: Holds the processed historical data for chart rendering
- `loading`: Controls loading state during API requests
- `errorMessage`: Manages error display for user feedback

### Dynamic Stock Selection
- Implements a multi-select interface with search functionality
- Supports adding and removing stocks from the comparison
- Validates selections before data fetching

### Data Visualization
- Renders a multi-line chart with color-coded lines for each stock
- Displays price movement over time with synchronized x-axis (dates)
- Shows a legend identifying each stock in the comparison

## API Integration
- Connects to the Twelve Data API for historical price information
- Makes parallel requests for multiple stocks
- Processes and normalizes data for consistent comparison

## Key Functions

### `fetchStockData()`
Retrieves historical price data for all selected stocks and processes it for visualization.

### `handleRemoveStock(index)`
Removes a specific stock from the comparison selection.

## UI Features
- Searchable dropdown selectors for easy stock discovery
- Add/remove buttons for flexible comparison configuration
- Dynamic chart rendering with distinct colors for each stock
- Loading indicator during data fetching
- Error messages for validation and API issues

## Data Processing
- Parses CSV data for stock selection options
- Makes parallel API requests for efficiency
- Transforms API responses into chart-compatible format
- Assigns distinct colors to each stock line

## Dependencies
- React Select for enhanced dropdown functionality
- Chart.js and react-chartjs-2 for data visualization
- Axios for API requests
- PapaParse for CSV data parsing

## Usage
This tool is accessed from the Interactive Tools section of the application, where users can freely select stocks to compare without affecting their actual portfolio. It serves as both an educational tool and a decision support mechanism for portfolio adjustments.

## Technical Details
- Implements Promise.all for parallel API requests
- Uses dynamic color generation for visual distinction
- Synchronizes all stock data to the same time period
- Preserves aspect ratio in visualization for proper trend analysis
