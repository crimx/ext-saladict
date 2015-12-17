'use strict'

var engineFactory = require('../engines')

module.exports = {
  template: require('./template.html'),
  replace: true,
  data: function() {
    return {
      isHidden: true,
      engineStatus: {
        total: 1,
        loaded: 0,
        faild: 0
      }
    }
  },
  props: ['pageStatus'],
  components: {
    titlebar: require('../titlebar'),
    bing: engineFactory('bing'),
    ud: engineFactory('ud'),
    howjsay: require('../engines/howjsay')
  },
  methods: {
    mouseleave: function() {
      var that = this
      this.hideTimeout = setTimeout(function() {
        that.isHidden = true
      }, 2500)
    },
    mouseenter: function() {
      clearTimeout(this.hideTimeout)
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
    }
  },
  events: {
    'panel-hide': function(flag) {
      // panel ready to show, request engines searching
      if (!flag) {
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
    styleObj: function() {
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
        result.Left = iconLeft + 24 + 10 + 'px!important'
      } else {
        result.right = ww - (iconLeft - 10) + 'px!important'
      }
      if (y < wh / 2) {
        result.top = iconTop + 'px!important'
      } else {
        result.bottom = 50 + 'px!important'
      }

      return result
    }
  }
}