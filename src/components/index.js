const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const Papa = require('papaparse');

const app = express();
const PORT = 5000;

// Middleware to parse JSON bodies
app.use(bodyParser.json());

// Endpoint to receive preferences and save as CSV
app.post('/save-preferences', (req, res) => {
  const preferences = req.body;

  // Convert preferences to CSV format
  const csv = Papa.unparse([preferences], {
    header: true,
  });

  // Path to save the CSV file
  const filePath = path.join(
    __dirname,
    '..',
    'portfolio-recommendation',
    'public',
    'data',
    'user-preferences.csv'
  );

  // Save the CSV file
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
