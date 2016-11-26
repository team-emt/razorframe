// const io = require('socket.io')(http);
// const Razorframe = require('../../lib/Razorframe.js');
// const rz = Razorframe(http);

const express = require('express');
const path = require('path');
const app = express();
const bodyParser = require('body-parser');
const http = require('http').Server(app);

const { addToDb, showAll } = require('./eventCtrl'); // db methods

const rb = require('../../lib/Razorbrain.js');

// let params =  { http: http, writeCallback: addToDb, pullCallback: showAll }
// start thinking about parameter structure for anticipated callback needs

rb(http, addToDb);


// need this to be able to serve up app.js + styles.css
app.use(express.static(path.join(__dirname, '../')));
app.use(bodyParser.urlencoded({ extended: true }));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../index.html'));
});









// -------------------------------------------------------
// When we moved the Socket connection block over to server.js

// const io = require('socket.io')(http);

// io.on('connection', (socket) => {
//     console.log('a user connected!');

//     socket.on('disconnect', () => {
//       console.log('user disconnected!');
//     });

    
//     // Event listeners below 
//     socket.on('event', (msg) => {
//       // io.emit('text receieved', msg);
//       // socket.broadcast.emit('text receieved', msg);
//       msg.socket = socket;
//       msg.io = io;

//       rz.enqueue(msg);
//       // rz.broadcastOthers(socket, msg);

//     });
    
//     socket.on('sent', msg => {
//       console.log('inside db listener');
//       addToDb(msg);
//     });
//   });




http.listen(3000, () => console.log('✌️  on 3000'));