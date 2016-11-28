
module.exports = (http, NEURON) => {
  const { write, show } = NEURON;
  const io = require('socket.io')(http);
  const Razorframe = require('./Razorframe');

  const rz = new Razorframe();
  
  // SERVER COMMUNICATION LISTENERS-----------------------------
  rz.notification.on('deq', (MSG) => {
    write(MSG.contents);
    MSG.io.emit(MSG.eventOut, MSG.contents);
  });
 
  // CLIENT COMMUNICATION LISTENERS-----------------------------
  io.on('connection', (socket) => {
    console.log('a user connected!');
    show(socket);
    socket.on('disconnect', () => { console.log('user disconnected!') });
    socket.on('event', (MSG) => {
      MSG.socket = socket;
      MSG.io = io;
      rz.enqueue(MSG);
    });
  });
}

