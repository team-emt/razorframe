
module.exports = (http) => {
  const io = require('socket.io')(http);
  const rz = require('./Razorframe');
  
  io.on('connection', (socket) => {
    console.log('a user connected!');

    socket.on('disconnect', () => {
      console.log('user disconnected!');
    });

    
    // Event listeners below 
    socket.on('event', (msg) => {
      // io.emit('text receieved', msg);
      // socket.broadcast.emit('text receieved', msg);
      rz.enqueue(msg);
      console.log(rz.storage);
    });
  })
}