
module.exports = (http, store) => {
  const { write, show } = store;
  const io = require('socket.io')(http);
  const Razorframe = require('./Razorframe');

  const rz = new Razorframe();
  
  // SERVER COMMUNICATION LISTENERS-----------------------------
  rz.notification.on('deq', (MSG) => {

    // need to add a field to table that indicates message or image
    write(JSON.stringify(MSG.contents));
    MSG.io.emit(MSG.eventOut, MSG.contents);
  });
 
  // CLIENT COMMUNICATION LISTENERS-----------------------------
  io.on('connection', (socket) => {
    console.log('a user connected!');
    show(socket);
    socket.on('disconnect', () => { console.log('user disconnected!') });
    socket.on('msgSent', (MSG) => {
      MSG.socket = socket;
      MSG.io = io;
      rz.enqueue(MSG);
    });
    socket.on('imgSent', (MSG) => {
      MSG.socket = socket;
      MSG.io = io;
      rz.enqueue(MSG);
    });
  });
}

