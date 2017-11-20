<template>
<div class="container-fluid">
  <div class="history-page-nav">
    <h1 class="history-page-header">i18n 搜索记录</h1>
  </div>
  <div class="row">
    <div class="right-aside">
      <div class="ctrl-panel-wrap">
        <div class="ctrl-panel">
          <div class="ctrl-panel-row">
            <button type="button" class="btn btn-default" @click="isShowPlainTextPanel = true">i18n 查看纯文本</button>
            <button type="button" class="btn btn-default" @click="saveAsFile">i18n 导出纯文本</button>
          </div>
          <div class="ctrl-panel-row">
            <button type="button" class="btn btn-danger" @click="clearHistory">i18n 清空记录</button>
          </div>
          <p class="ctrl-panel-row">i18n 共 {{ wordCount }} 条记录，本扩展会保存约 10k 条最近记录</p>
        </div>
      </div>
    </div>
    <div class="col-sm-7 history-list-wrap">
      <virtual-scroller
        v-if="historyItems.length > 0"
        page-mode
        :itemHeight="null"
        :items="historyItems"
        :renderers="renderers"
        type-field="type"
        key-field="date"
      />
    </div>
  </div>

  <!--Plain text-->
  <transition name="fade">
    <div class="modal show text-left" v-if="isShowPlainTextPanel">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <button type="button" class="close" @click="isShowPlainTextPanel = false">&times;</button>
            <h4 class="modal-title">{{ 'i18n 纯文本 - 可复制粘贴' }}</h4>
          </div>
          <div class="modal-body">
            <textarea v-focus class="form-control plain-text-modal">{{ getPlainText() }}</textarea>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-default" @click="isShowPlainTextPanel = false">i18n 关闭</button>
            <button type="button" class="btn btn-primary" @click="copyToClipBoard">i18n 复制</button>
          </div>
        </div>
      </div>
    </div>
  </transition> <!--modal-->

  <transition name="popup">
    <div class="popup-msg" :class="[popupType]" v-if="isPopUp">
      {{ popupMessage }}
    </div>
  </transition>
</div>
</template>

<script>
import { VirtualScroller } from 'vue-virtual-scroller'
import HistoryItem from './HistoryItem'
import searchHistory from 'src/background/search-history'
import moment from 'moment'
let lang = chrome.i18n.getUILanguage().toLowerCase()
if (!/^(en|zh-cn|zh-tw|zh-hk)$/.test(lang)) {
  lang = 'en'
}
moment.locale(lang)

export default {
  data () {
    return {
      wordCount: 0,
      historyItems: [],

      renderers: {
        item: HistoryItem
      },

      isShowPlainTextPanel: false,
      isPopUp: false,
      popupMessage: ''
    }
  },
  methods: {
    getPlainText () {
      if (this.plainText) { return this.plainText }
      this.plainText = this.historyItems.map(item => item.words.join('\n')).join('\n')
      return this.plainText
    },
    getPlainTextWin () {
      if (this.plainTextWin) { return this.plainTextWin }
      this.plainTextWin = this.historyItems.map(item => item.words.join('\r\n')).join('\r\n')
      return this.plainTextWin
    },
    saveAsFile () {
      const a = document.createElement('a')
      chrome.runtime.getPlatformInfo(({os}) => {
        const text = os === 'win' ? this.getPlainTextWin() : this.getPlainText()
        const file = new Blob([text], {type: 'text/plain;charset=utf-8'})
        a.href = URL.createObjectURL(file)
        a.download = 'search-history.txt'
        a.click()
      })
    },
    copyToClipBoard () {
      chrome.permissions.request({
        permissions: ['clipboardWrite']
      }, granted => {
        var isSuccess = false
        if (granted) {
          isSuccess = document.execCommand('copy')
        }
        if (isSuccess) {
          this.popup('i18n 复制成功', 'alert-success')
        } else {
          this.popup('i18n 复制失败，请手动复制', 'alert-danger')
        }
      })
    },
    clearHistory () {
      searchHistory.clear()
    },
    popup (msg, type) {
      if (msg) {
        clearTimeout(this.popupTimeout)
        this.popupMessage = msg
        this.isPopUp = true
        this.popupType = type || 'alert-info'
      }
    }
  },
  watch: {
    isPopUp (val) {
      if (val) {
        this.popupTimeout = setTimeout(() => {
          this.isPopUp = false
        }, 2000)
      }
    }
  },
  created () {
    let wordCount = 0
    searchHistory.getAll().then(items => {
      items.forEach(item => {
        wordCount += item.words.length
        item.localeDate = moment(item.date, 'MMDDYYYY').format('dddd LL')
        item.height = item.words.length * 36
        item.type = 'item'
      })
      this.historyItems = items
      this.wordCount = wordCount
    })
  },
  components: {
    'virtual-scroller': VirtualScroller
  },
  directives: {
    focus: {
      inserted: function (el) {
        el.focus()
        el.select()
      }
    }
  }
}
</script>

