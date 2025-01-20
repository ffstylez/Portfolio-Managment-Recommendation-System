import finnhub
import pandas as pd
import datetime as dt   
import yfinance as yf
import statsmodels.api as sm
import os
import traceback
import time
import numpy as np

# Constants
intervals = [50, 70, 100, 120, 150, 180, 200, 220, 250, 280, 300, 320, 350]
treasury_rates = ['US3Y', 'US5Y', 'US7Y', 'US10Y', 'US20Y', 'US30Y']
treasury_csv = 'treasury_yields.csv'

def fetch_stock_data(ticker):
    stock = yf.Ticker(ticker)
    hist_data = stock.history(start="2009-01-01")
    hist_data.reset_index(inplace=True)

    hist_data['Date'] = pd.to_datetime(hist_data['Date']).dt.date
    hist_data.sort_values(by='Date', inplace=True)
    hist_data.drop(['Dividends', 'Stock Splits', 'symbol'], axis=1, inplace=True, errors='ignore')
    
    return hist_data

def calculate_horizon_returns(df):
    horizons = [2,3,4,5,6,8,12,18,24]
    df['Date'] = pd.to_datetime(df['Date'])
    df = df.sort_values('Date').reset_index(drop=True)
    df = df.set_index('Date')

    for horizon in horizons:
        target_dates = df.index + pd.DateOffset(months=horizon)
        future_close = df['Close'].reindex(target_dates, method='nearest').values
        df[f'future_close_{horizon}m'] = future_close
        df[f'return_{horizon}m'] = (future_close / df['Close']) - 1

    df = df.reset_index()
    return df

def compute_intervals_betas(df, hist_sp500, intervals):
    df['Date'] = pd.to_datetime(df['Date']).dt.tz_localize(None)
    hist_sp500['Date'] = pd.to_datetime(hist_sp500['Date']).dt.tz_localize(None)

    merged = pd.merge(
        df[['Date', 'Close']],
        hist_sp500[['Date', 'Close']],
        on='Date',
        how='inner',
        suffixes=('_stock', '_sp500')
    )

    betas = {}

    for n in intervals:
        merged[f'return_stock_{n}d'] = merged['Close_stock'].pct_change(n)
        merged[f'return_sp500_{n}d'] = merged['Close_sp500'].pct_change(n)
        
        temp = merged.dropna(subset=[f'return_stock_{n}d', f'return_sp500_{n}d']).copy()
        
        if len(temp) > 1:
            X = sm.add_constant(temp[f'return_sp500_{n}d'])
            y = temp[f'return_stock_{n}d']
            model = sm.OLS(y, X).fit()
            betas[n] = model.params.iloc[1]
        else:
            betas[n] = np.nan

    return betas

def compute_expected_returns_multiple_rates(df):
    annual_market_return = 0.08
    trading_days_per_year = 252

    treasury_yields = pd.read_csv("treasury_yields.csv")
    treasury_yields['Date'] = pd.to_datetime(
        treasury_yields['date'], infer_datetime_format=True, dayfirst=True
    )
    treasury_yields = treasury_yields[treasury_yields['Date'] > '2009-01-01']

    betas = compute_intervals_betas(df, hist_sp500, intervals)

    for rate in treasury_rates:
        treasury_yields[rate] = treasury_yields[rate] / 100.0

    df['Date'] = pd.to_datetime(df['Date'])
    df = pd.merge(df, treasury_yields[['Date'] + treasury_rates], on='Date', how='left')

    for n in intervals:
        market_return_n = annual_market_return * (n / trading_days_per_year)
        beta_n = betas.get(n, np.nan)

        for rate_column in treasury_rates:
            col_name = f'expected_return_{n}d_{rate_column}'
            df[col_name] = df[rate_column] + beta_n * (market_return_n - df[rate_column])
            
    df.drop(axis=1, labels=['US3Y', 'US5Y', 'US7Y', 'US10Y', 'US20Y', 'US30Y'], inplace=True)

    return df

def get_price_data(tickers, all_close_prices):
    missing_tickers = []
    for ticker in tickers:
        print("processing data for ticker " + ticker)
        df_price = fetch_stock_data(ticker)
        df_price = calculate_horizon_returns(df_price)
        df = compute_expected_returns_multiple_rates(df_price)
        
        if 'Date' not in df.columns:
            missing_tickers.append(ticker)
            raise ValueError(f"'Date' column missing in the DataFrame for {ticker}. Check data source.")

        df['Date'] = pd.to_datetime(df['Date'])
        prices_df = df[['Date', 'Close']].rename(columns={'Close': ticker})
        all_close_prices.append(prices_df)

        file_path = os.path.join('price_data', f"{ticker}_price_data.csv")
        df.to_csv(file_path, index=False)
        print(f"Saved data for {ticker} to {file_path}")

    return missing_tickers

