const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs');
const app = express();

const PORT = 5000;
let data = {};

app.use(cors());
app.use(bodyParser.json())

function readJSON(path, res) {
  fs.readFile(path, 'utf8', (err, file) => {
    if (err) {
      console.error('Error reading JSON file:', err);
      return;
    }
    try {
      res.json(JSON.parse(file));
    } catch (parseError) {
      console.error('Error parsing JSON data:', parseError);
    }
  });
  
}

app.post('/api/save-order', (req, res) => {
  const data = req.body;

  fs.writeFile('ongoing_order.json', JSON.stringify(data, null, 2), (err) => {
    if (err) {
      return res.status(500).json({ message: 'Error writing file', error: err });
    }
    res.status(200).json({ message: 'File written successfully' });
  });
});

app.get("/api/get-orders", (req, res) => {
  readJSON('ongoing_order.json', res);
});

app.get("/api/get-items", (req, res) => {
  readJSON('items.json', res);
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});