# merge_tickers_data.py Documentation

## Overview
`merge_tickers_data.py` is a data processing module that combines multiple CSV files containing ticker financial data into a single consolidated DataFrame. It handles data quality issues by filtering out tickers and columns with excessive missing or zero values, and produces a summary report of data quality.

## Key Functions

### Data Merging
- `merge_csv_files(data_dir)`: Loads all CSV files from the specified directory, extracts ticker symbols from filenames, and combines them into a single DataFrame with additional metadata.

### Data Quality Filtering
- `filter_tickers_by_data_quality(df, threshold)`: Removes tickers that have too many missing or zero values based on a configurable threshold.
- `filter_columns_by_data_quality(df, threshold)`: Filters out columns with too many missing or zero values across all tickers.

### Reporting
- `create_missing_zero_summary(df)`: Creates a detailed summary of missing and zero values per ticker and column, with totals to identify problematic areas in the dataset.

## Main Workflow
When executed as a script, the module:
1. Merges all CSV files from the specified directory
2. Filters out tickers with poor data quality (too many missing values)
3. Filters out columns with poor data quality
4. Creates a comprehensive summary of remaining missing and zero values
5. Saves the processed data and missing values summary to CSV files

## Dependencies
- pandas
- numpy
- os (standard library)
- pathlib (standard library)

## Outputs
- `processed_data.csv`: The merged and filtered dataset
- `missing_values_summary.csv`: A summary report of missing and zero values per ticker and column