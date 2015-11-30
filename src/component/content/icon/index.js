'use strict'

module.exports = {
  el: '#saladict-icon',
  template: require('./template.html'),
  replace: true,
  data: {
    src: chrome.extension.getURL('images/icon-24.png')
  },
  methods: {
    mouseenter: function() {
      this.pageStatus.iconMouseEnter = true
    }
  },
  computed: {
    styleObj: function() {
      var x = this.pageStatus.clientX
      var y = this.pageStatus.clientY
      var ww = window.innerWidth
      //                  ________
      //                 |       |
      //                 |  LOGO | 24px
      //            40px |_______|
      //          _ _ _ _|  24px
      //        /|  30px
      // cursor//
      x = ww - x > 54 ? x + 30 : x - 30
      y = y > 40 ? y - 40 : y + 20
      return {
        top: y + 'px!important',
        left: x + 'px!important'
      }
    },
    iconShow: function() {
      var config = this.config
      var pageStatus = this.pageStatus
      var result = false

      if (config.appActive && pageStatus.userClicked) {
        pageStatus.userClicked = false
        pageStatus.panelHide = true

        if (!pageStatus.selection) {
          result = false
        } else 
        if ((config.chineseMode && !isContainChinese(pageStatus.selection)) &&
            (config.englishMode && !isContainEnglish(pageStatus.selection))) {
          result = false
        } else {
          result = true
        }
      }
      return result
    }
  }
}

function isContainChinese(text) {
  return /[\u4e00-\u9fa5]/.test(text)
}

function isContainEnglish(text) {
  return /[a-z,A-Z]/.test(text)
}