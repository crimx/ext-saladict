const neutrino = require('neutrino')

process.env.NODE_ENV = process.env.NODE_ENV || 'test'

module.exports = neutrino().jest()
