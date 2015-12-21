'use strict'

module.exports = {
  template: require('./template.html'),
  replace: true,
  data: function() {
    return {
      isHidden: true,
      isAnimate: false,
      top: 0,
      left: 0
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
      // icon position won't update when using props directly
      // because the object pageStatus didn't change
      this.top = this.pageStatus.iconTop +'px!important'
      this.left = this.pageStatus.iconLeft +'px!important'
    }
  }
}
