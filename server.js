const express = require('express');
const axios = require('axios');
const path = require('path');

const app = express();

// Middleware to parse JSON in request body
app.use(express.json());

// Serve static files (like index.html, CSS, JS) from the "public" folder
app.use(express.static(path.join(__dirname, 'public')));

// Example POST route to receive data and optionally send it somewhere
app.post('/save-data', async (req, res) => {
  const data = req.body;

  try {
    // Example: send data somewhere with axios (optional)
    // await axios.post('https://your-api.com/save', data);

    console.log('Received data:', data);
    res.status(200).json({ message: 'Data received successfully' });
  } catch (error) {
    console.error('Error:', error.message);
    res.status(500).json({ message: 'Failed to process data' });
  }
});

// Start the server
app.listen(5000, () => {
  console.log(`Server running at http://localhost:${5000}`);
});
