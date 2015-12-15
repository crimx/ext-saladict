'use strict'

// generate engines 

var utils = require('../../../utils')

module.exports = function (engineID) {
  return {
    template: require('./template.html'),
    replace: true,
    data: function() {
      return {
        isHidden: true,
        // logo src
        logo: chrome.extension.getURL('images/engines/' + engineID + '.ico'),
        // data from background engine
        data: {}
      }
    },
    methods: {
      voicePlay: function(url) {
        if (this.audio) {
          this.audio.pause()
        }
        this.audio = new Audio(url)
        this.audio.play()
      },
      // mouse enter
      readyVoicePlay: function(url) {
        var that = this
        this.voicePlayTimeout = setTimeout(function() {
          that.voicePlay(url)
        }, 500)
      },
      // mouse leave
      cancelVoicePlay: function() {
        clearTimeout(this.voicePlayTimeout)
      },
      show: function() {
        this.isHidden = false
        this.$dispatch('engine-status', true)
      },
      hide: function() {
        this.isHidden = true
        this.$dispatch('engine-status', false)
      }
    },
    events: {
      search: function(selection) {
        this.isHidden = true
        // same selection, no need for searching
        if (this.selection === selection) {
          this.show()
          return
        }
        // update selection
        this.selection = selection

        var that = this
        utils
          .sendMessage({
            msg: 'translate',
            id: engineID,
            text: selection
          })
          .then(success, faild)
        // keep broadcasting!
        return true

        function success(data) {
          if (!data.msg) {
            faild()
            return
          }
          that.data = data
          that.show()
        }

        function faild() {
          that.hide()
        }
      }
    }
  }
}
