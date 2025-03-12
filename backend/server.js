/**
 * Portfolio Management Recommendation System - Backend Server
 * 
 * This server provides API endpoints for user authentication, portfolio management,
 * and financial data processing. It connects to external financial APIs, manages user
 * preferences, and generates optimized investment portfolios using Python scripts.
 * 
 * Main features:
 * - User authentication with JWT
 * - Portfolio generation based on user preferences
 * - Historical stock data retrieval and caching
 * - User management system
 */

const express = require("express");
const bodyParser = require("body-parser");
const csvParser = require("csv-parser");
const fs = require("fs");
const path = require("path");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const { spawnSync, execSync } = require("child_process");
const axios = require('axios');
const app = express();
const PORT = 3001;
const { parse } = require("json2csv");

/**
 * File paths for data storage
 * - credentialsFile: Stores user login information
 * - preferencesFile: Stores user investment preferences
 * - portfolioFilePath: Stores generated portfolio data
 */
const credentialsFile = path.join(__dirname, "credentials.csv");
const preferencesFile = path.join(__dirname, "user-preferences.csv");
const portfolioFilePath = path.join(__dirname, "portfolios.json");

// JWT secret key for authentication token signing and verification
const SECRET_KEY = "686578%&%$6$%^$";

// Middleware configuration
app.use(bodyParser.json());
app.use(cors());

/**
 * Authentication middleware to protect routes
 * Verifies JWT token from Authorization header
 * and attaches user information to the request
 */
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(" ")[1];
  if (!token) {
    return res.status(401).json({ message: "No token provided" });
  }

  jwt.verify(token, SECRET_KEY, (err, user) => {
    if (err) {
      return res.status(403).json({ message: "Invalid or expired token" });
    }
    req.user = user;
    next();
  });
};

/**
 * Helper function to read CSV files
 * @param {string} filePath - Path to the CSV file
 * @returns {Array} Array of CSV rows as arrays
 */
const readCSV = (filePath) => {
  if (!fs.existsSync(filePath)) return [];
  const data = fs.readFileSync(filePath, "utf8");
  return data
    .trim()
    .split("\n")
    .map((line) => line.split(","));
};

/**
 * Helper function to write CSV without duplicating the header
 * Uses atomic write pattern with temporary file for safety
 * @param {string} filePath - Path to write the CSV file
 * @param {Array} data - 2D array of data to write
 * @param {boolean} includeHeader - Whether to include header row
 */
const writeCSV = (filePath, data, includeHeader = false) => {
  try {
    // Ensure directory exists
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    
    let csvData = data.map((row) => row.map(String).join(",")).join("\n");
    if (includeHeader) {
      const header =
        "Email,Familiarity,Portfolio Drop, Risk Investment, Volatility, Drawdown 1 Month, Drawdown 2 Months, Drawdown 3 Months, Investment Horizon, Initial Investment, Portfolio Size";
      csvData = `${header}\n${csvData}`;
    }
    
    // Write to temp file first
    const tempFilePath = `${filePath}.tmp`;
    fs.writeFileSync(tempFilePath, csvData, { 
      encoding: "utf8",
      mode: 0o666 // Explicitly set permissions
    });
    
    // Rename temp file to target file
    fs.renameSync(tempFilePath, filePath);
  } catch (error) {
    console.error("Error writing CSV:", error);
  }
};

/**
 * Alternative helper function to write CSV with special character handling
 * @param {string} filePath - Path to write the CSV file
 * @param {Array} header - Array of header column names
 * @param {Array} data - 2D array of data to write
 */
