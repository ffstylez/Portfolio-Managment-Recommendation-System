"""
Portfolio Construction Module

This module implements portfolio optimization algorithms to construct investment 
portfolios based on mean-variance optimization. It uses a greedy asset selection 
approach combined with a risk-adjusted return objective function to build optimal 
portfolios with target asset weights.

The main algorithm works by:
1. Starting with an empty portfolio
2. Iteratively adding the best asset that maximizes portfolio return while controlling risk
3. Finalizing the portfolio with target asset allocation constraints

Usage:
    Run this script directly with required command-line arguments:
    - lambda_val: Risk aversion parameter (higher values = more risk averse)
    - investment_horizon: Investment horizon in months (e.g., 3, 6, 12)
    - portfolio_size: Number of assets to include in the portfolio
"""

import argparse
import numpy as np
import pandas as pd
from scipy.optimize import minimize
import json
from multiprocessing import Pool, cpu_count
from functools import partial

def optimize_single_asset(new_asset, selected_assets, tickers_dict, latest_predictions, cov_matrix, lambda_val, investment_horizon, portfolio_size, tolerance=1e-10):
    """
    Optimize portfolio for a single new asset addition.
    
    Args:
        new_asset (str): Ticker symbol of the new asset to evaluate
        selected_assets (list): List of ticker symbols already in the portfolio
        tickers_dict (dict): Mapping from ticker symbols to indices
        latest_predictions (pandas.DataFrame): DataFrame containing return predictions
        cov_matrix (numpy.ndarray): Covariance matrix of asset returns
        lambda_val (float): Risk aversion parameter
        investment_horizon (int): Investment horizon in months
        portfolio_size (int): Target size of the portfolio
        tolerance (float): Optimization tolerance parameter
        
    Returns:
        dict: Result containing asset, objective value, weights, and success flag
    """
    current_portfolio = selected_assets + [new_asset]
    selected_asset_indices = [tickers_dict[asset] for asset in current_portfolio]
    
    # Get predictions
    pred_col = f'return_{investment_horizon}m'
    if 'ticker' in latest_predictions:
        selected_mu = latest_predictions.loc[
            latest_predictions['ticker'].isin(current_portfolio),
            pred_col
        ].values
    else:
        selected_mu = latest_predictions.loc[current_portfolio, pred_col].values

    selected_cov_matrix = cov_matrix[np.ix_(selected_asset_indices, selected_asset_indices)]
    
    def objective_function(weights):
        """Calculate negative utility (to be minimized)"""
        portfolio_return = np.dot(weights, selected_mu)
        portfolio_variance = np.dot(weights.T, np.dot(selected_cov_matrix, weights))
        return -(portfolio_return - (lambda_val / 2) * portfolio_variance)
    
    def get_dynamic_bounds(current_size, target_size):
        """Set appropriate bounds based on portfolio size"""
        if current_size == 1:
            return [(1.0, 1.0)]
        elif current_size == target_size:
            return [(0.02, 0.15)] * current_size  # Final constraints
        else:
            return [(0.0, 1.0)] * current_size    # Looser constraints during selection
            
    constraints = {'type': 'eq', 'fun': lambda x: np.sum(x) - 1}
    bounds = get_dynamic_bounds(len(current_portfolio), portfolio_size)
    initial_weights = np.array([1/len(current_portfolio)] * len(current_portfolio))
    
    result = minimize(
        objective_function,
        initial_weights,
        method='SLSQP',
        bounds=bounds,
        constraints=constraints,
        options={'ftol': 1e-8}
    )
    
    # Format weights to 3 decimal places if optimization was successful
    formatted_weights = np.round(result.x, 3) if result.success else None
    
    return {
        'asset': new_asset,
        'objective_value': result.fun if result.success else float('inf'),
        'weights': formatted_weights,
        'success': result.success
    }

