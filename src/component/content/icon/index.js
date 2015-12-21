'use strict'

module.exports = {
  template: require('./template.html'),
  replace: true,
  data: function() {
    return {
      isHidden: true,
      isAnimate: false
    }
  },
  props: ['pageStatus'],
  methods: {
    mouseenter: function() {
      // show panel
      this.$dispatch('panel-hide', false)
      // animate icon
      this.isAnimate = true
    },
    mouseleave: function() {
      this.isAnimate = false
    }
  },
  events: {
    'icon-hide': function(flag) {
      this.isHidden = flag
    }
  }
}
