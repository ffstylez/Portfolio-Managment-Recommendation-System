# StockBoard.js Documentation

## Overview
The StockBoard component is a core feature of the Portfolio Management Recommendation System that displays a user's stock portfolio with detailed analytics. It supports both tabular and chart-based views of portfolio data, with real-time financial information and performance metrics.

## Purpose
This component provides a comprehensive dashboard for users to monitor their investment portfolio, analyze performance, and make informed decisions. It fetches, processes, and displays stock data with optimized caching and performance features.

## Key Components

### State Management
The component uses several React state hooks to manage:
- Portfolio data including tickers, weights, and purchase prices
- UI states (loading, view mode, modals)
- Sorting configuration for tabular data
- Error handling

### Data Fetching & Caching
- Implements a sophisticated caching system to reduce API calls
- Stores portfolio data and stock prices in localStorage
- Intelligently refreshes data at appropriate intervals
- Handles API rate limiting with sequential requests

### Portfolio Analytics
- Calculates performance metrics (total change, percent change)
- Determines portfolio value based on current prices
- Tracks individual stock performance since purchase
- Associates weights with each portfolio asset

### Responsive UI
- Toggles between table and chart views
- Implements sortable columns with visual indicators
- Provides loading indicators during data fetching
- Includes confirmation modals for critical actions

## API Integration
- Connects to Finnhub API for real-time stock quotes
- Fetches company profile information
- Retrieves historical data for charting
- Communicates with backend API for portfolio management

## Key Functions

### `fetchPortfolio()`
Retrieves the user's portfolio configuration from the backend API or cache.

### `fetchStockData()`
Fetches current stock prices and company information, calculating performance metrics.

### `handleSort(key)`
Manages the sorting of table columns with toggleable ascending/descending order.

### `deletePortfolio()`
Handles the deletion of a portfolio with confirmation steps.

### `handleViewToggle(selectedView)`
Switches between table and chart visualization modes.

## Dependencies
- React Router for navigation
- Axios for API requests
- RotatingLines for loading animations
- PortfolioChart component for chart visualization

## Usage
This component is accessed through the dashboard navigation and displays portfolio data specific to the authenticated user identified in the URL parameter.

## Performance Considerations
- Implements data caching to minimize API calls
- Uses debouncing for API requests to avoid rate limiting
- Periodically refreshes data (every 60 seconds)
- Lazy loads historical data only when needed
