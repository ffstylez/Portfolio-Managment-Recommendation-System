# merge_ticker_data.py Documentation

## Overview
`merge_ticker_data.py` combines price data and fundamental financial data for individual stock tickers. The module handles the common challenge of misaligned dates between price and fundamental data sources by implementing a date-matching algorithm and filling missing values with the most recent available data.

## Key Functions

### Data Preparation
- `load_and_prepare_data(price_path, fundamental_path, ticker)`: Loads price and fundamental data for a ticker, performs initial cleaning, and ensures both datasets are properly sorted by date.

### Date Handling
- `find_closest_previous_date(target_date, available_dates)`: Identifies the closest previous date from a set of available dates, which is used to fill in data gaps with the most recent available information.

### Data Merging
- `merge_ticker_data(price_df, fundamental_df)`: Performs the core merging operation by creating a complete timeline of dates and carefully handling missing data points using the closest previous date's values.

### Batch Processing
- `process_all_tickers(price_data_folder, fundamental_data_folder, output_folder)`: Processes all matching tickers found in both the price and fundamental data folders, creating merged datasets for each ticker.

## Main Workflow
When executed as a script, the module:
1. Defines source folders for price and fundamental data, and an output folder for merged data
2. Identifies all tickers with price data files
3. For each ticker with matching fundamental data:
   - Loads and prepares both price and fundamental datasets
   - Merges the datasets with special handling for misaligned dates
   - Saves the resulting merged dataset to a CSV file
4. Reports success or failure for each ticker processed

## Dependencies
- pandas
- os (standard library)
- pathlib (standard library)

## Outputs
- Individual CSV files for each processed ticker in the specified output folder, with naming pattern `{ticker}_merged_data.csv`
- Console output indicating success or failure for each ticker processed