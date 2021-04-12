require('babel-register')({
  presets: [[ 'env', { targets: { node: '14' } }]],
});

module.exports = require('./server.js').default();