const writeCSV2 = (filePath, header, data) => {
  // Function to escape commas, newlines, and quotes inside data
  const escapeField = (field) => {
    // If the field contains a comma or newline, wrap it in quotes
    if (field.includes(",") || field.includes("\n") || field.includes('"')) {
      // Escape any internal quotes by doubling them
      return `"${field.replace(/"/g, '""')}"`;
    }
    return field; // Return as is if no special characters
  };

  // Handle the header: no quotes needed for simple headers
  const quotedHeader = header.map(field => field.trim()); // Clean header fields

  // Handle the data rows
  const formattedData = data.map(row => 
    row.map(cell => escapeField(cell.trim())) // Apply escaping to each cell
  );

  // Combine the header and data into CSV content
  const csvContent = [quotedHeader.join(",")]; // Start with header, join by comma
  formattedData.forEach(row => {
    csvContent.push(row.join(",")); // Join each row's values with commas
  });

  // Write the content to the CSV file
  fs.writeFileSync(filePath, csvContent.join("\n"), "utf8");
};

/**
 * Sets up and verifies Python environment for portfolio optimization
 * Checks Python version and installs required packages
 * @throws {Error} If Python environment setup fails
 */
function ensurePythonEnvironment() {
  try {
    // Check if Python is installed
    const pythonVersion = execSync("python3 --version").toString().trim();
    console.log(`Python version detected: ${pythonVersion}`);

    // Install required packages using pip
    console.log("Ensuring Python dependencies are installed...");
    execSync("python3 -m pip install --upgrade pip", { stdio: "inherit" });
    execSync("python3 -m pip install -r requirements.txt", {
      stdio: "inherit",
    });
    console.log("Python environment setup complete.");
  } catch (error) {
    console.error("Error setting up Python environment:", error.message);
    throw new Error(
      "Failed to set up Python environment. Ensure Python 3 and pip are installed."
    );
  }
}

/**
 * Calls external Python script to generate optimized investment portfolio
 * @param {number} lambda - Risk tolerance parameter
 * @param {number} horizon - Investment time horizon
 * @param {number} size - Number of assets in the portfolio
 * @returns {Object} Portfolio with selected assets and optimal weights
 */
function getPortfolio(lambda, horizon, size) {
  try {
    ensurePythonEnvironment();
    // Spawn a Python process to execute the script
    const pythonProcess = spawnSync("python3", [
      "portfolio_construction.py", // Path to your Python script
      lambda.toString(),
      horizon.toString(),
      size.toString(),
    ]);

    // Check for errors during script execution
    if (pythonProcess.error) {
      throw new Error(
        `Python script execution failed: ${pythonProcess.error.message}`
      );
    }

    // Capture and parse the script's output
    const output = pythonProcess.stdout.toString();
    const portfolio = JSON.parse(output);
    return portfolio; // Return the portfolio as a JSON object
  } catch (error) {
    console.error("Error in getPortfolio:", error.message);
    throw error; // Rethrow the error for the caller to handle
  }
}

/**
 * Login route - authenticates user and generates JWT token
 * @route POST /login
 * @param {string} req.body.email - User email
 * @param {string} req.body.password - User password
 * @returns {Object} Token and success message
 */
app.post("/login", (req, res) => {
  const { email, password } = req.body;
  const users = readCSV(credentialsFile);

  const userExists = users.some(
    ([storedEmail, storedPassword]) =>
      storedEmail === email && storedPassword === password
  );

  if (userExists) {
    // Generate a token for the authenticated user
    const token = jwt.sign({ email }, SECRET_KEY);

    res.status(200).json({
      message: "Login successful",
      token, // Return the token to the client
    });
  } else {
    res.status(401).json({ message: "Invalid email or password" });
  }
});

/**
 * Signup route - creates new user account and generates JWT token
 * @route POST /signup
 * @param {string} req.body.email - User email
 * @param {string} req.body.password - User password
 * @returns {Object} Token and success message
 */
app.post("/signup", (req, res) => {
  const { email, password } = req.body;
  const users = readCSV(credentialsFile);

  const userExists = users.some(([storedEmail]) => storedEmail === email);

  if (userExists) {
    res.status(400).json({ message: "This email is already active." });
  } else {
    users.push([email, password, 0]);
    writeCSV(credentialsFile, users, false);

    // Generate a token for the newly created user
    const token = jwt.sign({ email }, SECRET_KEY);

    res.status(200).json({
      message: "Account created successfully!",
      token, // Return the token to the client
    });
  }
});

