import pandas as pd
import os
from pathlib import Path

def load_and_prepare_data(price_path, fundamental_path, ticker):
    """
    Load and prepare price and fundamental data for a given ticker.
    """
    # Load both datasets
    price_df = pd.read_csv(f"{price_path}/{ticker}_price_data.csv")
    fundamental_df = pd.read_csv(f"{fundamental_path}/{ticker}_fundamental_data.csv")

    columns = ["Open", "future_close_2m", "future_close_3m", "future_close_4m",
               "future_close_5m", "future_close_6m", "future_close_6m", 
               "future_close_8m", "future_close_12m", "future_close_18m", 
               "future_close_24m", "return_18m", "return_24m"]
    price_df.drop(columns=columns, inplace=True)
    
    # Convert date columns to datetime
    price_df['Date'] = pd.to_datetime(price_df['Date'])
    fundamental_df['Date'] = pd.to_datetime(fundamental_df['Date'])
    
    # Sort both dataframes by date
    price_df = price_df.sort_values('Date')
    fundamental_df = fundamental_df.sort_values('Date')
    
    # Drop price data rows before the first fundamental data date
    first_fundamental_date = fundamental_df['Date'].min()
    price_df = price_df[price_df['Date'] >= first_fundamental_date]
    
    return price_df, fundamental_df

def find_closest_previous_date(target_date, available_dates):
    """
    Find the closest previous date from available_dates for a target_date.
    Returns None if no previous date exists.
    """
    previous_dates = available_dates[available_dates <= target_date]
    if len(previous_dates) == 0:
        return None
    return previous_dates.max()

def merge_ticker_data(price_df, fundamental_df):
    """
    Merge price and fundamental data with specific handling of missing dates.
    """
    # Create a complete set of dates from both dataframes
    all_dates = pd.Series(pd.concat([price_df['Date'], fundamental_df['Date']]).unique()).sort_values()
    
    # Create a template dataframe with all dates
    merged_df = pd.DataFrame({'Date': all_dates})
    
    # Merge with price data
    merged_df = merged_df.merge(price_df, on='Date', how='left')
    
    # For each date in the merged dataframe
    for idx, row in merged_df.iterrows():
        if pd.isna(merged_df.loc[idx, price_df.columns[1]]):  # Check if price data is missing
            # Find closest previous date in price data
            closest_date = find_closest_previous_date(row['Date'], price_df['Date'])
            if closest_date is not None:
                # Fill with closest previous price data
                price_row = price_df[price_df['Date'] == closest_date].iloc[0]
                for col in price_df.columns[1:]:  # Skip date column
                    merged_df.loc[idx, col] = price_row[col]
    
    # Merge with fundamental data
    merged_df = merged_df.merge(fundamental_df, on='Date', how='left')
    
    return merged_df

def process_all_tickers(price_data_folder, fundamental_data_folder, output_folder):
    """
    Process all matching tickers in both folders.
    """
    # Create output folder if it doesn't exist
    Path(output_folder).mkdir(parents=True, exist_ok=True)
    
    # Get list of tickers from price data files
    price_files = os.listdir(price_data_folder)
    tickers = [f.replace('_price_data.csv', '') for f in price_files if f.endswith('_price_data.csv')]
    
    # Process each ticker
    for ticker in tickers:
        # Check if fundamental data exists for this ticker
        fundamental_file = f"{ticker}_fundamental_data.csv"
        if os.path.exists(os.path.join(fundamental_data_folder, fundamental_file)):
            try:
                # Load and prepare data
                price_df, fundamental_df = load_and_prepare_data(
                    price_data_folder,
                    fundamental_data_folder,
                    ticker
                )
                
                # Merge data
                merged_df = merge_ticker_data(price_df, fundamental_df)
                
                # Save merged data
                output_path = os.path.join(output_folder, f"{ticker}_merged_data.csv")
                merged_df.to_csv(output_path, index=False)
                print(f"Successfully processed {ticker}")
                
            except Exception as e:
                print(f"Error processing {ticker}: {str(e)}")
        else:
            print(f"No fundamental data found for {ticker}")

# Example usage
if __name__ == "__main__":
    price_data_folder = "C:/Users/adeeb/Desktop/portfolio-recommendation-master/Portfolio-Managment-Recommendation-System/backend/price_data"
    fundamental_data_folder = "C:/Users/adeeb/Desktop/portfolio-recommendation-master/Portfolio-Managment-Recommendation-System/backend/Merged_fundamental_Data"
    output_folder = "price_data"
    
    process_all_tickers(price_data_folder, fundamental_data_folder, output_folder)