'use strict'

// generate engines 

var utils = require('../../../utils')

var template = require('../')('howjsay')


template.template = require('./template.html')

module.exports = template