/**
 * Get all users route - retrieves all registered users
 * @route GET /all-users
 * @requires Authentication
 * @returns {Array} List of users with portfolio status
 */
app.get("/all-users", authenticateToken, (req, res) => {
  try {
    // Read users from the credentials CSV file
    const users = readCSV(credentialsFile);

    // Remove the first line if it contains only the word "email"
    if (users.length > 0 && users[0][0].toLowerCase() === "email") {
      users.shift(); // Remove the first row
    }

    // Load portfolios.json file
    let portfolios = {};
    if (fs.existsSync(portfolioFilePath)) {
      portfolios = JSON.parse(fs.readFileSync(portfolioFilePath, "utf8"));
    }

    // Filter out admin users and return an array of objects with email and portfolio status
    const allUsers = users
      .map(([email]) => ({
        email,
        hasPortfolio: portfolios.hasOwnProperty(email), // Check if user has a portfolio
      }));

    res.status(200).json(allUsers);
  } catch (error) {
    console.error("Error retrieving users:", error);
    res.status(500).json({ message: "Failed to retrieve users." });
  }
});

/**
 * Get email from token route - extracts email from provided JWT token
 * @route GET /get-email
 * @param {string} req.headers.authorization - JWT token in Authorization header
 * @returns {Object} User email
 */
app.get("/get-email", (req, res) => {
  const token = req.headers.authorization?.split(" ")[1]; // Extract token from the Authorization header

  if (!token) {
    return res.status(401).json({ message: "No token provided" });
  }

  try {
    const decoded = jwt.verify(token, SECRET_KEY); // Replace SECRET_KEY with your environment variable
    const email = decoded.email;
    res.status(200).json({ email });
  } catch (error) {
    res.status(401).json({ message: "Invalid or expired token" });
  }
});

/**
 * Generate portfolio based on user preferences
 * @param {Array} preferences - User preference data
 * @returns {Object} Generated portfolio information
 */
function generatePortfolio(preferences) {
  console.log(preferences)
  const email = preferences[0];
  const horizon = preferences[preferences.length - 3];
  const size = preferences[preferences.length - 1];
  const score = preferences
    .slice(1, preferences.length - 3) // Extract the subarray
    .reduce((sum, value) => +sum + +value, 0); // Sum up the values

  // Calculate lambda based on the score
  const lambda = 1 + 0.142857 * (score - 7);

  console.log(
    `Lambda: ${lambda}, Horizon: ${horizon}, Portfolio Size: ${size}`
  );

  let portfolio = getPortfolio(lambda, horizon, size);
  // Save the portfolio in the portfolios.json file
  savePortfolio(email, portfolio);
  return { email, score, lambda };
}

/**
 * Fetch current stock prices from Finnhub API
 * @param {Array} symbols - Array of stock symbols to fetch prices for
 * @returns {Object} Mapping of symbols to current prices
 */
async function fetchInitialPrices(symbols) {
  const FINNHUB_API_KEY = "ctjbr29r01quipmtn8mgctjbr29r01quipmtn8n0";
  let priceBuyData = {};
  
  try {
    for (const symbol of symbols) {
      try {
        const response = await axios.get(
          `https://finnhub.io/api/v1/quote?symbol=${symbol}&token=${FINNHUB_API_KEY}`
        );
        
        if (response.data && response.data.c) {
          priceBuyData[symbol] = response.data.c;
        } else {
          priceBuyData[symbol] = 0; // Default value if price not available
        }
        
        // Add a small delay to avoid API rate limits
        await new Promise(resolve => setTimeout(resolve, 250));
      } catch (error) {
        console.error(`Error fetching price for ${symbol}:`, error.message);
        priceBuyData[symbol] = 0; // Default value on error
      }
    }
    return priceBuyData;
  } catch (error) {
    console.error("Error fetching initial prices:", error.message);
    return {}; // Return empty object on error
  }
}

