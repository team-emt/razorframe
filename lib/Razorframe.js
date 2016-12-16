const { EventEmitter } = require('events');
const LinkedList = require('./LinkedList');
const express = require('express');
const cluster = require('cluster');
var os = require('os');
var debug = require('debug')('sticky:worker');

const redis = require('redis');
const redisAdapter = require('socket.io-redis');
const REDIS_URL = 'redis://rediscloud:2dfnKjdph4GyDuO3@redis-19519.c11.us-east-1-2.ec2.cloud.redislabs.com:19519';

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

  init(http, rzConfig, dbConfig) {
    io = require('socket.io')(http);

    if (rzConfig.cluster) {
      if (!listen(http, rzConfig.port)) {
        /*
        * Master code area
        */
        io.adapter(redisAdapter(REDIS_URL));

        // Error listeners for Redis adapter
        redisAdapter(REDIS_URL).pubClient.on('error', (err) => {
          console.error(`[Master] Issue connecting Redis adapter to Pub Client: ${err}`);
        });
        redisAdapter(REDIS_URL).subClient.on('error', (err) => {
          console.error(`[Master] Issue connecting Redis adapter to Sub Client: ${err}`);
        });

        http.once('listening', function () {
          console.log('server started on 3000 port');
        });

      } else {
        /*
        * Worker code area
        */
        io.adapter(redisAdapter(REDIS_URL));
        handleSockets(dbConfig);

        // Error listeners for Redis adapter        
        redisAdapter(REDIS_URL).pubClient.on('error', (err) => {
          console.error(`[Worker ${process.pid}] Issue connecting Redis adapter to Pub Client: ${err}`);
        });

        redisAdapter(REDIS_URL).subClient.on('error', (err) => {
          console.error(`[Worker ${process.pid}] Issue connecting Redis adapter to Sub Client: ${err}`);
        });
      }
    } else {
      // Cluster Off
      console.log('👻 clusters are off!');

      handleSockets(dbConfig);

      process.on('uncaughtException', (err) => {
        console.error('(Process Error) There was an error with event emitter communication: ' + err);
      });

      http.listen(process.env.PORT || rzConfig.port, () => console.log(`✌️  on ${rzConfig.port}`));

    }
  },

  /**
   * Error function for failed DB query
   * 
   * @param {object} MSG object,
   *                 refer to Razorframe constructor for keys
   * @param {number} user-definable, defaults to count=2
   * @returns {boolean}, true if successful retry
   */
  onError(MSG, count = 2) {
    if (MSG.error === count) {
      console.log('inside error function with msg:', MSG.contents);
      io.to(MSG.id).emit('error', `There was an error writing "${MSG.contents}" to the database.`);
    } else {
      if (!MSG.error) MSG.error = 1;
      else MSG.error++;
      this.razorframe.enqueue(MSG);
      return true;
    }
  }
}

/**
 * Sticky session function to bind clients to workers
 * 
 * @param {variable} Express server
 * @param {number} port number
 * @returns {boolean}
 */
const Master = require('./Master');
const listen = (server, port) => {
  if (cluster.isMaster) {
    const workerCount = os.cpus().length || 1;
    // const workerCount = 4;

    const master = new Master(workerCount);
    master.listen(port);
    master.once('listening', function () {
      server.emit('listening');
    });
    return false;
  }

  // Override close callback to gracefully close server
  var oldClose = server.close;
  server.close = function close() {
    debug('graceful close');
    process.send({ type: 'close' });
    return oldClose.apply(this, arguments);
  };

  process.on('message', function (msg, socket) {
    if (msg !== 'sticky:balance' || !socket)
      return;

    debug('incoming socket');
    server._connections++;
    socket.server = server;
    server.emit('connection', socket);
  });

  process.on('uncaughtException', (err) => {
    console.error('(Process Error) There was an error with event emitter communication: ' + err);
  });

  return true;
}

/**
 * Worker logic for socket connections and event listeners
 * 
 * @param {object} config
 *                 user configurable object to pass in functions to rz
 */
const handleSockets = (dbConfig) => {
  const { write, show } = dbConfig;

  io.on('connection', (socket) => {

    console.log('a user connected! 💃');
    show(socket);

    socket.on('disconnect', function () {
      console.log(socket.id + ' disconnect (' + socket.client.conn.transport.constructor.name + ')');
    });

    // Client listeners----------------------
    socket.on('msgSent', (MSG, id) => {
      console.log('message recieved!------------------');
      MSG.id = socket.id;
      rz.razorframe.enqueue(MSG);
    });
  });

  // Server-side listeners----------------------
  // Node error listener + reporter
  rz.razorframe.notification.on('error', (err) => {
    console.error('There was an error with event emitter communication: ' + err);
  });

  // Process error listener + reporter
  // process.on('uncaughtException', (err) => {
  //   console.error('(Process Error) There was an error with event emitter communication: ' + err);
  // });

  rz.razorframe.notification.on('enq', (data) => {
    rz.razorframe.dequeue();
  });

  // Apply incoming DB query supplied by MSG.action
  rz.razorframe.notification.on('deq', (MSG) => {
    switch (MSG.action) {
      case 'write':
        write(MSG);
        break;
      case 'read':
        // show();
        break;
      case 'update':
        // update method from user
        break;
      case 'delete':
        // delete method from user; will take an argument to delete
        break;
      default:
        console.log('no action provided!');
        break;
    }

    // If no error attached to MSG, then emit to clients
    if (!MSG.error) {
      if (MSG.contents === 'service') {
        io.emit(MSG.eventOut, `service worker: ${process.pid}`);
      } else if (!MSG.eventOut) {
        console.log('No eventOut provided! No client emission executed.');
      } else {
        io.emit(MSG.eventOut, MSG.contents);
      }
    }
  });

};

module.exports = { rz };


/**
 * Messaging queue module for razorframe.
 * 
 * @author - Travis Huff (https://github.com/travishuff)
 * @author - Eddie Park (https://github.com/parkedwards)
 * @author - Michael Sotkin (https://github.com/msotkin)
 */
