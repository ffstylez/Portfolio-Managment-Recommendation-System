/**
 * index.js
 * Express server that handles user preferences for the InsightPredict application.
 * Provides an endpoint to save user preferences as CSV files.
 */

// Import required dependencies
const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const Papa = require('papaparse');

// Initialize Express app
const app = express();
const PORT = 5000;

// Configure middleware to parse JSON request bodies
app.use(bodyParser.json());

/**
 * POST /save-preferences
 * Endpoint to receive user preferences and save them as a CSV file
 * 
 * @param {Object} req.body - JSON object containing user preferences
 * @returns {string} - Success or error message
 */
app.post('/save-preferences', (req, res) => {
  const preferences = req.body;

  // Convert preferences object to CSV format
  const csv = Papa.unparse([preferences], {
    header: true,
  });

  // Define file path for saving the CSV
  const filePath = path.join(
    __dirname,
    '..',
    'portfolio-recommendation',
    'public',
    'data',
    'user-preferences.csv'
  );

  // Write CSV data to file
  fs.writeFile(filePath, csv, (err) => {
    if (err) {
      console.error('Error saving CSV:', err);
      return res.status(500).send('Error saving preferences.');
    }
    res.send('Preferences saved successfully.');
  });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});