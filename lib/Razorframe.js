const { EventEmitter } = require('events');
const LinkedList = require('./LinkedList');
const express = require('express');
const cluster = require('cluster');

const redis = require('redis');
const redisAdapter = require('socket.io-redis');

const sticky = require('sticky-session');
const num_workers = require('os').cpus().length || 1;
const app = express();

/**Razorframe constructor
 *
 * MSG parameters
 * @param {string} MSG.contents => the message value 
 * @param {string} MSG.eventOut => the outbound event name
 * @param {string} MSG.channel => the channel name 
 */
class Razorframe {
  constructor() {
    this.storage = new LinkedList();
    this.notification = new EventEmitter();
  }

  enqueue(MSG) {
    console.log('enqueue has run');

    if (!MSG) console.error('Error: must pass in valid msg object!');
    else if (!MSG.contents) console.error('Error: contents should not be null');
    else if (!MSG.eventOut) console.error("Error: MSG object must contain valid outbound event name");

    else {
      this.storage.push(MSG);
      this.notification.emit('enq', this.storage.length);
    }
  }

  dequeue() {
    console.log('dequeue has run.');
    if (this.storage.length === 0) console.error('Error: message queue is currently empty!');
    else {
      let MSG = this.storage.pop();
      this.notification.emit('deq', MSG);
    }
  }
}

let io;

const rz = {
  razorframe: new Razorframe(),

  init(http, config) {
    
    io = require('socket.io')(http);

    if (!sticky.listen(http, config.port)) {
      // Master code
      http.once('listening', function () {
        console.log('server started on 3000 port');
      });
    } else {
      // Worker code
      
      handleSockets(config);
    }
  },

  // If errors occur during database writes, the message will be sent to onError function. If it is the first time the message has caused an error, it will be reentered into the queue for a second attempt at a database write, but it will have an error flag. If the same message comes back, it will emit an error message to the client.
  onError(MSG, count = 2) {
    if (MSG.error === count) {
      console.log('inside error function with msg:', MSG.contents);
      io.to(MSG.id).emit('error', `There was an error writing "${MSG.contents}" to the database.`);
    } else {
      if (!MSG.error) MSG.error = 1;
      else MSG.error++;
      this.razorframe.enqueue(MSG);
    }
  }
}

const handleSockets = (config) => {
  const { write, show } = config;
  io.on('connection', (socket) => {
    console.log('a user connected! 💃');
    show(socket);

    socket.on('disconnect', () => console.log('user disconnected!'));

    // Client listeners
    socket.on('msgSent', (MSG, id) => {
      MSG.id = socket.id;
      rz.razorframe.enqueue(MSG);
    });
  });

  // Server-side listeners
  rz.razorframe.notification.on('enq', (data) => {
    rz.razorframe.dequeue();
  });

  rz.razorframe.notification.on('deq', (MSG) => {
    write(MSG);
    if (!MSG.error) io.emit(MSG.eventOut, MSG.contents);
  });

};


module.exports = { Razorframe, rz };



/**
 * Messaging queue module for razorframe.
 * @author - Travis Huff (huff.travis@gmail.com)
 * @author - Eddie Park (ed.sh.park@gmail.com)
 * @author - Michael Sotkin (michael.sotkin@gmail.com)
 */
