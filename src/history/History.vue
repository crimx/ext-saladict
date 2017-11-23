<template>
<div class="container-fluid">
  <div class="history-page-nav">
    <h1 class="history-page-header">{{ i18n('history_title') }}</h1>
    <div class="btn-group">
      <label class="btn btn-default" :class="{active: isOnlyEng}">{{ i18n('history_only_english') }}
        <input type="checkbox" v-model="isOnlyEng" class="hide" autocomplete="off">
      </label>
      <button type="button" class="btn btn-default" @click="isShowPlainTextPanel = true">{{ i18n('history_plaintext') }}</button>
      <button type="button" class="btn btn-default" @click="saveAsFile">{{ i18n('history_savefile') }}</button>
      <button type="button" class="btn btn-danger" @click="clearHistory">{{ i18n('history_clear') }}</button>
    </div>
  </div>
  <div class="row">
    <div class="right-aside">
      <p class="text-center right-aside-row">{{ i18n('history_wordcount').replace('%s', wordCount) }}</p>
      <div class="dict-panel-wrap">
        <transition appear name="fadeup">
          <div class="dict-panel">
            <iframe class="saladict-frame"
              name="saladict-frame"
              frameBorder="0"
              :src="frameSource"
              :style="{height: panelHeight + 'px'}"
            ></iframe>
          </div>
        </transition>
      </div>
    </div>
    <div class="col-sm-7 history-list-wrap"
      v-if="historyFolders.length > 0"
      @click="handleListClick"
    >
      <virtual-scroller
        page-mode
        :itemHeight="null"
        :items="historyFolders"
        :renderers="renderers"
        type-field="type"
        key-field="date"
      />
    </div>
    <div v-if="isReady && historyFolders.length <= 0" class="col-sm-7 history-list-wrap no-history">
      <h1 class="no-history-title">{{ i18n('history_no_result') }}</h1>
    </div>
  </div>

  <!--Plain text-->
  <transition name="fade">
    <div class="modal show text-left" v-if="isShowPlainTextPanel">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <button type="button" class="close" @click="isShowPlainTextPanel = false">&times;</button>
            <h4 class="modal-title">{{ i18n('history_plain_modal_title') }}</h4>
          </div>
          <div class="modal-body">
            <textarea v-focus class="form-control plain-text-modal">{{ getPlainText() }}</textarea>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-default" @click="isShowPlainTextPanel = false">{{ i18n('cancel') }}</button>
            <button type="button" class="btn btn-primary" @click="copyToClipBoard">{{ i18n('copy') }}</button>
          </div>
        </div>
      </div>
    </div>
  </transition> <!--modal-->

  <!--Alert Modal-->
  <alert-modal ref="alert" />

  <transition name="popup">
    <div class="popup-msg" :class="[popupType]" v-if="isPopUp">
      {{ popupMessage }}
    </div>
  </transition>
</div>
</template>

<script>
import {message} from 'src/helpers/chrome-api'
import searchHistory from 'src/helpers/search-history'
import HistoryItem from './HistoryItem'
import AlertModal from 'src/components/AlertModal'
import { VirtualScroller } from 'vue-virtual-scroller'
import moment from 'moment'

let lang = chrome.i18n.getUILanguage().toLowerCase()
if (!/^(en|zh-cn|zh-tw|zh-hk)$/.test(lang)) {
  lang = 'en'
}
moment.locale(lang)

