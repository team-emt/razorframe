// const io = require('socket.io')(http);
// const Razorframe = require('../../lib/Razorframe.js');
// const rz = Razorframe(http);

const express = require('express');
const path = require('path');
const app = express();
const bodyParser = require('body-parser');
const http = require('http').Server(app);

const rb = require('../../lib/Razorbrain.js');
rb(http);

// const { addToDb, showAll } = require('./eventCtrl');

app.use(express.static(path.join(__dirname, '../'))); // need this to be able to serve up app.js + styles.css
app.use(bodyParser.urlencoded({ extended: true }));


// Routing --------------------------------
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../index.html'));
});




http.listen(3000, () => console.log('✌️  on 3000'));