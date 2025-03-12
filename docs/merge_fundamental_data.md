# merge_fundamental_data.py Documentation

## Overview
`merge_fundamental_data.py` consolidates fundamental financial data for stock tickers from multiple source folders into unified CSV files. The module leverages a pre-filtered mapping of tickers to locate and merge relevant data files across various fundamental data categories, ensuring all available information for each ticker is combined into a single comprehensive dataset.

## Main Process
The module doesn't define separate functions but implements a comprehensive workflow within the main script to:
- Load a filtered mapping of tickers from a JSON configuration file
- Identify relevant fundamental data subfolders (excluding specific folders like "market_cap_updated")
- Process each ticker by finding and merging all its associated fundamental data files
- Save the consolidated data for each ticker to a dedicated output file

## Main Workflow
When executed as a script, the module:
1. Loads the filtered ticker mapping from `filtered_mapping.json`
2. Defines input and output directories for the data processing
3. Identifies relevant subfolders within the fundamental data directory
4. For each ticker in the filtered mapping:
   - Searches all subfolders for files starting with the ticker symbol
   - Loads and filters data to include only records from January 1, 2009 onward
   - Merges data from all found files using an outer join on the "Date" column
   - Saves the consolidated data to a CSV file named `{ticker}_fundamental_data.csv`
5. Reports progress and completion status to the console

## Dependencies
- pandas
- os (standard library)
- json (standard library)

## Outputs
- Individual CSV files for each ticker in the "Merged_Fundamental_Data" directory
- Console output indicating the status of each ticker's processing