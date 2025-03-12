# get_price_data.py Documentation

## Overview
`get_price_data.py` is a data processing module that handles the retrieval, processing, and analysis of stock price data. It provides a comprehensive pipeline for fetching historical stock data, calculating returns over various time horizons, computing risk metrics (beta), and creating covariance matrices necessary for portfolio optimization.

## Key Functions

### Data Retrieval
- `fetch_stock_data(ticker)`: Retrieves historical price data for a stock from Yahoo Finance, starting from 2009.

### Data Processing
- `calculate_horizon_returns(df)`: Calculates forward-looking returns for multiple time horizons (2-24 months).
- `compute_intervals_betas(df, hist_sp500, intervals)`: Computes beta coefficients for a stock against the S&P 500 at various time intervals.
- `compute_expected_returns_multiple_rates(df)`: Computes expected returns using CAPM model with multiple treasury rates.

### Batch Processing
- `get_price_data(tickers, all_close_prices)`: Processes data for multiple tickers and saves results to CSV files.
- `clean_price_data(folder_path)`: Cleans price data by removing rows with NaN values.
- `custom_fill(df)`: Fills missing values in a DataFrame using a custom method.

### Covariance Computation
- `compute_cov(prices_df, interval)`: Computes the covariance matrix of asset returns at specified intervals (e.g., 2M, 3M, etc.).

## Main Workflow
When executed as a script, the module:
1. Loads S&P 500 constituent tickers from a CSV file
2. Fetches historical S&P 500 index data
3. Processes stock price data for all tickers
4. Computes covariance matrices at different time intervals (2M, 3M, 4M, 5M, 6M, 8M, 12M)
5. Saves resulting covariance matrices as NumPy files for later use in portfolio optimization

## Dependencies
- pandas
- numpy
- yfinance
- statsmodels
- finnhub (API client, though not extensively used in the main workflow)

## Outputs
- Individual CSV files for each ticker in the 'price_data' directory
- Covariance matrices saved as NumPy files (cov_2month.npy, cov_3month.npy, etc.)
