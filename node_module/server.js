const express = require('express');
const fs = require('fs');
const path = require('path');
const cron = require('node-cron');
const { createObjectCsvWriter } = require('csv-writer'); // Importação correta
const sendNotification = require('./helpers/notification');
require('dotenv').config({ path: path.join(__dirname, 'helpers/.env') });

const app = express();
const port = 3000;

// Native Express middleware for JSON and URL-encoded data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

const dataDir = path.join(__dirname, 'data');
const csvFilePath = path.join(dataDir, 'dados.csv');
const requestsFilePath = path.join(dataDir, 'requests.txt');
const queueFilePath = path.join(dataDir, 'queue.json'); // Path to the JSON queue file

// Ensure the 'data' directory exists
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir);
}

// Create the CSV file if it doesn't exist
if (!fs.existsSync(csvFilePath)) {
  const headers = 'Rating,Position,Name,Skill Moves,Weak Foot,Price\n';
  fs.writeFileSync(csvFilePath, headers, 'utf8');
}

// Create the TXT file if it doesn't exist
if (!fs.existsSync(requestsFilePath)) {
  fs.writeFileSync(requestsFilePath, '', 'utf8');
}

// Initialize the queue from the JSON file
let requestQueue = [];
if (fs.existsSync(queueFilePath)) {
  const queueData = fs.readFileSync(queueFilePath, 'utf8');
  requestQueue = JSON.parse(queueData);
}

// Helper functions for formatting and parsing prices
function formatPrice(price) {
  return (parseFloat(price) / 1000).toFixed(1) + 'K';
}

function parsePrice(price) {
  return parseFloat(price.replace('K', '')) * 1000;
}

// Function to filter players based on criteria
function filterPlayers(criteria, csvFilePath) {
  const { overall, position, skillMoves, weakFoot, price } = criteria;

  return new Promise((resolve, reject) => {
    fs.readFile(csvFilePath, 'utf8', (err, data) => {
      if (err) {
        return reject(err);
      }

      const lines = data.trim().split('\n');
      const header = lines[0].split(',');
      const rows = lines.slice(1);

      const index = {
        rating: header.indexOf('Rating'),
        position: header.indexOf('Position'),
        name: header.indexOf('Name'),
        skill_moves: header.indexOf('Skill Moves'),
        weak_foot: header.indexOf('Weak Foot'),
        price: header.indexOf('Price')
      };

      const results = rows.reduce((acc, row) => {
        const values = row.split(',');

        if (
          values[index.rating] >= overall &&
          values[index.position] === position &&
          values[index.skill_moves] >= skillMoves &&
          values[index.weak_foot] >= weakFoot &&
          parsePrice(values[index.price]) <= price
        ) {
          acc.push({
            Rating: values[index.rating],
            Position: values[index.position],
            Name: values[index.name],
            'Skill Moves': values[index.skill_moves],
            'Weak Foot': values[index.weak_foot],
            Price: values[index.price]
          });
        }

        return acc;
      }, []);

      resolve(results);
    });
  });
}

// Function to save the queue to a JSON file
function saveQueueToFile(queue) {
  fs.writeFileSync(queueFilePath, JSON.stringify(queue, null, 2), 'utf8');
}

