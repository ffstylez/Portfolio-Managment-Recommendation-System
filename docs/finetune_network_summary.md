# finetune_network.py Documentation

## Overview
`finetune_network.py` provides functionality for updating pre-trained Temporal Fusion Transformer (TFT) models with new financial data. This module enables incremental learning, allowing models to adapt to newly available market data without requiring full retraining from scratch.

## Key Functions

### Model Update Pipeline
- `update_model(new_data_path, old_model_path, save_path)`: The main function that handles the entire fine-tuning process. It:
  - Loads and preprocesses new financial data
  - Splits data into training, validation, and test sets
  - Creates appropriate TimeSeriesDataSet objects for TFT training
  - Loads an existing TFT model checkpoint
  - Sets up a PyTorch Lightning trainer with reduced epochs for fine-tuning
  - Trains the model on new data
  - Saves the updated model to disk

### Helper Functions
- `prepare_data(df)`: Internal function that applies necessary preprocessing to new data
- `split_group(group, val_frac, test_frac)`: Splits time series data for a single group into train/val/test sets

## Main Workflow
When executed as a script, the module:
1. Defines paths for new data and the network model folder
2. Iterates through existing model checkpoint files 
3. Updates each model using the new data
4. Saves updated models with appropriate naming conventions

## Model Configuration
- Uses 20 timesteps for the encoder length
- Predicts 1 timestep ahead
- Uses standard normalization for the target variable
- Trains with a batch size of 128
- Fine-tunes for 10 epochs (reduced from full training)

## Dependencies
- pandas
- numpy
- PyTorch
- PyTorch Lightning
- PyTorch Forecasting (for TFT implementation)

## Outputs
- Updated model checkpoints saved to the specified directory
