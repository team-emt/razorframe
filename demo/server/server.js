const express = require('express');
const path = require('path');
const app = express();
const bodyParser = require('body-parser');
const http = require('http').Server(app);

const { addToDb, showAll } = require('./eventCtrl'); // user-defined db methods




// const rb = require('../../lib/Razorbrain.js');

/**
 * NEURON parameters - passes into rb the http object + any user-defined callbacks
 * @param - {Object} http => instantiate an http server
 * @param - {Function} write => a DB write callback (user-defined)
 * @param - {Function} show => a DB pull callback (user-defined)
 */
// const NEURON = {
//   write: addToDb,
//   show: showAll,
// };

// rb(http, NEURON);
const io = require('socket.io')(http);

io.on('connection', (socket) => {
    console.log('a user connected!');
    showAll(socket);
    socket.on('disconnect', () => {
      console.log('user disconnected!');
    });

    
    // Event listeners below 
    socket.on('event', (msg) => {
      console.log(msg);
      addToDb(msg.contents);
      socket.emit(msg.eventOut, msg.contents);
    });
  });

app.use(express.static(path.join(__dirname, '../')));
app.use(bodyParser.urlencoded({ extended: true }));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../index.html'));
});









// -------------------------------------------------------
// When we moved the Socket connection block over to server.js

// 




http.listen(3000, () => console.log('✌️  on 3000'));