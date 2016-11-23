/**
 * Messaging queue module for razorframe.
 *
 * @author - Travis Huff (huff.travis@gmail.com)
 * @author - Eddie Park (ed.sh.park@gmail.com)
 * @author - Michael Sotkin (michael.sotkin@gmail.com)
 */

const http = require('http');
const io = require('socket.io');

function Queue() {
  this.storage = {};
  this.index = 0;
}

Queue.prototype.enqueue = function(value) {
  this.storage[this.index] = value;
  this.index++;
};

Queue.prototype.dequeue = function() { 
  if (this.index === 0) return undefined;
  let result = this.storage[0];
  delete this.storage[0];
  for (let i in this.storage) {
    this.storage[i - 1] = this.storage[i];
  }
  this.index--;

  //  pass result to socket.io on the server??
  // return result;

  //  which DB table to update??
  updateDB(result);

  //  which channel to broadcast on??
  broadcastClients(result);
};



export default Queue;
