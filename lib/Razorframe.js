/**
 * Messaging queue module for razorframe.
 *
 * @author - Travis Huff (huff.travis@gmail.com)
 * @author - Eddie Park (ed.sh.park@gmail.com)
 * @author - Michael Sotkin (michael.sotkin@gmail.com)
 */
// const io = require('socket.io')(http);

// data = {
//   event: '',
//   channel: '',
//   data: ''
// };


class Razorframe {
  constructor() {
    this.storage = {};
    this.length = 0;
  }

  checkLength() {
    return this.length > 0;
  }

  enqueue(value) {
    this.storage[this.length] = value;
    this.length++;
    console.log('after enq: ', this.storage);
    
    this.dequeue(); // maybe need to throttle each enq : dq call
  }

  dequeue() {
    if (this.length === 0) return undefined;
    let data = this.storage[0];
    delete this.storage[0];
    for (let i in this.storage) {
      this.storage[i - 1] = this.storage[i];
    }
    this.length--;

    console.log('after dq: ', this.storage);
    console.log('----------------------');

    this.broadcastOthers

    //  pass result to socket.io on the server??
    // return result;

    //  which DB table to update??
    // this.updateDB(data);

    //  which channel to broadcast on??
    // this.broadcastOthers(data);
  }

  serverOn(event, data) {

  }

  // updateDB(data) {

  // }

  broadcastOthers(socket, msg) {
    // if (data.channel) {
    //   io.to(data.channel).emit(data.event, data.data);
    // }
    socket.broadcast.emit('text receieved', msg);
  }

  broadcastAll(io, msg) {
    io.emit('text receieved', msg);
  }

}

module.exports = new Razorframe();
