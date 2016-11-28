
module.exports = (NEURON) => {
  const { http, write } = NEURON;
  const io = require('socket.io')(http);
  const Razorframe = require('./Razorframe');

  const rz = new Razorframe();
  
  // SERVER COMMUNICATION LISTENERS-----------------------------
  rz.notification.on('deq', (MSG) => {
    console.log(rz.notification);
    write(MSG.contents);
    MSG.io.emit(MSG.eventOut, MSG.contents);
  });
 
  // CLIENT COMMUNICATION LISTENERS-----------------------------
  io.on('connection', (socket) => {
    console.log('a user connected!');
    socket.on('disconnect', () => { console.log('user disconnected!') });
    socket.on('event', (MSG) => {
      MSG.socket = socket;
      MSG.io = io;
      rz.enqueue(MSG);
    });
  });
}
