'use strict'

module.exports = {
  data: function() {
    return {
      isShow: false,
      isPinned: false,
      pageStatus: {
        clientX: 0,
        clientY: 0,
        selection: ''
      }
    }
  },
  template: require('./template.html'),
  replace: true,
  components: {
    icon: require('../icon'),
    panel: require('../panel')
  },
  events: {
    'panel-hide': function(flag) {
      this.$broadcast('panel-hide', flag)
    },
    'icon-hide': function(flag) {
      this.$broadcast('icon-hide', flag)
    },
    'panel-pinned': function(flag) {
      this.isPinned = flag
    }
  }
}
