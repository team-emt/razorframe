
module.exports = (http, writeCallback) => {
  const io = require('socket.io')(http);
  const rz = require('./Razorframe');

  io.on('connection', (socket) => {
    console.log('a user connected!');
    
    socket.on('disconnect', () => {
      console.log('user disconnected!');
    });


    // Event listeners below 
    socket.on('event', (msg) => {
      msg.socket = socket;
      // io.emit('text receieved', msg);
      // socket.broadcast.emit('text receieved', msg);
      rz.enqueue(msg, writeCallback);
      // rz.broadcastOthers(socket, msg);

    });
  })

}