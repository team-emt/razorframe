
const unit = require('./js/unit');
const integration = require('./js/integration');

unit.then(function(result) {
  integration();
}).catch(() => {
  console.log('error with unit test promise');
});







