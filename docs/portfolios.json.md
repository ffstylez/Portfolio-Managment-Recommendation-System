# portfolios.json Documentation

## Overview
The portfolios.json file stores the generated investment portfolios for all users of the Portfolio Management Recommendation System. It contains structured data about optimized asset allocations based on user preferences and risk profiles.

## Purpose
This file serves as a persistent storage mechanism for users' portfolio data, allowing the application to retrieve and display portfolio information without regenerating it for each request. It maintains the connection between users and their personalized investment recommendations.

## Data Structure
The file is organized as a JSON object where:
- Each top-level key is a user's email address
- Each value is an object containing that user's portfolio information

### Portfolio Object Structure
Each portfolio contains three primary components:

1. `selected_assets`: Array of stock symbols/tickers selected for the portfolio
2. `weights`: Array of numerical values representing the allocation percentage for each asset
3. `priceBuy`: Object mapping each stock symbol to its purchase price

## Example Entry
```json
"adeeb2812@gmail.com": {
  "selected_assets": ["PLTR", "KEYS", "TPL", "TSLA", "SNPS", "..."],
  "weights": [0.02, 0.15, 0.15, 0.15, 0.02, "..."],
  "priceBuy": {
    "PLTR": 84.92,
    "KEYS": 159.53,
    "TPL": 1427.95,
    "TSLA": 292.98,
    "SNPS": 457.28,
    "...": "..."
  }
}
```

## Usage in Application
This file is accessed by the backend server to:
- Retrieve a user's recommended portfolio
- Calculate portfolio performance metrics
- Track investment values over time
- Update price data when changes occur

## Management
The server.js application handles all read/write operations to this file:
- New portfolios are added when users complete their preference profiles
- Price data is updated when fetched from external APIs
- The file uses atomic write operations with temporary files to ensure data integrity
- The file structure allows for easy portfolio retrieval by email address

## Security Considerations
- This file contains sensitive financial information and must be properly secured
- Access is controlled through authenticated API endpoints
- The file is never directly exposed to the client application
- Portfolio data is only accessible to authorized users