def optimize_portfolio_rolling_parallel(portfolio_size, lambda_val, latest_predictions, cov_matrix, investment_horizon, n_processes=None, tolerance=1e-10):
    """
    Parallelized version of portfolio optimization using multiprocessing.
    
    This function uses a greedy approach to iteratively build an optimal portfolio:
    1. Starting with an empty portfolio
    2. At each step, evaluating the addition of each remaining asset in parallel
    3. Adding the asset that provides the best improvement to the objective function
    4. Repeating until the target portfolio size is reached
    5. Performing a final optimization with tighter allocation constraints
    
    Args:
        portfolio_size (int): Target number of assets in the portfolio
        lambda_val (float): Risk aversion parameter (higher value = more risk averse)
        latest_predictions (pandas.DataFrame): DataFrame with return predictions
        cov_matrix (numpy.ndarray): Covariance matrix of asset returns
        investment_horizon (int): Investment horizon in months
        n_processes (int, optional): Number of parallel processes to use
        tolerance (float): Optimization tolerance parameter
        
    Returns:
        dict: Portfolio optimization results with selected assets and weights
    """
    if lambda_val <= 0:
        raise ValueError("lambda_val must be positive")

    num_assets_universe = len(latest_predictions)
    if cov_matrix.shape != (num_assets_universe, num_assets_universe):
        raise ValueError("Inconsistent input shapes between covariance matrix and predictions")

    if portfolio_size > num_assets_universe or portfolio_size <= 0:
        raise ValueError("Invalid portfolio size")

    # Create ticker to index mapping
    tickers = latest_predictions['ticker'].tolist() if 'ticker' in latest_predictions else latest_predictions.index.tolist()
    tickers_dict = {ticker: idx for idx, ticker in enumerate(tickers)}

    selected_assets = []
    all_selected_assets = []
    all_weights = []
    all_objective_values = []
    
    # Determine number of processes
    if n_processes is None:
        n_processes = max(1, cpu_count() - 1)
    
    # Create a pool of workers
    with Pool(processes=n_processes) as pool:
        for k in range(portfolio_size):
            remaining_assets = list(set(tickers) - set(selected_assets))
            
            optimize_func = partial(
                optimize_single_asset,
                selected_assets=selected_assets,
                tickers_dict=tickers_dict,
                latest_predictions=latest_predictions,
                cov_matrix=cov_matrix,
                lambda_val=lambda_val,
                investment_horizon=investment_horizon,
                portfolio_size=portfolio_size,
                tolerance=tolerance
            )
            
            results = pool.map(optimize_func, remaining_assets)
            best_result = min(results, key=lambda x: x['objective_value'])
            
            if best_result['success']:
                selected_assets.append(best_result['asset'])
                all_selected_assets.append(selected_assets.copy())
                all_weights.append(best_result['weights'])
                all_objective_values.append(best_result['objective_value'])
            else:
                break

    if not selected_assets:
        return None

    # Final optimization with target bounds
    final_indices = [tickers_dict[asset] for asset in selected_assets]
    pred_col = f'return_{investment_horizon}m' 
    final_mu = latest_predictions.loc[
               latest_predictions['ticker' if 'ticker' in latest_predictions else 'index'].isin(selected_assets),
                pred_col].values
    
    final_cov = cov_matrix[np.ix_(final_indices, final_indices)]

    final_result = minimize(
        lambda w: -(np.dot(w, final_mu) - (lambda_val / 2) * np.dot(w.T, np.dot(final_cov, w))),
        all_weights[-1],
        method='SLSQP',
        bounds=[(0.02, 0.15)] * len(selected_assets),  # Final constraints: min 2%, max 15%
        constraints={'type': 'eq', 'fun': lambda x: np.sum(x) - 1},
        options={'ftol': 1e-8}
    )

    # Format weights to 3 decimal places
    weights = np.round(final_result.x if final_result.success else all_weights[-1], 3).tolist()

    return {
        'selected_assets': selected_assets,
        'weights': weights,
        'optimal_value': final_result.fun if final_result.success else all_objective_values[-1],
        'all_selected_assets': all_selected_assets,
        'all_weights': all_weights,
        'all_objective_values': all_objective_values,
        'success': final_result.success,
        'message': final_result.message
    }

def convert_to_serializable(obj):
    """
    Convert various data types to JSON-serializable formats.
    
    Args:
        obj: Object to be converted (numpy array, list, dict, float, etc.)
        
    Returns:
        Object in a JSON-serializable format
    """
    if isinstance(obj, np.ndarray):
        return np.round(obj, 3).tolist()  # Round numpy arrays to 3 decimal places
    elif isinstance(obj, list):
        return [convert_to_serializable(item) for item in obj]
    elif isinstance(obj, dict):
        return {key: convert_to_serializable(value) for key, value in obj.items()}
    elif isinstance(obj, float):
        return round(obj, 3)  # Round individual float values to 3 decimal places
    else:
        return obj

if __name__ == "__main__":
    try:
        # Parse command-line arguments
        parser = argparse.ArgumentParser(description="Optimize a portfolio based on inputs.")
        parser.add_argument("lambda_val", type=float, help="Risk aversion parameter (lambda).")
        parser.add_argument("investment_horizon", type=int, help="Investment horizon in months.")
        parser.add_argument("portfolio_size", type=int, help="Desired number of assets in the portfolio.")
        args = parser.parse_args()
        # Run the optimization function

        latest_predictions = pd.read_csv(f'latest_predictions.csv')
        cleaned_cov_matrix_np = np.load(f'cleaned_cov_matrix_np.npy')


        result = optimize_portfolio_rolling_parallel(
            portfolio_size=args.portfolio_size,
            lambda_val=args.lambda_val,
            latest_predictions=latest_predictions,
            cov_matrix=cleaned_cov_matrix_np,
            investment_horizon=args.investment_horizon,
            n_processes=4)


        keys_to_remove = ['optimal_value', 'all_selected_assets', 'all_objective_values', 'success', 'message', 'all_weights']
        for key in keys_to_remove:
            result.pop(key, None)  # Use pop to safely remove the key if it exists
        # Debug optimization result
        print(json.dumps(convert_to_serializable(result)))
    except Exception as e:
        # Print any errors that occur
        print(f"Error: {str(e)}")
        import sys
        sys.exit(1)

