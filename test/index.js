// const Promise = require('bluebird');

// const unit = Promise.promisify(require('./js/unit'));
const unit = require('./js/unit');
const integration = require('./js/integration');

unit.then(function(result) {
  integration();
}).catch(() => {
  console.log('caught!');
});

// require('./js/integration')





