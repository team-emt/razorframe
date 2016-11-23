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
  constructor () {
    this.storage = {};
    this.index = 0;
  }

  enqueue(value) {
    this.storage[this.index] = value;
    this.index++;
  }

  dequeue() { 
    if (this.index === 0) return undefined;
    let data = this.storage[0];
    delete this.storage[0];
    for (let i in this.storage) {
      this.storage[i - 1] = this.storage[i];
    }
    this.index--;

    //  pass result to socket.io on the server??
    // return result;

    //  which DB table to update??
    // this.updateDB(data);

    //  which channel to broadcast on??
    this.broadcastClients(data);
  }

  serverOn(event, data) {

  }

  // updateDB(data) {

  // }

  broadcastClients(data) {
    if (data.channel) {
      io.to(data.channel).emit(data.event, data.data);
    }
    socket.broadcast.emit(data.event, data.data);
  }

}

export default Razorframe;
