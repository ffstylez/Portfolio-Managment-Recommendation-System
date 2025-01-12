import os
import pandas as pd
import json

# Load filtered_mapping from filtered_mapping.json
filtered_mapping_file = r"C:\Users\adeeb\Desktop\portfolio-recommendation-master\Portfolio-Managment-Recommendation-System\backend\filtered_mapping.json"
with open(filtered_mapping_file, "r") as f:
    filtered_mapping = json.load(f)

# Define directories
base_dir = "backend"
fundamental_data_dir = os.path.join(base_dir, "Fundamental_data")
output_dir = os.path.join(base_dir, "Merged_Fundamental_Data")
os.makedirs(output_dir, exist_ok=True)

# Exclude "market_cap_updated" folder
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
            if file_name.startswith(f"{ticker}_") and file_name.endswith(".csv"):
                file_path = os.path.join(subfolder, file_name)
                
                # Read the CSV file
                data = pd.read_csv(file_path, parse_dates=["Date"])

                # Filter rows with Date >= 01-01-2009
                data = data[data["Date"] >= "2009-01-01"]

                # Merge data
                if merged_data is None:
                    merged_data = data
                else:
                    merged_data = pd.merge(merged_data, data, on="Date", how="outer")

    # Save merged data for the ticker
    if merged_data is not None:
        output_file = os.path.join(output_dir, f"{ticker}_fundamental_data.csv")
        merged_data.to_csv(output_file, index=False)
        print(f"Saved: {output_file}")
    else:
        print(f"No data found for ticker: {ticker}")

print("Processing completed.")
