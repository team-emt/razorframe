const { EventEmitter } = require('events'); 

/**
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
    if (!MSG) throw new Error('Unable to enqueue: must pass in valid msg object!');
    if (!MSG.contents) throw new Error('Unable to enqueue: contents should not be null');
    if (!MSG.eventOut) throw new Error("Unable to enqueue: MSG object must contain valid outbound event name");

    this.storage[this.length] = MSG;
    this.length++;
    this.dequeue(); // maybe need to throttle each enq : dq call
  }

  dequeue() {
    if (!this.length) throw new Error('Unable to dequeue; message queue is currently empty!');

    let MSG = this.storage[0];
    delete this.storage[0];
    for (let i in this.storage) {
      this.storage[i - 1] = this.storage[i];
    }
    this.length--;

    this.notification.emit('deq', MSG);

    // const { write } = this.NEURON;
    // write(MSG.contents);
    // this.broadcastOthers(MSG);
    // this.broadcastAll(MSG);
  }

  
  broadcastOthers(MSG) {
    const { socket, contents, eventOut } = MSG;
    socket.broadcast.emit(eventOut, contents);
  }

  broadcastAll(MSG) {
    const { io, contents, eventOut } = MSG;
    io.emit(eventOut, contents);
  }

  
  serverOn(event, data) { }
  enqueueAsyncBatch(MSG) { }
  dequeueAsyncBatch() { }
}

module.exports = Razorframe;

/**
 * Messaging queue module for razorframe.
 * @author - Travis Huff (huff.travis@gmail.com)
 * @author - Eddie Park (ed.sh.park@gmail.com)
 * @author - Michael Sotkin (michael.sotkin@gmail.com)
 */
