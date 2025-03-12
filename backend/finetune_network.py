"""
Model Fine-tuning Module for Temporal Fusion Transformer

This module provides functionality for updating pre-trained Temporal Fusion Transformer (TFT) 
models with new financial data. It handles:
- Loading existing model checkpoints
- Processing new financial data
- Setting up fine-tuning with appropriate parameters
- Performing model updates with reduced training epochs
- Saving updated model checkpoints

The module is designed for incremental learning, allowing models to adapt to newly 
available market data without full retraining.
"""

import pandas as pd
import numpy as np
import os
import pytorch_lightning as pl
import torch
from pytorch_lightning.callbacks import ModelCheckpoint
from pytorch_forecasting import TimeSeriesDataSet, TemporalFusionTransformer
from pytorch_forecasting.metrics import MAE
from pytorch_forecasting.data import TorchNormalizer

def update_model(new_data_path, old_model_path, save_path):
    """
    Updates an existing TFT model with new financial data.
    
    Parameters:
    new_data_path (str): Path to CSV file containing new financial data
    old_model_path (str): Path to the existing model checkpoint
    save_path (str): Path where the updated model will be saved
    
    Returns:
    tuple: (Updated TFT model, PyTorch Lightning trainer)
    
    This function handles the entire fine-tuning process:
    1. Loads and processes new data
    2. Creates appropriate training/validation datasets
    3. Loads the existing model
    4. Updates the model with reduced training epochs
    5. Saves the updated model
    """    
    # 1. Load and prepare new data
    def prepare_data(df):
        """
        Applies necessary preprocessing to new data.
        
        Parameters:
        df (pd.DataFrame): Raw data to process
        
        Returns:
        pd.DataFrame: Processed data ready for model training
        """
        # Add any necessary data preprocessing steps here
        # This should match your original preprocessing
        return df
    
    new_df = pd.read_csv(new_data_path)
    new_df = prepare_data(new_df)
    
    # 2. Split the new data
    def split_group(group, val_frac=0.15, test_frac=0.15):
        """
        Splits time series data for a single group into train/val/test sets.
        
        Parameters:
        group (pd.DataFrame): Data for a single group/ticker
        val_frac (float): Fraction of data for validation
        test_frac (float): Fraction of data for testing
        
        Returns:
        tuple: (train_data, val_data, test_data)
        """
        val_size = int(len(group) * val_frac)
        test_size = int(len(group) * test_frac)
        train_size = len(group) - val_size - test_size
        
        train = group.iloc[:train_size]
        val = group.iloc[train_size:train_size + val_size]
        test = group.iloc[train_size + val_size:]
        
        return train, val, test
    
    train_list, val_list, test_list = [], [], []
    for _, group in new_df.groupby("ticker"):
        group = group.sort_values("time_idx")
        train_, val_, test_ = split_group(group)
        train_list.append(train_)
        val_list.append(val_)
        test_list.append(test_)
    
    train_df = pd.concat(train_list)
    val_df = pd.concat(val_list)
    test_df = pd.concat(test_list)
    
    # 3. Create datasets
    max_encoder_length = 20
    max_prediction_length = 1
    exclude_columns = ['Date', 'ticker']
    
    training = TimeSeriesDataSet(
        data=train_df,
        time_idx="time_idx",
        target="return_2m",
        group_ids=["ticker"],
        max_encoder_length=max_encoder_length,
        max_prediction_length=max_prediction_length,
        static_categoricals=["ticker"],
        time_varying_unknown_reals=[col for col in new_df.columns if col not in exclude_columns],
        target_normalizer=TorchNormalizer(method='standard'),
        allow_missing_timesteps=True,
        add_relative_time_idx=True,
        add_target_scales=True,
        add_encoder_length=True,
    )
    
    validation = TimeSeriesDataSet.from_dataset(training, val_df, stop_randomization=True)
    
    # 4. Create dataloaders
    batch_size = 128
    train_dataloader = training.to_dataloader(train=True, batch_size=batch_size, num_workers=7)
    val_dataloader = validation.to_dataloader(train=False, batch_size=batch_size, num_workers=7)
    
    # 5. Load the existing model
    print(f"Loading model from {old_model_path}")
    tft = TemporalFusionTransformer.load_from_checkpoint(old_model_path)
    
    # 6. Set up trainer with reduced epochs for fine-tuning
    checkpoint_callback = ModelCheckpoint(
        dirpath="checkpoints",
        filename="tft-update-{epoch:02d}-{val_loss:.2f}",
        save_top_k=3,
        verbose=True,
        monitor="val_loss",
        mode="min",
        save_last=True
    )
    
    trainer = pl.Trainer(
        max_epochs=10,  # Reduced epochs for fine-tuning
        accelerator="gpu" if torch.cuda.is_available() else "cpu",
        enable_model_summary=True,
        gradient_clip_val=0.1,
        callbacks=[checkpoint_callback],
    )
    
    # 7. Fine-tune the model
    print("Starting model update training...")
    trainer.fit(
        tft,
        train_dataloaders=train_dataloader,
        val_dataloaders=val_dataloader
    )
    
    # 8. Save the updated model
    trainer.save_checkpoint(save_path)
    print(f"Updated model saved to {save_path}")
    
    return tft, trainer

if __name__ == "__main__":
    """
    Example execution of model fine-tuning.
    
    This script iterates through existing model checkpoints and updates
    each one with new financial data.
    """
    # Example usage
    NEW_DATA_PATH = "path/to/new/data.csv"
    NETWORKS_FOLDER = "Networks"
    
    for filename in os.listdir(NETWORKS_FOLDER):
            if filename.endswith(".ckpt"):
                old_model_path = os.path.join(NETWORKS_FOLDER, filename)

                # Build a save_path (we'll prefix "updated_" or any custom naming)

                # Call the update_model function
                updated_model, trainer = update_model(
                    new_data_path=NEW_DATA_PATH,
                    old_model_path=old_model_path,
                    save_path=NETWORKS_FOLDER
                )