
module.exports = (NEURON) => {
  const { http } = NEURON;
  const io = require('socket.io')(http);
  const Razorframe = require('./Razorframe');

  const rz = new Razorframe(NEURON);

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

