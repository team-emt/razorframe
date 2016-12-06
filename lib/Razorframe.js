const { EventEmitter } = require('events'); 

/**Razorframe constructor
 *
 * MSG parameters
 * @param {string} MSG.contents => the message value 
 * @param {string} MSG.eventOut => the outbound event name
 * @param {string} MSG.channel => the channel name 
 */
class Razorframe {
  constructor() {
    this.storage = {};
    this.length = 0;
    this.notification = new EventEmitter();
  }

  enqueue(MSG) {
    console.log('enqueue has run');

    if (!MSG) console.error('Error: must pass in valid msg object!');
    else if (!MSG.contents) console.error('Error: contents should not be null');
    else if (!MSG.eventOut) console.error("Error: MSG object must contain valid outbound event name");
    
    else {
      this.storage[this.length] = MSG;
      this.length++;
      this.notification.emit('enq', this.length);
    }
  }

  dequeue() {
    console.log('dequeue has run.');

    if (!this.length) console.error('Error: message queue is currently empty!');
    
    else {
      let MSG = this.storage[0];
      delete this.storage[0];
      for (let i in this.storage) {
        this.storage[i - 1] = this.storage[i];
      }
      this.length--;
      this.notification.emit('deq', MSG);
    }
  }
}

let io;

const rz = {
  razorframe: new Razorframe(),

  init(http, config) {
    io = require('socket.io')(http);
    handleSockets(config);
  }
}

const handleSockets = (config) => {
  const { write, show } = config;

  io.on('connection', (socket) => {
    console.log('a user connected!');
    show(socket);

    socket.on('disconnect', () => console.log('user disconnected!'));

    // Client listeners
    socket.on('msgSent', (MSG) => {
      rz.razorframe.enqueue(MSG);
    });

  });

  // Server-side listeners
  rz.razorframe.notification.on('enq', (data) => {
    rz.razorframe.dequeue();
  });

  rz.razorframe.notification.on('deq', (MSG) => {
    write(JSON.stringify(MSG.contents));
    io.emit(MSG.eventOut, MSG.contents);
  });

};



module.exports = rz;





/**
 * Messaging queue module for razorframe.
 * @author - Travis Huff (huff.travis@gmail.com)
 * @author - Eddie Park (ed.sh.park@gmail.com)
 * @author - Michael Sotkin (michael.sotkin@gmail.com)
 */
