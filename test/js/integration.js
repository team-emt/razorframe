const { expect } = require('chai');
const { rz } = require('../../lib/Razorframe.js');

////////   SERVER SET-UP   //////////////
const express = require('express');
const app = express();
const http = require('http').Server(app);
const rzConfig = {
  port: process.env.PORT || 3000,
  cluster: false
};
const dbConfig = {
  write: null,
  show: null,
  update: null,
  delete: null,
};
const io = require('socket.io-client');
/////////////////////////////////////////

module.export = function () {
  describe("echo", function () {
    let server,
      options = {
        transports: ['websocket'],
        'force new connection': true
      };

    beforeEach(function (done) {
      // start the server
      server = rz.init(http, rzConfig, dbConfig);
      done();
    });

    it("Client socket emissions should return in full circuit", function (done) {
      let client = io.connect("http://localhost:3000", options);

      client.on('msgBack', (message) => {
        expect(message).to.equal('heyo');
        client.disconnect();
        done();
      });

      client.emit('msgSent', { contents: 'heyo', eventOut: 'msgBack' });
    });

  });
}  
