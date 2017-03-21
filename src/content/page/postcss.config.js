module.exports = () => {
  var config = require('../../../postcss.config')()
  config.plugins.push(require('postcss-safe-important')())
  return config
}
