"""
Merge Fundamental Data Module

This module consolidates fundamental financial data for stock tickers from multiple 
source folders into unified CSV files. It leverages a pre-filtered mapping of tickers 
to locate and merge all available fundamental data files for each ticker across 
various categories (earnings, balance sheets, cash flow, etc.)

The main processing steps are:
1. Load a pre-filtered ticker mapping from JSON configuration
2. Identify all relevant fundamental data subfolders
3. For each ticker, find and merge all its associated files across subfolders
4. Filter data to include only records from January 1, 2009 onward
5. Save consolidated data to individual ticker files

Usage:
    Run this script directly to process all tickers defined in filtered_mapping.json
    and output consolidated data files to the Merged_Fundamental_Data directory.
"""

import os
import pandas as pd
import json

# Load filtered_mapping from filtered_mapping.json
filtered_mapping_file = r"C:\Users\adeeb\Desktop\portfolio-recommendation-master\Portfolio-Managment-Recommendation-System\backend\filtered_mapping.json"
with open(filtered_mapping_file, "r") as f:
    # This JSON file contains a mapping of tickers that have passed filtering criteria
    filtered_mapping = json.load(f)

# Define directories
base_dir = "backend"
fundamental_data_dir = os.path.join(base_dir, "Fundamental_data")
output_dir = os.path.join(base_dir, "Merged_Fundamental_Data")
os.makedirs(output_dir, exist_ok=True)

# Exclude certain folders that aren't needed or would cause issues with merging
# "market_cap_updated" and "stock_splits_updated" are excluded as they may have 
# different data structures or aren't required for the fundamental analysis
subfolders = [
    os.path.join(fundamental_data_dir, folder)
    for folder in os.listdir(fundamental_data_dir)
    if os.path.isdir(os.path.join(fundamental_data_dir, folder)) and folder != "market_cap_updated" and folder != "stock_splits_updated"
]

# Process each ticker
for ticker, _ in filtered_mapping:
    merged_data = None

    # Iterate through subfolders to find relevant files
    for subfolder in subfolders:
        for file_name in os.listdir(subfolder):
            # Look for files that start with this ticker's symbol
            if file_name.startswith(f"{ticker}_") and file_name.endswith(".csv"):
                file_path = os.path.join(subfolder, file_name)
                
                # Read the CSV file
                data = pd.read_csv(file_path, parse_dates=["Date"])

                # Filter rows with Date >= 01-01-2009
                # This standardizes the time period across all tickers
                data = data[data["Date"] >= "2009-01-01"]

                # Merge data
                if merged_data is None:
                    # For first file found, just initialize the merged_data
                    merged_data = data
                else:
                    # For subsequent files, merge with existing data
                    # Using outer merge to preserve all dates from both datasets
                    merged_data = pd.merge(merged_data, data, on="Date", how="outer")

    # Save merged data for the ticker
    if merged_data is not None:
        output_file = os.path.join(output_dir, f"{ticker}_fundamental_data.csv")
        merged_data.to_csv(output_file, index=False)
        print(f"Saved: {output_file}")
    else:
        print(f"No data found for ticker: {ticker}")

print("Processing completed.")
