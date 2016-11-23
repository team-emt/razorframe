const express = require('express');
const path = require('path');
const app = express();
const rz = require('../../lib/message-queue.js');

const http = require('http').Server(app);
const io = require('socket.io')(http);

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../index.html'));
});

app.listen(3000, () => console.log('Listening at 3000'));