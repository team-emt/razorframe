const express = require('express');
const path = require('path');
const app = express();
const http = require('http').Server(app);

// const { rz } = require('../../lib/Razorframe.js');
// const { rz } = require('razorframe');

/**
 * rzConfig properties - passes into rb any user-defined callbacks
 * @property {number}  port    - add server listener PORT
 * @property {boolean} cluster - define 'true' to enable clustering
*/
const rzConfig = {
  port: process.env.PORT || 3000,
  cluster: false
};

/**
 * dbConfig properties - passes into rz any user-defined database callbacks
 * @property {function} write  - a DB write callback (user-defined)
 * @property {function} show   - a DB read callback (user-defined)
 * @property {function} update - a DB update callback (user-defined)
 * @property {function} delete - a DB delete callback (user-defined)
 */
const dbConfig = {
  write: null,
  show: null,
  update: null,
  delete: null,
};

// Must pass http argument to connect to server
module.export = { http, rzConfig, dbConfig };

app.use(express.static(path.join(__dirname, '../')));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../index.html'));
});

app.get('/service', (req, res) => {
  res.send(JSON.stringify(process.pid));
});