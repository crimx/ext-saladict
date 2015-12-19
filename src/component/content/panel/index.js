'use strict'

var engineFactory = require('../engines')
var utils = require('../../utils')

module.exports = {
  template: require('./template.html'),
  replace: true,
  data: function() {
    return {
      errorMessage: chrome.i18n.getMessage('engine_error_msg'),
      // keep panel on top till next click
      keepAlive: false,

      isHidden: true,
      engineStatus: {
        total: 4, // bing, vocabulary, urban dictionary, howjsay
        loaded: 0,
        faild: 0
      },
      // handle top/bottom/right/left style
      styleObj: {},
      // dictcn chart
      isChartHidden: true,
      // pin will keep panel on top forever till close button is clicked
      isPinned: false,
      // if panel moving
      isGrabbing: false
    }
  },
  props: ['pageStatus'],
  components: {
    bing: engineFactory('bing'),
    vocabulary: engineFactory('vocabulary'),
    ud: engineFactory('ud'),
    howjsay: require('../engines/howjsay'),
    dictcn: require('../engines/dictcn')
  },
  methods: {
    mouseleave: function() {
      var that = this
      if (!this.keepAlive && !this.isPinned) {
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
      var result = this.$el.getBoundingClientRect()
      this.styleObjOrigin = {
        top: result.top,
        left: result.left
      }
    },
    mouseup: function() {
      this.isMousedown = false
      this.isGrabbing = false
    },
    mousemove: function(e) {
      if (!this.isMousedown) return
      if (e.target !== e.currentTarget) return

      if (!this.isGrabbing) {
        this.$dispatch('icon-hide', true)
      }

      this.keepAlive = true
      this.isGrabbing = true

      this.styleObj = {
        top: this.styleObjOrigin.top + e.clientY - this.mouseY,
        left: this.styleObjOrigin.left + e.clientX - this.mouseX
      }
    },
    searchInput: function() {
      var that = this
      clearTimeout(this.searchInputTimeout)
      if (this.pageStatus.selection) {
        this.searchInputTimeout = setTimeout(function() {
          that.goSearch()
        }, 1500)
      }
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
        result.left = iconLeft + 40 + 10
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
      this.isPinned = false
      this.$dispatch('panel-pinned', false)
    },
    clickChart: function() {
      this.isChartHidden = !this.isChartHidden
      this.$broadcast('chart-hide', this.isChartHidden)
    },
    clickPin: function() {
      this.isPinned = !this.isPinned
      this.$dispatch('panel-pinned', this.isPinned)
      // hide icon
      if (this.isPinned) {
        this.$dispatch('icon-hide', true)
      }
    }
  },
  events: {
    'panel-hide': function(flag) {
      // panel ready to show, request engines searching
      if (!flag) {
        clearTimeout(this.hideTimeout)
        // panel already showed
        if (!this.isHidden) return
        
        this.isChartHidden = true
        this.isPinned = false
        this.setInitPosition()
        if (this.pageStatus.selection) {
          this.goSearch()
        }
      }
      this.isHidden = flag
    },
    'engine-status': function(flag) {
      if (flag) this.engineStatus.loaded += 1
      else this.engineStatus.faild += 1
    },
    'search': function() {
      // intercept search
      this.goSearch()
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