// Endpoint to receive data and save it in the CSV
app.post('/receive-data', (req, res) => {
  const dataChunks = req.body; // Expecting an array of JSON objects
  const dataDirectory = path.join(__dirname, 'data'); // Path to the 'data' folder
  
  // Create the 'data' folder if it doesn't exist
  if (!fs.existsSync(dataDirectory)) {
    fs.mkdirSync(dataDirectory);
  }

  const csvFilePath = path.join(dataDirectory, 'dados.csv'); // Path to the CSV file
  const jsonFilePath = path.join(dataDirectory, 'dados.json'); // Path to the JSON file

  if (!Array.isArray(dataChunks)) {
    return res.status(400).send('Invalid data format. Expected an array of objects.');
  }

  // Read and update the JSON file
  let existingData = {};
  if (fs.existsSync(jsonFilePath)) {
    const fileData = fs.readFileSync(jsonFilePath);
    existingData = JSON.parse(fileData);
  }

  // Update or add new data for each player
  dataChunks.forEach(playerData => {
    const playerName = playerData.name;
    const playerPrice = playerData.price;
    const receivedAt = new Date().toISOString();

    if (existingData[playerName]) {
      existingData[playerName].prices.push(playerPrice);
      existingData[playerName].receivedAt.push(receivedAt);
    } else {
      existingData[playerName] = {
        prices: [playerPrice],
        receivedAt: [receivedAt]
      };
    }
  });

  // Save the updated data to the JSON file
  fs.writeFile(jsonFilePath, JSON.stringify(existingData, null, 2), err => {
    if (err) {
      console.error('Error saving data to JSON:', err);
      return res.status(500).send('Error saving data.');
    }
  });

  // Overwrite the CSV file with the new data
  const csvWriterInstance = createObjectCsvWriter({
    path: csvFilePath,
    header: [
      { id: 'rating', title: 'Rating' },
      { id: 'position', title: 'Position' },
      { id: 'name', title: 'Name' },
      { id: 'skill_moves', title: 'Skill Moves' },
      { id: 'weak_foot', title: 'Weak Foot' },
      { id: 'price', title: 'Price' }
    ]
  });

  csvWriterInstance.writeRecords(dataChunks)
    .then(() => {
      res.status(200).send('Data received and saved successfully.');
    })
    .catch(err => {
      console.error('Error saving data to CSV:', err);
      res.status(500).send('Error saving data.');
    });
});

// Cron job to run every 24 hours (at midnight)
cron.schedule('0 0 * * *', () => {
  console.log('Running task every 24 hours');

  // Example of queue processing
  requestQueue.forEach((formData, index) => {
    setTimeout(() => {
      filterPlayers(formData, csvFilePath)
        .then(filteredResults => {
          sendNotification(formData, filteredResults);
        })
        .catch(err => {
          console.error(`Error filtering players for test request ${index + 1}:`, err);
        });
    }, index * 2000);
  });
});

// Endpoint to register the event
app.post('/notify', (req, res) => {
  const formData = req.body;

  // Save form data to the TXT file (optional, if you want to keep a history)
  fs.appendFile(requestsFilePath, JSON.stringify(formData) + '\n', (err) => {
    if (err) {
      console.error('Error saving data to TXT:', err);
      return res.status(500).json({ success: false, message: 'Error saving data.' });
    }

    // Add the request to the queue
    requestQueue.push(formData);
    saveQueueToFile(requestQueue); // Persist the queue in the JSON file

    // Send notification immediately
    filterPlayers(formData, csvFilePath)
      .then(filteredResults => {
        sendNotification(formData, filteredResults)
          .then(() => {
            res.status(200).json({ success: true, message: 'Form data received, notification sent, and added to the queue.' });
          })
          .catch(err => {
            console.error('Error sending notification:', err);
            res.status(500).json({ success: false, message: 'Error sending notification.' });
          });
      })
      .catch(err => {
        console.error('Error filtering players:', err);
        res.status(500).json({ success: false, message: 'Error filtering players.' });
      });
  });
});

// Endpoint to get the list of players
app.get('/players', (req, res) => {
  fs.readFile(path.join(dataDir, 'dados.json'), 'utf8', (err, data) => {
    if (err) {
      return res.status(500).send('Error reading data.');
    }

    const playersData = JSON.parse(data);
    const playerNames = Object.keys(playersData);

    res.json(playerNames);
  });
});

// Endpoint to provide chart data for a specific player
app.get('/chart-data/:playerName', (req, res) => {
  const playerName = req.params.playerName;

  fs.readFile(path.join(dataDir, 'dados.json'), 'utf8', (err, data) => {
    if (err) {
      return res.status(500).send('Error reading data.');
    }

    const playersData = JSON.parse(data);

    if (!playersData[playerName]) {
      return res.status(404).send('Player not found.');
    }

    const playerData = playersData[playerName];
    const chartData = playerData.prices.map((price, index) => ({
      price: parsePrice(price),
      time: playerData.receivedAt[index]
    }));

    res.json(chartData);
  });
});

// Endpoint to display the dashboard HTML
app.get('/dashboard', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'dashboard', 'dashboard.html'));
});

// Endpoint to display the form
app.get('/form', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'form', 'form.html'));
});

// Start the server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