/**
 * Save portfolio data to JSON file
 * Uses atomic write pattern with temporary file for safety
 * @param {string} email - User email as portfolio identifier
 * @param {Object} portfolio - Portfolio data to save
 */
function savePortfolio(email, portfolio) {
  try {
    // Make sure the directory exists
    const directory = path.dirname(portfolioFilePath);
    if (!fs.existsSync(directory)) {
      fs.mkdirSync(directory, { recursive: true });
    }
    
    // Read the existing portfolios file or initialize an empty object
    let portfolios = {};
    if (fs.existsSync(portfolioFilePath)) {
      try {
        const data = fs.readFileSync(portfolioFilePath, "utf8");
        portfolios = JSON.parse(data);
      } catch (readError) {
        console.error("Error reading portfolios file, creating new one:", readError.message);
        // Continue with an empty object if the file is corrupted
      }
    }

    // Update the portfolio for the given email
    portfolios[email] = portfolio;

    // Create a temporary file to ensure atomic write
    const tempFilePath = `${portfolioFilePath}.tmp`;
    
    // Write data to temp file first
    fs.writeFileSync(
      tempFilePath,
      JSON.stringify(portfolios, null, 2),
      { encoding: "utf8", mode: 0o666 }
    );
    
    // Rename temp file to actual file (this is more atomic)
    fs.renameSync(tempFilePath, portfolioFilePath);
    
    console.log(`Portfolio saved for ${email}`);
  } catch (error) {
    console.error("Error saving portfolio:", error.message);
    throw error; // Re-throw the error for the caller to handle if necessary
  }
}

// Create historical data directory if it doesn't exist
const historicalDataDir = path.join(__dirname, "historical-data");
if (!fs.existsSync(historicalDataDir)) {
  fs.mkdirSync(historicalDataDir, { recursive: true });
}

/**
 * Fetch historical stock data from Yahoo Finance API
 * Caches data in local files to minimize API calls
 * @param {string} symbol - Stock ticker symbol
 * @param {Date} fromDate - Optional start date for data retrieval
 * @returns {Array} Historical price data
 */
async function fetchHistoricalData(symbol, fromDate = null) {
  try {
    const symbolFileName = `${symbol.toLowerCase()}.json`;
    const symbolFilePath = path.join(historicalDataDir, symbolFileName);
    
    // Check if we already have data for this symbol
    let existingData = [];
    let latestDate = fromDate;
    
    if (fs.existsSync(symbolFilePath)) {
      try {
        existingData = JSON.parse(fs.readFileSync(symbolFilePath, 'utf8'));
        
        // Find the latest date in the existing data if needed
        if (existingData.length > 0) {
          const sortedData = [...existingData].sort((a, b) => 
            new Date(b.date) - new Date(a.date)
          );
          latestDate = new Date(sortedData[0].date);
        }
      } catch (err) {
        console.error(`Error reading historical data for ${symbol}:`, err.message);
        // If file is corrupted, start fresh
        existingData = [];
      }
    }
    
    // If we have recent data, no need to fetch again
    const today = new Date();
    const oneDayMs = 24 * 60 * 60 * 1000;
    
    if (latestDate && (today - latestDate) < oneDayMs) {
      console.log(`Using cached data for ${symbol}`);
      return existingData;
    }
    
    // Calculate start date for API call
    // If we have existing data, get data since last date
    // Otherwise, get 1 year of historical data
    const startDate = latestDate || new Date(today.setFullYear(today.getFullYear() - 1));
    
    // Use Yahoo Finance API to get historical data
    const yahooResponse = await axios.get(
      `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}`, {
        params: {
          period1: Math.floor(startDate.getTime() / 1000),
          period2: Math.floor(Date.now() / 1000),
          interval: '1d',
          includePrePost: false,
          events: 'div,split'
        }
      }
    );
    
    // Process Yahoo Finance response
    const result = yahooResponse.data.chart.result[0];
    if (!result) {
      throw new Error(`No data returned for ${symbol}`);
    }
    
    const timestamps = result.timestamp;
    const quotes = result.indicators.quote[0];
    
    // Format data points
    const newDataPoints = timestamps.map((timestamp, idx) => {
      return {
        date: new Date(timestamp * 1000).toISOString().split('T')[0],
        open: quotes.open[idx],
        high: quotes.high[idx],
        low: quotes.low[idx],
        close: quotes.close[idx],
        volume: quotes.volume[idx]
      };
    }).filter(point => point.close !== null); // Filter out any null values
    
    // Merge with existing data, avoiding duplicates
    const combinedData = [...existingData];
    const existingDates = new Set(existingData.map(d => d.date));
    
    for (const newPoint of newDataPoints) {
      if (!existingDates.has(newPoint.date)) {
        combinedData.push(newPoint);
      }
    }
    
    // Sort by date
    const sortedData = combinedData.sort((a, b) => 
      new Date(a.date) - new Date(b.date)
    );
    
    // Save to file
    fs.writeFileSync(
      symbolFilePath,
      JSON.stringify(sortedData, null, 2),
      'utf8'
    );
    
    return sortedData;
  } catch (error) {
    console.error(`Error fetching historical data for ${symbol}:`, error.message);
    throw error;
  }
}

