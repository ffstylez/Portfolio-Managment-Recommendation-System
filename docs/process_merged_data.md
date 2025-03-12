# process_merged_data.py Documentation

## Overview
`process_merged_data.py` is a data processing module designed to standardize and clean financial data for tickers. It handles irregular data intervals by generating evenly spaced samples and distributes values across null entries to create a more consistent dataset suitable for machine learning applications.

## Key Functions

### Data Standardization
- `calculate_even_indices(start_idx, end_idx, num_points)`: Helper function to generate evenly spaced indices between a start and end point.
- `standardize_intervals(df, target_columns)`: Creates evenly spaced intervals in the dataset by selecting specific rows to keep, ensuring exactly `ROWS_BETWEEN` points between consecutive non-null values.

### Data Processing
- `process_dataframe(df, target_columns)`: Processes non-null and non-zero values in specified columns by distributing a single value across consecutive null entries, ensuring the total value is preserved.

### Main Operation
- `main()`: The primary function that:
  - Loads CSV files from the input directory
  - Processes each file by standardizing intervals and distributing values
  - Saves the processed files to the output directory

## Main Workflow
When executed as a script, the module:
1. Validates the input directory exists
2. Creates the output directory if needed
3. Processes each CSV file by:
   - Checking for required columns
   - Standardizing data intervals for better consistency
   - Processing values by distributing them across null entries
   - Saving the processed file to the output directory

## Dependencies
- pandas
- numpy
- os (standard library)

## Outputs
- Processed CSV files in the specified output directory with standardized intervals and filled null values
- Console logging of the processing progress and any errors encountered