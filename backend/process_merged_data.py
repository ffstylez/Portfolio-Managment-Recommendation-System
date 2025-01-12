import os
import pandas as pd
import numpy as np

# Define the directory containing the CSV files
INPUT_FOLDER = 'C:/Users/adeeb/Desktop/portfolio-recommendation-master/Portfolio-Managment-Recommendation-System/backend/Merged_Ticker_Data'
OUTPUT_FOLDER = 'Processed_Ticker_Data'
START_COLUMN = 'Cash On Hand'

ROWS_BETWEEN = 30

def calculate_even_indices(start_idx, end_idx, num_points):
    all_points = np.linspace(start_idx, end_idx, num_points + 2)
    return [int(round(x)) for x in all_points[1:-1]]

def standardize_intervals(df, target_columns):
    # Create a mask for rows where any target column has a non-null value
    non_null_mask = df[target_columns].notna().any(axis=1)
    
    # Get indices of rows with non-null values
    non_null_indices = non_null_mask[non_null_mask].index.tolist()
    
    # If there are less than 2 non-null rows, return the original DataFrame
    if len(non_null_indices) < 2:
        return df
    
    # Initialize list to store indices to keep
    indices_to_keep = []
    
    # Always keep the first row with non-null values
    indices_to_keep.append(non_null_indices[0])
    
    # Process each pair of consecutive non-null indices
    for i in range(len(non_null_indices) - 1):
        start_idx = non_null_indices[i]
        end_idx = non_null_indices[i + 1]
        
        # Calculate indices to keep between start and end
        if end_idx - start_idx > ROWS_BETWEEN + 1:
            # Generate exactly ROWS_BETWEEN evenly spaced points
            middle_indices = calculate_even_indices(start_idx, end_idx, ROWS_BETWEEN)
            indices_to_keep.extend(middle_indices)
        else:
            # If interval is already smaller than or equal to target, keep all rows
            indices_to_keep.extend(range(start_idx + 1, end_idx))
        
        # Add the end index
        indices_to_keep.append(end_idx)
    
    # Create new DataFrame with only the selected indices
    return df.loc[sorted(set(indices_to_keep))].reset_index(drop=True)

def process_dataframe(df, target_columns):
    # Create a copy to avoid modifying the original DataFrame
    processed_df = df.copy()
    
    # Get indices where any target column has non-null and non-zero values
    for col in target_columns:
        # Get the indices where the value is not null and not zero for current column
        non_null_indices = processed_df[
            (processed_df[col].notnull()) & (processed_df[col] != 0)
        ].index.tolist()
        
        for idx in non_null_indices:
            # Process only if the current value is still non-null and non-zero
            if not pd.isna(processed_df.at[idx, col]) and processed_df.at[idx, col] != 0:
                # Initialize count and value
                count = 1
                value = processed_df.at[idx, col]
                indices_to_replace = [idx]
                
                # Look at subsequent rows
                next_idx = idx + 1
                while next_idx < len(processed_df):
                    if pd.isna(processed_df.at[next_idx, col]):
                        indices_to_replace.append(next_idx)
                        count += 1
                        next_idx += 1
                    else:
                        break
                
                # Calculate and apply the replacement value
                replacement_value = value / count
                for replace_idx in indices_to_replace:
                    processed_df.at[replace_idx, col] = replacement_value
    
    return processed_df

def main():
    # Check if the input folder exists
    if not os.path.isdir(INPUT_FOLDER):
        print(f"Error: The directory '{INPUT_FOLDER}' does not exist.")
        return

    # Create the output folder if it doesn't exist
    if not os.path.exists(OUTPUT_FOLDER):
        os.makedirs(OUTPUT_FOLDER)
        print(f"Created output directory: '{OUTPUT_FOLDER}'")
    else:
        print(f"Output directory '{OUTPUT_FOLDER}' already exists.")

    # List all CSV files in the input directory
    csv_files = [file for file in os.listdir(INPUT_FOLDER) if file.endswith('.csv')]

    if not csv_files:
        print(f"No CSV files found in the directory '{INPUT_FOLDER}'.")
        return

    for file in csv_files:
        input_file_path = os.path.join(INPUT_FOLDER, file)
        output_file_path = os.path.join(OUTPUT_FOLDER, file)
        print(f"Processing file: {file}")

        try:
            # Read the CSV file
            df = pd.read_csv(input_file_path)

            # Check if 'Date' column exists
            if 'Date' not in df.columns:
                print(f"  Warning: 'Date' column not found in {file}. Skipping this file.")
                continue

            # Ensure 'Cash On Hand' exists
            if START_COLUMN not in df.columns:
                print(f"  Warning: '{START_COLUMN}' column not found in {file}. Skipping this file.")
                continue

            # Determine the columns to process
            start_col_index = df.columns.get_loc(START_COLUMN)
            target_columns = df.columns[start_col_index:].tolist()

            print(f"  Standardizing intervals for {len(target_columns)} columns")
            # First standardize the intervals
            df = standardize_intervals(df, target_columns)
            
            print(f"  Processing {len(target_columns)} columns simultaneously")
            # Then process the columns
            df = process_dataframe(df, target_columns)

            # Save the updated DataFrame to the output directory
            df.to_csv(output_file_path, index=False)
            print(f"  Finished processing and saved to: {output_file_path}\n")

        except Exception as e:
            print(f"  An error occurred while processing {file}: {e}\n")

if __name__ == "__main__":
    main()