/**
 * Get historical stock data route
 * @route GET /get-historical-data
 * @requires Authentication
 * @param {string} req.query.symbol - Stock ticker symbol
 * @returns {Array} Historical price data
 */
app.get("/get-historical-data", authenticateToken, async (req, res) => {
  try {
    const { symbol } = req.query;
    
    if (!symbol) {
      return res.status(400).json({ message: 'Symbol is required' });
    }
    
    const historicalData = await fetchHistoricalData(symbol);
    res.status(200).json(historicalData);
  } catch (error) {
    console.error('Error retrieving historical data:', error.message);
    res.status(500).json({ message: 'Failed to retrieve historical data' });
  }
});

/**
 * Update all historical data route - refreshes data for all portfolio stocks
 * @route GET /update-all-historical-data
 * @requires Authentication
 * @returns {Object} Status of update operations
 */
app.get("/update-all-historical-data", authenticateToken, async (req, res) => {
  try {
    // Read the portfolios file to get all unique tickers
    if (!fs.existsSync(portfolioFilePath)) {
      return res.status(404).json({ message: 'No portfolios found' });
    }
    
    const portfolios = JSON.parse(fs.readFileSync(portfolioFilePath, 'utf8'));
    const allTickers = new Set();
    
    // Collect all unique tickers from all portfolios
    Object.values(portfolios).forEach(portfolio => {
      if (portfolio.selected_assets && Array.isArray(portfolio.selected_assets)) {
        portfolio.selected_assets.forEach(ticker => allTickers.add(ticker));
      }
    });
    
    // Update historical data for each ticker
    const updatePromises = Array.from(allTickers).map(async ticker => {
      try {
        await fetchHistoricalData(ticker);
        return { ticker, success: true };
      } catch (error) {
        return { ticker, success: false, error: error.message };
      }
    });
    
    const results = await Promise.all(updatePromises);
    
    res.status(200).json({
      message: 'Historical data update complete',
      results
    });
  } catch (error) {
    console.error('Error updating historical data:', error.message);
    res.status(500).json({ message: 'Failed to update historical data' });
  }
});

/**
 * Save user preferences route - stores preferences and generates portfolio
 * @route POST /save-preferences
 * @requires Authentication
 * @param {Object} req.body - User preferences
 * @returns {string} Success message
 */
