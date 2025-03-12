# portfolio_construction.py Documentation

## Overview
`portfolio_construction.py` implements portfolio optimization algorithms to construct investment portfolios based on mean-variance optimization. It uses a greedy asset selection approach combined with a risk-adjusted return objective function to build optimal portfolios with target asset weights.

## Key Functions

### Optimization
- `optimize_single_asset(new_asset, selected_assets, tickers_dict, latest_predictions, cov_matrix, lambda_val, investment_horizon, portfolio_size, tolerance)`: Evaluates the potential addition of a single new asset to the current portfolio selection.
- `optimize_portfolio_rolling_parallel(portfolio_size, lambda_val, latest_predictions, cov_matrix, investment_horizon, n_processes, tolerance)`: Implements a parallelized version of the greedy portfolio construction algorithm, utilizing multiple CPU cores for faster asset evaluation.

### Utility Functions
- `convert_to_serializable(obj)`: Converts various data types (NumPy arrays, lists, dictionaries) to JSON-serializable formats, with appropriate rounding of numerical values.

## Main Workflow
When executed as a script, the module:
1. Parses command-line arguments for risk aversion parameter (`lambda_val`), investment horizon, and desired portfolio size
2. Loads latest prediction data and covariance matrix from files
3. Runs portfolio optimization to select assets and determine optimal weights
4. Removes unnecessary information from the results
5. Outputs the optimized portfolio as JSON, including selected assets and their weights

## Dependencies
- numpy
- pandas
- scipy.optimize (minimize)
- json
- multiprocessing
- argparse

## Outputs
- JSON output to standard output containing:
  - List of selected assets (tickers)
  - Optimized portfolio weights for each asset