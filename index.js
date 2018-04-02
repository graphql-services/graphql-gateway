const { start } = require('./lib/app');

start().catch(err => {
  console.log('failed to start:', err);
});