export default {
  props: ['pageId', 'config', 'i18n'],
  data () {
    return {
      rawHistoryFolders: [],

      renderers: {
        folder: HistoryItem
      },

      text: '',
      frameSource: chrome.runtime.getURL('panel.html'),

      isOnlyEng: false,

      isReady: false, // prevent blink

      isShowPlainTextPanel: false,
      isPopUp: false,
      popupMessage: ''
    }
  },
  computed: {
    historyFolders () {
      if (this.isOnlyEng) {
        return this.rawHistoryFolders
          .map(folder => {
            return {
              // ...folder
              date: folder.date,
              localeDate: folder.localeDate,
              height: folder.height,
              type: folder.type,
              data: folder.data
                .map(word => {
                  return word
                    .replace(/[^- .a-z]/ig, ' ') // replace anything other than " ", "-", "." and letters
                    .replace(/(^[- .]+)|([- ]+$)/, '') // no leading " ", "-", "." and tailing " ", "-"
                    .replace(/ +/g, ' ') // shrink multiple spaces into one
                    .replace(/^[- .]+$/, '') // if only " ", "-" or "." left, clear them
                })
                .filter(Boolean)
            }
          })
          .filter(folder => folder.data.length > 0)
      } else {
        return this.rawHistoryFolders
      }
    },
    wordCount () {
      let count = 0
      const folders = this.historyFolders
      for (let i = 0; i < folders.length; i += 1) {
        count += folders[i].data.length
      }
      return count
    },
    panelHeight () {
      const allDicts = this.config.dicts.all
      // header + each dictionary
      const preferredHeight = 30 + this.config.dicts.selected.reduce((sum, id) => {
        let preferredHeight = 0
        if (allDicts[id] && allDicts[id].preferredHeight) {
          preferredHeight = allDicts[id].preferredHeight + 20
        }
        return sum + preferredHeight
      }, 0)
      const maxHeight = window.innerHeight * 0.78
      return preferredHeight > maxHeight ? maxHeight : preferredHeight
    }
  },
  methods: {
    fetchAllHistory () {
      return searchHistory.getAll().then(folders => {
        for (let i = 0; i < folders.length; i += 1) {
          const folder = folders[i]
          folder.localeDate = moment(folder.date, 'MMDDYYYY').format('dddd LL')
          folder.height = folder.data.length * 36
          folder.type = 'folder'
        }
        this.rawHistoryFolders = folders
      })
    },
    getPlainText () {
      if (this.plainText) { return this.plainText }
      this.plainText = this.historyFolders.map(folder => folder.data.join('\n')).join('\n')
      return this.plainText
    },
    getPlainTextWin () {
      if (this.plainTextWin) { return this.plainTextWin }
      this.plainTextWin = this.historyFolders.map(folder => folder.data.join('\r\n')).join('\r\n')
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
          this.popup(chrome.i18n.getMessage('history_copy_success'), 'alert-success')
        } else {
          this.popup(chrome.i18n.getMessage('history_copu_failed'), 'alert-danger')
        }
      })
    },
    clearHistory () {
      this.$refs.alert.$emit('show', {
        title: chrome.i18n.getMessage('history_clear_modal_title'),
        content: chrome.i18n.getMessage('history_clear_modal_content'),
        onConfirm: () => {
          searchHistory.clear()
            .then(this.fetchAllHistory)
            .then(() => this.popup(chrome.i18n.getMessage('history_clear_success'), 'alert-success'))
        }
      })
    },
    handleListClick () {
      if (window.getSelection().toString().trim()) {
        // if user click on a selected text,
        // getSelection would return the text before it disappears
        // delay to wait for selection get cleared
        setTimeout(() => {
          const text = window.getSelection().toString().trim()
          if (text) {
            message.send({msg: 'SEARCH_TEXT_SELF', text, page: this.pageId})
          }
        }, 0)
      }
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
    this.fetchAllHistory()
      .then(() => {
        this.isReady = true
        searchHistory.listen(() => {
          this.fetchAllHistory()
        })
      })
  },
  components: {
    VirtualScroller,
    AlertModal
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
@import "~bootstrap-sass/assets/stylesheets/bootstrap/button-groups";

// Components w/ JavaScript
@import "~bootstrap-sass/assets/stylesheets/bootstrap/modals";

// fancy checkbox
.form-group input[type="checkbox"] {
    display: none;
}
.form-group input[type="checkbox"] + .btn-group > label span {
    width: 20px;
}
.form-group input[type="checkbox"] + .btn-group > label span:first-child {
    display: none;
}
.form-group input[type="checkbox"] + .btn-group > label span:last-child {
    display: inline-block;
}
.form-group input[type="checkbox"]:checked + .btn-group > label span:first-child {
    display: inline-block;
}
.form-group input[type="checkbox"]:checked + .btn-group > label span:last-child {
    display: none;
}

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
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: fixed;
  z-index: $zindex-navbar;
  top: 0;
  left: 0;
  right: 0;
  height: $history-nav-height;
  padding: 0 10%;
  border-bottom: 1px #ddd solid;
  background-image: linear-gradient(white, white 30%, rgba(255, 255, 255, 0.82));
}

.history-page-header {
  font-size: 1.4em;
  margin: 10px 0;
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

.no-history {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
}

.no-history-title {
  font-size: 1.5em;
}

.right-aside {
  position: fixed;
  top: 0;
  right: 0;
  display: flex;
  flex-direction: column;
  width: percentage(5/12);
  height: 100%;
  padding: $history-nav-height 15px 0;
}

.right-aside-row {
  margin-top: 15px;
}

.dict-panel-wrap {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
}

.dict-panel {
  width: 400px;
}

.saladict-frame {
  width: 400px;
  overflow: hidden;
  border: 0 none;
  box-shadow: rgba(0, 0, 0, 0.8) 0px 4px 23px -6px;
  transition: all 1s;
}

.word-table {
  margin-bottom: 0;
}

.word-td {
  padding-left: 15px 0 5px;
}

textarea.plain-text-modal {
  height: 55vh;
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
// Utility classes
@import "~bootstrap-sass/assets/stylesheets/bootstrap/utilities";

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

.fadeup-enter-active {
  transition: all 1.5s 1s;
}
.fadeup-enter {
  opacity: 0;
  transform: translate3d(0px, 40px, 0px);
}
</style>
