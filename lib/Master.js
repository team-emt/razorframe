const cluster = require('cluster');
const util = require('util');
const net = require('net');
const ip = require('ip');

const debug = require('debug')('sticky:master');

/** @constructs Master            - Master controller for Node cluster
 *
 * @method {function} hash        - creates unique hash for worker instances
 * @method {function} spawnWorker - creates instance of a worker
 * @method {function} respawn     - replaces instance of a worker
 * @method {function} balance     - creates sticky session between socket and worker
 *
 */

console.log(net.Server);

function Master(workerCount) {
  net.Server.call(this, {
    pauseOnConnect: true
  }, this.balance);

  this.seed = (Math.random() * 0xffffffff) | 0;
  this.workers = [];

  debug('master seed=%d', this.seed);

  this.once('listening', function() {
    debug('master listening on %j', this.address());

    for (let i = 0; i < workerCount; i++) {
      this.spawnWorker();
    }
  });
}
util.inherits(Master, net.Server);
module.exports = Master;

/** @method hash
 * 
 * @param {number} ip - IP address from server
 * @returns {number}
 */
Master.prototype.hash = function hash(ip) {
  let hash = this.seed;
  for (let i = 0; i < ip.length; i++) {
    let num = ip[i];

    hash += num;
    hash %= 2147483648;
    hash += (hash << 10);
    hash %= 2147483648;
    hash ^= hash >> 6;
  }

  hash += hash << 3;
  hash %= 2147483648;
  hash ^= hash >> 11;
  hash += hash << 15;
  hash %= 2147483648;

  return hash >>> 0;
};

/** @method spawnWorker
 * 
 */
Master.prototype.spawnWorker = function spawnWorker() {
  let worker = cluster.fork();

  let self = this;
  worker.on('exit', function(code) {
    debug('worker=%d died with code=%d', worker.process.pid, code);
    self.respawn(worker);
  });

  worker.on('message', function(msg) {
    // Graceful exit
    if (msg.type === 'close') {
      self.respawn(worker);
    }
  });

  debug('worker=%d spawn', worker.process.pid);
  this.workers.push(worker);
};

/** @method respawn
 * 
 * @param {number} worker - Node worker ID
 */
Master.prototype.respawn = function respawn(worker) {
  let index = this.workers.indexOf(worker);
  if (index !== -1) {
    this.workers.splice(index, 1);
  }
  this.spawnWorker();
};

/** @method balance
 * 
 * @param {number} socket - Socket ID of client
 */
Master.prototype.balance = function balance(socket) {
  let addr = ip.toBuffer(socket.remoteAddress || '127.0.0.1');
  let hash = this.hash(addr);

  debug('balacing connection %j', addr);
  this.workers[hash % this.workers.length].send('sticky:balance', socket);
};
