const express = require('express');
const cors = require('cors');
const { transfer1_1 } = require('./transfer1_1');
const { transfer1N } = require('./transfer1_n');

const app = express();
app.use(cors());
app.use(express.json());

// Serve static files
app.use(express.static('public'));

// Route for the web interface
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

// Endpoint for 1-1 token transfer
app.post('/api/transfer1_1', async (req, res) => {
  try {
    const { senderMnemonic, receiverMnemonic, mintAddress, amount, senderAccountIndex, isMainnet } = req.body;
    
    if (!senderMnemonic || !receiverMnemonic || !mintAddress || amount === undefined) {
      return res.status(400).json({ error: 'Missing required parameters' });
    }

    const result = await transfer1_1({
      senderMnemonic,
      receiverMnemonic,
      mintAddress,
      amount,
      senderAccountIndex: senderAccountIndex || 0,
      isMainnet: isMainnet || false
    });

    res.json(result);
  } catch (error) {
    console.error('Error in transfer1_1:', error);
    res.status(500).json({ error: error.message });
  }
});

// Endpoint for 1-N token transfer
app.post('/api/transfer1_n', async (req, res) => {
  try {
    const { senderMnemonic, senderAccountIndex, receivers, mintAddress, isMainnet } = req.body;
    
    if (!senderMnemonic || !receivers || !mintAddress) {
      return res.status(400).json({ error: 'Missing required parameters' });
    }

    const result = await transfer1N({
      senderMnemonic,
      senderAccountIndex: senderAccountIndex || 0,
      receivers,
      mintAddress,
      isMainnet: isMainnet || false
    });

    res.json(result);
  } catch (error) {
    console.error('Error in transfer1_n:', error);
    res.status(500).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
