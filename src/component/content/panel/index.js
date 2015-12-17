'use strict'

var engineFactory = require('../engines')
var utils = require('../../utils')

module.exports = {
  template: require('./template.html'),
  replace: true,
  data: function() {
    return {
      keepAlive: false,
      isHidden: true,
      engineStatus: {
        total: 1,
        loaded: 0,
        faild: 0
      },
      styleObj: {},
      isChartHidden: true
    }
  },
  props: ['pageStatus'],
  components: {
    titlebar: require('../titlebar'),
    bing: engineFactory('bing'),
    ud: engineFactory('ud'),
    howjsay: require('../engines/howjsay'),
    dictcn: require('../engines/dictcn')
  },
  methods: {
    mouseleave: function() {
      var that = this
      if (!this.keepAlive) {
        this.hideTimeout = setTimeout(function() {
          that.isHidden = true
        }, 2500)
      }
    },
    mouseenter: function() {
      clearTimeout(this.hideTimeout)
    },
    mousedown: function(e) {
      this.isMousedown = true
      this.mouseX = e.clientX
      this.mouseY = e.clientY

      var styleObjOrigin = {}
      var styleObj = this.styleObj
      Object.keys(styleObj).forEach(function(k) {
        styleObjOrigin[k] = styleObj[k]
      })
      this.styleObjOrigin = styleObjOrigin
    },
    mouseup: function() {
      this.isMousedown = false
    },
    mousemove: function(e) {
      if (!this.isMousedown) return
      if (e.target !== e.currentTarget) return

      this.keepAlive = true

      // calculate offset
      var result = {}
      if (!utils.isUndefined(this.styleObjOrigin.top))
        result.top = this.styleObjOrigin.top + e.clientY - this.mouseY
      if (!utils.isUndefined(this.styleObjOrigin.bottom))
        result.bottom = this.styleObjOrigin.bottom + this.mouseY - e.clientY
      if (!utils.isUndefined(this.styleObjOrigin.left))
        result.left = this.styleObjOrigin.left + e.clientX - this.mouseX
      if (!utils.isUndefined(this.styleObjOrigin.right))
        result.right = this.styleObjOrigin.right + this.mouseX - e.clientX
      this.styleObj = result
    },
    searchInput: function() {
      var that = this
      clearTimeout(this.searchInputTimeout)
      this.searchInputTimeout = setTimeout(function() {
        that.goSearch()
      }, 1000)
    },
    goSearch: function() {
      this.engineStatus.loaded = 0
      this.engineStatus.faild = 0
      this.$broadcast('search', this.pageStatus.selection)
    },
    setInitPosition: function() {
      var x = this.pageStatus.clientX
      var y = this.pageStatus.clientY
      var ww = window.innerWidth
      var wh = window.innerHeight
      //             +-----+
      //             |     |
      //             |     |24px
      //        40px +-----+
      //             | 24px
      //             |
      //       30px  |
      //     +-------+
      // cursor
      var iconLeft = ww - x > 54 ? x + 30 : x - 30
      var iconTop = y > 40 ? y - 40 : y + 20

      var result = {}
      if (x < ww / 2) {
        result.left = iconLeft + 24 + 10
      } else {
        result.right = ww - (iconLeft - 10)
      }
      if (y < wh / 2) {
        result.top = iconTop
      } else {
        result.bottom = 50
      }
      this.styleObj = result
    },
    clickClose: function() {
      this.isHidden = true
    },
    clickChart: function() {
      this.isChartHidden = !this.isChartHidden
      this.$broadcast('chart-hide', this.isChartHidden)
    }
  },
  events: {
    'panel-hide': function(flag) {
      // panel ready to show, request engines searching
      if (!flag) {
        this.pinned = false
        this.setInitPosition()
        this.goSearch()
      }
      this.isHidden = flag
    },
    'engine-status': function(flag) {
      if (flag) this.engineStatus.loaded += 1
      else this.engineStatus.faild += 1
    }
  },
  computed: {
    styleComputed: function() {
      var styleObj = this.styleObj
      var result = {}
      Object.keys(styleObj).forEach(function(k) {
        result[k] = styleObj[k] + 'px!important'
      })
      return result
    }
  }
}
