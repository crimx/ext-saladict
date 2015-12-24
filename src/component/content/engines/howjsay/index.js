'use strict'

// generate engines 

var template = require('../')('howjsay')


template.template = require('./template.html')

module.exports = template