app.post("/save-preferences", authenticateToken, async (req, res) => {
  const { email, ...preferences } = req.body;

  if (!email) {
    return res.status(400).json({ message: "Email is required." });
  }

  try {
    // Initialize file with header if it doesn't exist
    if (!fs.existsSync(preferencesFile)) {
      writeCSV(preferencesFile, [], true);
    }

    const preferencesData = readCSV(preferencesFile);

    // Filter out existing data for the same email
    const updatedPreferences = preferencesData.filter(
      ([storedEmail]) => storedEmail !== email
    );

    // Add sanitized preferences
    const sanitizedRow = [
      email.trim(),
      preferences.familiar?.trim() || "",
      preferences.portfolioDrop?.trim() || "",
      preferences.riskInvestments?.trim() || "",
      preferences.volatility?.trim() || "",
      preferences.drawdown1?.trim() || "",
      preferences.drawdown2?.trim() || "",
      preferences.drawdown3?.trim() || "",
      preferences.investmentHorizon?.trim() || "",
      preferences.initialInvestment?.trim() || "",
      preferences.portfolioSize?.trim() || "",
    ];

    updatedPreferences.push(sanitizedRow);

    // Write updated data back to the CSV without duplicating the header
    writeCSV(preferencesFile, updatedPreferences, false);

    // Generate portfolio
    const portfolio = getPortfolio(
      1 + 0.142857 * (sanitizedRow.slice(1, sanitizedRow.length - 3).reduce((sum, value) => +sum + +value, 0) - 7),
      sanitizedRow[sanitizedRow.length - 3],
      sanitizedRow[sanitizedRow.length - 1]
    );

    // Fetch initial prices for all stocks in the portfolio
    const priceBuyData = await fetchInitialPrices(portfolio.selected_assets);
    
    // Add price buy data to the portfolio
    portfolio.priceBuy = priceBuyData;

    // Save the portfolio with price buy data
    savePortfolio(email, portfolio);

    // Initialize historical data for the new portfolio's assets
    const updatePromises = portfolio.selected_assets.map(ticker => 
      fetchHistoricalData(ticker).catch(err => {
        console.error(`Failed to fetch historical data for ${ticker}:`, err.message);
        return null;
      })
    );
    
    // Wait for all historical data to be fetched
    await Promise.all(updatePromises);

    res.status(200).send("Preferences saved successfully");
  } catch (error) {
    console.error("Error saving preferences:", error);
    res.status(500).json({ message: "Failed to save preferences." });
  }
});

/**
 * Delete user route - removes user and all associated data
 * @route DELETE /delete-user/:email
 * @requires Authentication
 * @param {string} req.params.email - Email of user to delete
 * @returns {Object} Success message
 */
app.delete("/delete-user/:email", authenticateToken, async (req, res) => {
  try {
    const userEmail = req.params.email;

    // Step 1: Delete Portfolio
    if (fs.existsSync(portfolioFilePath)) {
      const portfoliosData = JSON.parse(fs.readFileSync(portfolioFilePath, "utf8"));
      if (portfoliosData[userEmail]) {
        delete portfoliosData[userEmail];
        fs.writeFileSync(portfolioFilePath, JSON.stringify(portfoliosData, null, 2));
      }
    }

    // Step 2: Delete User Preferences
    if (fs.existsSync(preferencesFile)) {
      const preferencesData = [];
      const headers = [];
      const preferencesStream = fs
        .createReadStream(preferencesFile)
        .pipe(csvParser());

      for await (const row of preferencesStream) {
        if (headers.length === 0) {
          headers.push(...Object.keys(row)); // Collect headers from the first row
        }
        if (row.Email !== userEmail) {
          preferencesData.push(row); // Keep rows that don't match the user's email
        }
      }

      if (preferencesData.length > 0) {
        const csvContent = parse(preferencesData, { fields: headers });
        fs.writeFileSync(preferencesFile, csvContent, "utf8");
      } else {
        fs.writeFileSync(preferencesFile, headers.join(",") + "\n", "utf8"); // If no data left, just save headers
      }
    }

    // Step 3: Delete User from credentials.csv
    if (fs.existsSync(credentialsFile)) {
      const credentialsData = readCSV(credentialsFile); // Use the readCSV helper function
      const header = credentialsData[0]; // Assuming first row is header
      const filteredData = credentialsData.filter((row) => row[0] !== userEmail); // Filter out the row with the user email
      // remove header row of filteredData
      filteredData.shift()
      if (filteredData.length > 1) {
        // If there are users left after filtering, rewrite the file with the updated data
        writeCSV2(credentialsFile, header, filteredData);
      } else if (filteredData.length === 1) {
        // If only the header is left (the file will contain just the header), rewrite it correctly
        fs.writeFileSync(credentialsFile, header.join(",") + "\n", "utf8");
      } else {
        // If no data remains, write an empty file or a file with just headers
        fs.writeFileSync(credentialsFile, header.join(",") + "\n", "utf8");
      }
    }

    // Step 4: Respond with success message
    res.status(200).json({ message: "User and all associated data deleted successfully" });
  } catch (error) {
    console.error("Error deleting user:", error);
    res.status(500).json({ message: "Failed to delete user and associated data" });
  }
});

