const LinkedList = require('./LinkedList');

const { EventEmitter } = require('events');
const cluster = require('cluster');
const os = require('os');
const debug = require('debug')('sticky:worker');
let io;

const redis = require('redis');
const redisAdapter = require('socket.io-redis');
const REDIS_URL = process.env.REDIS_URL || { host: 'localhost', port: 6379 };


/** @constructs Razorframe
 * @method {function} enqueue - adds event to storage
 * @method {function} dequeue - removes event from storage (FIFO)
 *
 * MSG properties
 * @property {string} MSG.contents - the message value
 * @property {string} MSG.eventOut - the outbound event name
 * @property {string} MSG.action   - the database action
 */
class Razorframe {
  constructor() {
    this.storage = new LinkedList();
    this.notification = new EventEmitter();
  }

  enqueue(MSG) {
    if (!MSG) console.error(`Error: must pass in valid MSG object!`);
    else if (!MSG.contents) console.error(`Error: MSG.contents should not be null!`);
    else if (!MSG.eventOut) console.error(`Error: MSG.eventOut must contain valid outbound event name!`);
    else {
      this.storage.push(MSG);
      this.notification.emit('enq', this.storage.length);
    }
  }

  dequeue() {
    if (this.storage.length === 0) console.error(`Error: message queue is currently empty!`);
    else {
      let MSG = this.storage.pop();
      this.notification.emit('deq', MSG);
    }
  }
}

const rz = {
  razorframe: new Razorframe(),

  /** @function init - Initializes socket connections and Node clusters
   *
   * @param {number} http     - defined in server.js
   * @param {object} rzConfig - defined in server.js
   * @param {object} dbConfig - defined in server.js
   */
  init(http, rzConfig, dbConfig) {
    io = require('socket.io')(http);

    // If Node clusters are enabled...
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
          console.log(`Server started on PORT ${rzConfig.port}`);
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

    // If Node clusters are disabled...
    } else {
      console.log(`Clusters are disabled!`);

      handleSockets(dbConfig);

      http.listen(process.env.PORT || rzConfig.port, () => console.log(`Listening on ${rzConfig.port}`));

    }
  },

  /** @function onError - Handles failed DB query
   *
   * @param   {object}  - MSG object: refer to Razorframe constructor for properties
   * @param   {number}  - user-definable, defaults to count = 2
   * @returns {boolean} - true if successful retry
   */
  onError(MSG, count = 2) {
    if (MSG.error === count) {
      console.log(`inside error function with msg: ${MSG.contents}`);
      io.to(MSG.id).emit('error', `There was an error writing "${MSG.contents}" to the database.`);
    } else {
      if (!MSG.error) MSG.error = 1;
      else MSG.error++;
      this.razorframe.enqueue(MSG);
      return true;
    }
  }
}

const Master = require('./Master');

/** @function listen - Enables sticky sessions to bind clients to workers
 * 
 * @param   {variable} server - Express server
 * @param   {number}   port   - port number
 * @returns {boolean}
 */
function listen(server, port) {
  if (cluster.isMaster) {
    const workerCount = os.cpus().length || 1;

    const master = new Master(workerCount);
    master.listen(port);
    master.once('listening', function () {
      server.emit('listening');
    });
    return false;
  }

  // Override close callback to gracefully close server
  let oldClose = server.close;
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

  return true;
}

/** @function handleSockets - Worker logic for socket connections and event listeners
 *
 * @param {object} dbConfig - user configurable object to pass in functions to rz
 */
function handleSockets(dbConfig) {

  io.on('connection', (socket) => {

    console.log(`a user connected!`);
    if (dbConfig.show) {
      dbConfig.show(socket);
    }

    socket.on('disconnect', function () {
      console.log(`${socket.id} disconnect: ${socket.client.conn.transport.constructor.name}`);
    });

    // Client listeners----------------------------------
    socket.on('msgSent', (MSG, id) => {
      console.log(`message recieved!`);
      MSG.id = socket.id;
      rz.razorframe.enqueue(MSG);
    });
  });

  // Server-side listeners-------------------------------
  // Node error listener + reporter
  rz.razorframe.notification.on('error', (err) => {
    console.error(`There was an error with event emitter communication: ${err}`);
  });

  rz.razorframe.notification.on('enq', (data) => {
    rz.razorframe.dequeue();
  });

  // Apply incoming DB query supplied by MSG.action
  rz.razorframe.notification.on('deq', (MSG) => {
    switch (MSG.action) {
      case 'write':
        if (dbConfig.write) {
          dbConfig.write(MSG);
        }
        break;
      case 'read':
        if (dbConfig.show) {
          dbConfig.show();
        }
        break;
      case 'update':
        if (dbConfig.update) {
          dbConfig.update(MSG);
        }
        break;
      case 'delete':
        if (dbConfig.delete) {
          dbConfig.delete(MSG);
        }
        break;
      default:
        console.log(`No action provided!`);
        break;
    }

    // If no error attached to MSG, then emit to clients
    if (!MSG.error) {
      if (MSG.contents === 'service') {
        io.emit(MSG.eventOut, `service worker: ${process.pid}`);
      } else if (!MSG.eventOut) {
        console.log(`No eventOut provided! No client emission executed.`);
      } else {
        console.log('inside deq listener!');
        io.emit(MSG.eventOut, MSG.contents);
      }
    }
  });

};

module.exports = { rz };


/**
 * Razorframe: A back-end library for scalable, real-time web apps.
 * 
 * @author - Travis Huff    (https://github.com/travishuff)
 * @author - Eddie Park     (https://github.com/parkedwards)
 * @author - Michael Sotkin (https://github.com/msotkin)
 */
