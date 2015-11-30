'use strict'

module.exports = {
  el: '#saladict-panel',
  template: require('./template.html'),
  replace: true,
  data: {
    
  },
  methods: {
    mouseleave: function() {
      var that = this
      this.hideTimeout = setTimeout(function() {
        that.pageStatus.panelHide = true
      }, 2500)
    },
    mouseenter: function() {
      clearTimeout(this.hideTimeout)
    }
  },
  computed: {
    styleObj: function() {
      var x = this.pageStatus.clientX
      var y = this.pageStatus.clientY
      var ww = window.innerWidth
      var wh = window.innerHeight
      //                  ________
      //                 |       |
      //                 |  LOGO | 24px
      //            40px |_______|
      //          _ _ _ _|  24px
      //        /|  30px
      // cursor//
      var iconLeft = ww - x > 54 ? x + 30 : x - 30
      var iconTop = y > 40 ? y - 40 : y + 20

      var result = {}
      if (x < ww / 2) {
        result.Left = iconLeft + 'px!important'
      } else {
        result.right = ww - (iconLeft + 24) + 'px!important'
      }
      if (y < wh / 2) {
        result.top = iconTop + 34 + 'px!important'
      } else {
        result.bottom = wh - (iconTop - 10) + 'px!important'
      }

      return result
    },
    panelShow: function() {
      var pageStatus = this.pageStatus
      var result = false

      if (pageStatus.iconMouseEnter) {
        pageStatus.iconMouseEnter = false
        result = true
      }

      if (pageStatus.panelHide) {
        pageStatus.panelHide = false
        result  = false     
      }

      // default
      return result
    }
  }
}