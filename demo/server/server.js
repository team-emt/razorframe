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

const { addToDb, showAll } = require('./eventCtrl');
const rz = require('../../lib/Razorframe.js');
// rb(http);

const io = require('socket.io')(http);

app.use(express.static(path.join(__dirname, '../'))); // need this to be able to serve up app.js + styles.css
app.use(bodyParser.urlencoded({ extended: true }));


// Routing --------------------------------
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../index.html'));
});

io.on('connection', (socket) => {
    console.log('a user connected!');

    socket.on('disconnect', () => {
      console.log('user disconnected!');
    });

    
    // Event listeners below 
    socket.on('event', (msg) => {
      // io.emit('text receieved', msg);
      // socket.broadcast.emit('text receieved', msg);
      msg.socket = socket;
      msg.io = io;

      rz.enqueue(msg);
      // rz.broadcastOthers(socket, msg);

    });
    // socket.on('sent', msg => {
    //   console.log('inside db listener');
    //   addToDb(msg);
    // });
  });




http.listen(3000, () => console.log('✌️  on 3000'));