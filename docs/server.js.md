# server.js Documentation

## Overview
The server.js file implements the backend Express server for the Portfolio Management Recommendation System. It provides API endpoints for user authentication, portfolio management, and financial data processing.

## Purpose
This server connects the frontend application to data sources and handles all business logic related to user accounts, portfolio generation, and financial data retrieval. It serves as the middleware between the client application and external financial APIs.

## Key Components

### Server Configuration
- Runs on port 3001
- Uses Express.js as the web framework
- Implements CORS for cross-origin requests
- Uses JWT (JSON Web Token) for authentication

### Data Storage
- User credentials stored in CSV format (`credentials.csv`)
- User portfolio preferences stored in CSV format (`user-preferences.csv`)
- Generated portfolios stored in JSON format (`portfolios.json`)
- Historical stock data cached in JSON files

### Authentication System
- JWT-based token generation and verification
- Login and signup endpoints
- Token-based user identification
- Middleware for protecting routes

### Portfolio Management
- Risk profiling based on user preferences
- Portfolio generation using Python optimization scripts
- Asset allocation and rebalancing
- Integration with financial data APIs

### API Endpoints

#### Authentication
- `POST /login` - Authenticates users and returns a JWT
- `POST /signup` - Creates new user accounts
- `GET /get-email` - Retrieves user email from a token

#### User Management
- `GET /all-users` - Lists registered users
- `DELETE /delete-user/:email` - Removes a user and associated data

#### Portfolio Management
- `GET /get-portfolio` - Retrieves portfolio data for a user
- `POST /save-preferences` - Stores user preferences and generates portfolios
- `GET /user-preferences` - Retrieves saved user preferences

#### Financial Data
- `GET /get-historical-data` - Retrieves historical stock data
- `GET /update-all-historical-data` - Updates cached stock data

### Helper Functions
- CSV file reading and writing
- Portfolio generation logic
- Stock price fetching
- Historical data caching

## Integration with Python
The server uses Python scripts for complex portfolio optimization algorithms:
- Ensures Python environment is properly configured
- Passes parameters for risk tolerance, time horizon, and portfolio size
- Receives optimized portfolio allocations

## External APIs
- Connects to Finnhub API for real-time stock prices
- Uses Yahoo Finance API for historical stock data