def clean_price_data(folder_path: str):
    for file_name in os.listdir(folder_path):
        if file_name.endswith('.csv'):
            file_path = os.path.join(folder_path, file_name)
            print(f"Processing {file_name}...")
            df = pd.read_csv(file_path)
            cleaned_df = df.dropna()
            cleaned_df.to_csv(file_path, index=False)
            print(f"Cleaned {file_name} and saved to {file_path}")

def custom_fill(df):
    for col in df.columns:
        first_valid_index = df[col].first_valid_index()
        if first_valid_index:
            df.loc[:first_valid_index, col] = df.loc[:first_valid_index, col].fillna(0)
        else:
            df[col] = df[col].fillna(0)
        df[col] = df[col].fillna(method='ffill')
    return df

def compute_cov(prices_df: pd.DataFrame, interval: str = '2M') -> pd.DataFrame:
    """
    Compute the covariance matrix of asset returns.
    
    Parameters:
    prices_df (pd.DataFrame): DataFrame containing price data with dates as index.
    interval (str): Resampling interval (e.g., '2M' for 2 months, 'W' for weekly).
                    Uses pandas offset aliases: 
                    - 'W' for weekly
                    - 'M' for monthly
                    - '3M' for quarterly
                    - '2W' for bi-weekly
                    etc.
    
    Returns:
    pd.DataFrame: Covariance matrix of returns.
    """
    # Resample according to the specified interval (take the last price in each period)
    resampled_prices = prices_df.resample(interval).last()
    
    # Drop tickers (columns) with insufficient data
    valid_tickers = resampled_prices.columns[resampled_prices.count() > 1]
    resampled_prices = resampled_prices[valid_tickers]
    
    # Compute returns for the specified interval
    returns = resampled_prices.pct_change().dropna(how='all')
    
    # Compute and return the covariance matrix
    cov_matrix = returns.cov()
    cov_matrix.fillna(0, inplace=True)
    return cov_matrix

if __name__ == "__main__":
    # Example usage
    url = 'constituents.csv'
    companies_sp500 = pd.read_csv(url)
    tickers = companies_sp500['Symbol'].tolist()
    
    api_key = "your_api_key_here"
    finnhub_client = finnhub.Client(api_key=api_key)
    
    sp500_index = yf.Ticker('^GSPC')
    hist_sp500 = sp500_index.history(start="2009-01-01")
    hist_sp500 = hist_sp500.reset_index()
    hist_sp500['Date'] = pd.to_datetime(hist_sp500['Date']).dt.tz_localize(None)

    all_close_prices = []
    missing = get_price_data(tickers, all_close_prices)
    
    prices_df = pd.concat(
        [df.set_index('Date') for df in all_close_prices], axis=1
    )
    
    prices_df = custom_fill(prices_df)
    
    # Example of using the modified covariance function with different intervals  # Monthly
    two_month_cov = compute_cov(prices_df, '2M')  
    three_month_cov = compute_cov(prices_df, '3M')  
    four_month_cov = compute_cov(prices_df, '4M')  
    five_month_cov = compute_cov(prices_df, '5M')  
    six_month_cov = compute_cov(prices_df, '6M')  
    eight_month_cov = compute_cov(prices_df, '8M')  
    twelve_month_cov = compute_cov(prices_df, '12M')  

    two_month_cov.reset_index(inplace=True)
    three_month_cov.reset_index(inplace=True)
    four_month_cov.reset_index(inplace=True)
    five_month_cov.reset_index(inplace=True)
    six_month_cov.reset_index(inplace=True)
    eight_month_cov.reset_index(inplace=True)
    twelve_month_cov.reset_index(inplace=True)

    np.save('cov_2month.npy', two_month_cov.to_numpy())
    np.save('cov_3month.npy', three_month_cov.to_numpy())
    np.save('cov_4month.npy', four_month_cov.to_numpy())
    np.save('cov_5month.npy', five_month_cov.to_numpy())
    np.save('cov_6month.npy', six_month_cov.to_numpy())
    np.save('cov_8month.npy', eight_month_cov.to_numpy())
    np.save('cov_12month.npy', twelve_month_cov.to_numpy())