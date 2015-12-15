'use strict'

module.exports = {
  template: require('./template.html'),
  replace: true,
  data: function() {
    return {
      isHidden: true,
      logoSrc: chrome.extension.getURL('images/icon-pop.png')
    }
  },
  props: ['pageStatus'],
  methods: {
    mouseenter: function() {
      // show panel
      this.$dispatch('panel-hide', false)
    }
  },
  events: {
    'icon-hide': function(flag) {
      this.isHidden = flag
    }
  },
  computed: {
    styleObj: function() {
      var x = this.pageStatus.clientX
      var y = this.pageStatus.clientY
      var ww = window.innerWidth
      //             +-----+
      //             |     |
      //             |     |24px
      //        40px +-----+
      //             | 24px
      //             |
      //       30px  |
      //     +-------+
      // cursor
      x = ww - x > 54 ? x + 30 : x - 30
      y = y > 40 ? y - 40 : y + 20
      return {
        top: y + 'px!important',
        left: x + 'px!important'
      }
    }
  }
}
