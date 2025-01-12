import pandas as pd
import numpy as np
import os
from pathlib import Path

def merge_csv_files(data_dir='Processed_Ticker_Data'):
    """
    Merge all CSV files from the specified directory into a single DataFrame.
    Each file name is expected to start with a ticker symbol.
    """
    dataframes = []
    for file_name in os.listdir(data_dir):
        if file_name.endswith('.csv'):
            ticker = file_name.split('_')[0]
            csv_path = os.path.join(data_dir, file_name)

            df = pd.read_csv(csv_path)
            df['ticker'] = ticker

            dataframes.append(df)

    merged_df = pd.concat(dataframes, ignore_index=True)
    merged_df['Date'] = pd.to_datetime(merged_df['Date'])
    merged_df['time_idx'] = (merged_df['Date'] - merged_df['Date'].min()).dt.days
    return merged_df.rename(columns={'Current Ratio.1': 'Current_Ratio'})



def filter_tickers_by_data_quality(df, threshold=0.80):
    """
    Filter out tickers with too many missing or zero values.
    """
    ticker_ratios = []
    for ticker, group in df.groupby('ticker'):
        numeric_cols = group.select_dtypes(include=np.number).columns.drop(['Date'], errors='ignore')
        non_zero_non_null_count = group[numeric_cols].apply(lambda x: ((x != 0) & (x.notnull())).sum()).sum()
        total_cells = len(group) * len(numeric_cols)
        ratio = non_zero_non_null_count / total_cells if total_cells > 0 else 0
        ticker_ratios.append([ticker, ratio])

    ratio_df = pd.DataFrame(ticker_ratios, columns=['Ticker', 'Ratio'])
    filtered_tickers = ratio_df[ratio_df['Ratio'] > threshold]['Ticker'].tolist()
    return df[df['ticker'].isin(filtered_tickers)]

def filter_columns_by_data_quality(df, threshold=0.79):
    """
    Filter out columns with too many missing or zero values.
    """
    numeric_cols = df.select_dtypes(include=np.number).columns.drop(['Date', 'ticker'], errors='ignore')
    col_ratios = []
    
    for col in numeric_cols:
        non_zero_non_null_count = ((df[col] != 0) & (df[col].notnull())).sum()
        total_cells = df.shape[0]
        ratio = non_zero_non_null_count / total_cells if total_cells > 0 else 0
        col_ratios.append([col, ratio])

    col_ratio_df = pd.DataFrame(col_ratios, columns=['Column', 'Ratio'])
    filtered_cols = col_ratio_df[col_ratio_df['Ratio'] > threshold]['Column'].tolist()
    cols_to_keep = ['ticker', 'Date'] + filtered_cols
    return df[cols_to_keep]

def create_missing_zero_summary(df):
    """
    Create a summary of missing and zero values per ticker per column.
    """
    columns_to_check = [col for col in df.columns if col != 'ticker']
    grouped_counts = df.groupby('ticker')[columns_to_check].apply(
        lambda g: (g.isnull() | (g == 0)).sum()
    )

    column_sums = grouped_counts.sum(axis=0)
    sorted_columns = column_sums.sort_values(ascending=False).index
    grouped_counts = grouped_counts[sorted_columns]
    grouped_counts = grouped_counts.reset_index()

    total_rows_per_ticker = df.groupby('ticker').size()
    grouped_counts.insert(
        loc=1,
        column='total_rows_for_ticker',
        value=grouped_counts['ticker'].map(total_rows_per_ticker)
    )

    data_columns = grouped_counts.columns.difference(['ticker', 'total_rows_for_ticker'])
    total_missing_row = grouped_counts[data_columns].sum(axis=0)
    summary_data = {
        'ticker': ['TOTAL_MISSING'],
        'total_rows_for_ticker': [float('nan')]
    }

    for col in data_columns:
        summary_data[col] = [total_missing_row[col]]

    summary_df = pd.DataFrame(summary_data, columns=grouped_counts.columns)
    return pd.concat([summary_df, grouped_counts], ignore_index=True)



def main():
    # Merge all CSV files
    print("Merging CSV files...")
    combined_df = merge_csv_files()
    
    # Filter tickers with too many missing values
    print("Filtering tickers...")
    combined_df = filter_tickers_by_data_quality(combined_df)
    
    # Filter columns with too many missing values
    print("Filtering columns...")
    combined_df = filter_columns_by_data_quality(combined_df)
    
    # Create final missing values summary
    print("Creating missing values summary...")
    missing_zero_df = create_missing_zero_summary(combined_df)
    
    # Save the processed DataFrame
    print("Saving processed data...")
    combined_df.to_csv('processed_data.csv', index=False)
    missing_zero_df.to_csv('missing_values_summary.csv', index=False)
    
    print("Processing complete!")

if __name__ == "__main__":
    main()