/**
 * Get portfolio route - retrieves portfolio for a specific user
 * @route GET /get-portfolio
 * @requires Authentication
 * @param {string} req.query.email - Email of user to fetch portfolio for
 * @returns {Object} User portfolio data
 */
app.get("/get-portfolio", authenticateToken, (req, res) => {
  try {
    const requestedEmail = req.query.email; // Allow fetching for a specific email
    console.log(`Fetching portfolio for: ${requestedEmail}`);

    if (!requestedEmail) {
      return res
        .status(400)
        .json({ message: "Email query parameter is required." });
    }

    // Check if the portfolios file exists
    if (!fs.existsSync(portfolioFilePath)) {
      return res.status(404).json({ message: "Portfolio file not found" });
    }

    // Read and parse the portfolios file
    const portfoliosData = JSON.parse(
      fs.readFileSync(portfolioFilePath, "utf8")
    );

    // Check if the requested user's portfolio exists
    if (!portfoliosData[requestedEmail]) {
      return res
        .status(404)
        .json({ message: `Portfolio not found for ${requestedEmail}` });
    }

    // Return the requested user's portfolio
    return res.status(200).json(portfoliosData[requestedEmail]);
  } catch (error) {
    console.error("Error retrieving portfolio:", error.message);
    return res.status(500).json({ message: "Failed to retrieve portfolio" });
  }
});

/**
 * Get user preferences route - retrieves preferences for a specific user
 * @route GET /user-preferences
 * @requires Authentication
 * @param {string} req.query.email - Email of user to fetch preferences for
 * @returns {Object} User preferences data
 */
app.get("/user-preferences", authenticateToken, (req, res) => {
  let email = req.query.email || req.user.email;
  let userEmail = decodeURIComponent(email); // Use query param or authenticated user email
  try {
    // Check if the preferences file exists
    if (!fs.existsSync(preferencesFile)) {
      return res.status(404).json({ message: "Preferences file not found" });
    }

    // Read and parse the preferences file
    const preferencesData = fs
      .readFileSync(preferencesFile, "utf8")
      .trim()
      .split("\n")
      .map((line) => line.split(",").map(cell => cell.trim().replace(/^"|"$/g, ''))); // Remove any extra quotes from each cell

    // Extract the header and rows
    const [header, ...rows] = preferencesData;
    // Find the user's row based on the email
    const userRow = rows.find((row) => row[0].trim() === userEmail);

    if (!userRow) {
      return res
        .status(404)
        .json({ message: `User preferences not found for this email ${userEmail}`  });
    }

    // Map the row to the header to form a JSON object
    const userPreferences = {};
    header.forEach((key, index) => {
      userPreferences[key.trim()] = userRow[index]?.trim() || "";
    });

    return res.status(200).json(userPreferences);
  } catch (error) {
    console.error("Error retrieving user preferences:", error.message);
    return res
      .status(500)
      .json({ message: "Failed to retrieve user preferences" });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
