var Vue = require('vue')
var AraleQrcode = require('arale-qrcode')
var utils = require('../utils')

new Vue({
  el: 'body',
  data: {
    title: chrome.i18n.getMessage('extension_short_name'),
    opts: {
      appActive: {
        title: chrome.i18n.getMessage('opt_app_active_title'),
        value: true
      },
      mode: {
        iconTitle: chrome.i18n.getMessage('opt_icon_mode_title'),
        directTitle: chrome.i18n.getMessage('opt_direct_mode_title'),
        ctrlTitle: chrome.i18n.getMessage('opt_ctrl_mode_title'),
        description: chrome.i18n.getMessage('opt_mode_description'),
        value: 'icon'
      },
      tripleCtrl: {
        title: chrome.i18n.getMessage('opt_triple_ctrl_title'),
        description: chrome.i18n.getMessage('opt_triple_ctrl_description'),
        value: true
      },
      chineseMode: {
        title: chrome.i18n.getMessage('opt_chinese_mode_title'),
        description: chrome.i18n.getMessage('opt_language_mode_description'),
        value: true
      },
      englishMode: {
        title: chrome.i18n.getMessage('opt_english_mode_title'),
        description: chrome.i18n.getMessage('opt_language_mode_description'),
        value: true
      }
    },
    qrcode: {
      title: '',
      isShow: false
    }
  },
  methods: {
    upload: function() {
      var opts = this.opts
      utils.sendMessage({
        msg: 'save',
        // copies the value of every opt, reduces to a object
        items: Object.keys(opts).reduce(function(pre, cur) {
          pre[cur] = opts[cur].value
          return pre
        }, {})
      }).then(function(data) {
        console.log(data)
      })
    },
    setConfig: function(data) {
      Object.keys(data).forEach(function(k) {
        if (this.opts.hasOwnProperty(k)) {
          this.opts[k].value = data[k]
        }
      }, this)
    },
    showQrcode: function() {
      var that = this
      clearTimeout(this.showQrcodeTimeout)
      this.showQrcodeTimeout = setTimeout(function() {
        that.qrcode.isShow = true
      }, 1000)
    },
    hideQrcode: function() {
      clearTimeout(this.showQrcodeTimeout)
      this.qrcode.isShow = false
    }
  },
  created: function() {
    var setConfig = this.setConfig
    // get user config
    utils
      .sendMessage({
        msg:'grab',
        items: Object.keys(this.opts)
      })
      .then(function(response) {
        if (response.msg === 'success') {
          setConfig(response.data)
        }
      })
  },
  compiled: function() {
    var that = this
    chrome.tabs.getSelected(null, function(tab) {
      that.qrcode.title = tab.title

      that.$els.qrcode.appendChild(new AraleQrcode({
        render: 'canvas',
        text: tab.url,
        size: 200,
        background: '#ffffff',
        foreground: '#000000'
      }))
    })

    // wechat qrcode
    that.$els.wechatQrcode.appendChild(new AraleQrcode({
      render: 'canvas',
      text: 'https://wx.tenpay.com/f2f?t=AQAAAIHebVnYzZ079RQRBsX%2F5To%3D',
      size: 120,
      background: '#ffffff',
      foreground: '#000000',
      image: '../images/wechat.png'
    }))
  }
})