<style lang="scss">
/*------------------------------------*\
   Vars
\*------------------------------------*/
$history-nav-height: 50px;

/*------------------------------------*\
   Bootstrap
\*------------------------------------*/
@import "~bootstrap-sass/assets/stylesheets/bootstrap/variables";
@import "~bootstrap-sass/assets/stylesheets/bootstrap/mixins";

// Reset and dependencies
@import "~bootstrap-sass/assets/stylesheets/bootstrap/normalize";

// Core CSS
@import "~bootstrap-sass/assets/stylesheets/bootstrap/scaffolding";
@import "~bootstrap-sass/assets/stylesheets/bootstrap/type";
@import "~bootstrap-sass/assets/stylesheets/bootstrap/grid";
@import "~bootstrap-sass/assets/stylesheets/bootstrap/tables";
@import "~bootstrap-sass/assets/stylesheets/bootstrap/forms";
@import "~bootstrap-sass/assets/stylesheets/bootstrap/buttons";

// Components
@import "~bootstrap-sass/assets/stylesheets/bootstrap/panels";
@import "~bootstrap-sass/assets/stylesheets/bootstrap/close";
@import "~bootstrap-sass/assets/stylesheets/bootstrap/alerts";

// Components w/ JavaScript
@import "~bootstrap-sass/assets/stylesheets/bootstrap/modals";

/*------------------------------------*\
   Base
\*------------------------------------*/
html {
  overflow-y: scroll;
  scroll-behavior: smooth;
}

body {
  font-size: 14px;
  font-family: "Helvetica Neue", Helvetica, Arial, "Hiragino Sans GB", "Hiragino Sans GB W3", "Microsoft YaHei UI", "Microsoft YaHei", "WenQuanYi Micro Hei", sans-serif;
}

.modal-body {
  overflow-y: auto;
  max-height: 60vh;
}

/*------------------------------------*\
   Components
\*------------------------------------*/
.history-page-nav {
  display: none;
}

.word-table {
  margin-bottom: 0;
}

.word-td {
  padding-left: 15px;
}

textarea.plain-text-modal {
  height: 55vh;
}

.ctrl-panel-row {
  margin: 15px 0;
}

.popup-msg {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: $global-zindex-popover;
  padding: 20px 10px;
  font-size: 18px;
  font-weight: bold;
  text-align: center;
  border-top: 2px dashed currentColor;
}

/*------------------------------------*\
   States
\*------------------------------------*/
@media (min-width: $screen-sm-min) {
  .history-page-nav {
    display: flex;
    align-items: center;
    position: fixed;
    z-index: $zindex-navbar;
    top: 0;
    left: 0;
    right: 0;
    height: $history-nav-height;
    border-bottom: 1px #ddd solid;
    background-image: linear-gradient(white, white 30%, rgba(255, 255, 255, 0.82));
  }

  .history-page-header {
    font-size: 1.4em;
    margin: 0 0 0 50px;
  }

  .history-list-wrap {
    padding-top: $history-nav-height;
  }

  .history-list {
    overflow-x: hidden;
  }

  .history-item-title {
    padding-top: 5px;
  }

  .right-aside {
    position: fixed;
    top: 0;
    right: 0;
    width: percentage(5/12);
    height: 100%;
    padding: $history-nav-height 15px 0;
  }

  .ctrl-panel-wrap {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100%;
  }

  .ctrl-panel {
    text-align: center;
  }
}

.show {
  display: block !important;
}

.fade-enter-active, .fade-leave-active {
  transition: opacity 500ms;
}
.fade-enter, .fade-leave-active {
  opacity: 0;
}

.popup-enter-active, .popup-leave-active {
  transition: transform 500ms;
}
.popup-enter, .popup-leave-active {
  transform: translateY(100%);
}
</style>
