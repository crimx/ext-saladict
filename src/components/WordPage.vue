<template>
<div class="container-fluid">
  <div class="word-page-nav">
    <h1 class="word-page-header">{{ i18n(`${id}_title`) }}</h1>
    <div class="btn-group">
      <label class="btn btn-default" :class="{active: isOnlyEng}">{{ i18n('wordpage_only_english') }}
        <input type="checkbox" v-model="isOnlyEng" class="hide" autocomplete="off">
      </label>
      <button type="button" class="btn btn-default" @click="showPlainTextPanel">{{ i18n('wordpage_plaintext') }}</button>
      <button type="button" class="btn btn-default" @click="saveAsFile">{{ i18n('wordpage_savefile') }}</button>
      <button type="button" class="btn btn-danger" @click="clearRecords">{{ i18n('wordpage_clear') }}</button>
    </div>
  </div>
  <div class="row">
    <div class="right-aside">
      <p class="text-center right-aside-row">{{ i18n(`${id}_wordcount`).replace('%s', wordCount) }}</p>
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
    <div class="col-sm-7 wordpage-list-wrap" v-if="records.length > 0">
      <div class="row" v-for="(record, iRecord) in records" :key="record.date">
        <div class="col-sm-6 text-right">
          <p class="wordpage-item-title">{{ record.localeDate }}</p>
        </div>
        <div class="col-sm-6">
          <table class="table table-hover word-table" @click="handleListClick">
            <tbody>
              <tr v-for="(word, iWord) in record.data" :key="word">
                <td class="text-center">{{ word }}
                  <button type="button" class="close" @click="removeWord(record.setId, record.date, word, iRecord, iWord)">×</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      <div class="row" v-if="pageCount > 0">
        <nav class="col-sm-6 col-sm-offset-6 text-center">
          <ul class="pagination">
            <li
              :class="{disabled: pageIndex === 0}"
              @click.prevent="pageIndex !== 0 && getPage(pageIndex - 1)"
            ><a href="#"><span>&laquo;</span></a></li>
            <li
              v-for="p in pageNumbers"
              :class="{active: p === pageIndex}"
              @click.prevent="p !== pageIndex && getPage(p)"
            ><a href="#">{{ p + 1 }}</a></li>
            <li
              :class="{disabled: pageIndex === pageCount - 1}"
              @click.prevent="pageIndex !== pageCount - 1 && getPage(pageIndex + 1)"
            ><a href="#"><span>&raquo;</span></a></li>
          </ul>
        </nav>
      </div>
    </div>
    <div v-if="isReady && records.length <= 0" class="col-sm-7 wordpage-list-wrap no-record">
      <h1 class="no-wordpage-title">{{ i18n(`${id}_no_result`) }}</h1>
    </div>
  </div>

  <!--Plain text-->
  <transition name="fade">
    <div class="modal show text-left" v-if="isShowPlainTextPanel">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <button type="button" class="close" @click="isShowPlainTextPanel = false">&times;</button>
            <h4 class="modal-title">{{ i18n('wordpage_plain_modal_title') }}</h4>
          </div>
          <div class="modal-body">
            <textarea v-focus class="form-control plain-text-modal">{{ plainText }}</textarea>
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
import AlertModal from 'src/components/AlertModal'
import moment from 'moment'

let lang = chrome.i18n.getUILanguage().toLowerCase()
if (!/^(en|zh-cn|zh-tw|zh-hk)$/.test(lang)) {
  lang = 'en'
}
moment.locale(lang)

export default {
  props: {
    id: {type: String, require: true},
    config: {type: Object, require: true},
    downloadFileName: {type: String, require: true},
    i18n: {type: Function, required: true},
    recordManager: {type: Object, require: true}
  },
  data () {
    return {
      rawRecords: [],
      wordCount: 0,

      text: '',
      frameSource: chrome.runtime.getURL('panel.html'),

      pageIndex: 0,
      pageCount: 0,
      isMergeFirstTwo: false, // if the first page is too short, merge with the second one

      isOnlyEng: false,

      isReady: false, // prevent blink

      plainText: '',
      isShowPlainTextPanel: false,
      isPopUp: false,
      popupMessage: ''
    }
  },
  computed: {
    records () {
      return this.isOnlyEng
        ? this.rawRecords
          .map(record => ({
            // ...folder
            date: record.date,
            localeDate: record.localeDate,
            data: record.data
              .map(word => word
                .replace(/[^- .a-z]/ig, ' ') // replace anything other than " ", "-", "." and letters
                .replace(/(^[- .]+)|([- ]+$)/, '') // no leading " ", "-", "." and tailing " ", "-"
                .replace(/ +/g, ' ') // shrink multiple spaces into one
                .replace(/^[- .]+$/, '') // if only " ", "-" or "." left, clear them
              )
              .filter(Boolean)
          }))
          .filter(record => record.data.length > 0)
        : this.rawRecords
    },
    pageNumbers () {
      if (!this.pageCount) { return [] }
      if (this.pageCount < 5) {
        // near left end
        return Array.from(Array(this.pageCount)).map((x, i) => i)
      }
      if (this.pageCount - this.pageIndex < 5) {
        // near right end
        return Array.from(Array(5)).map((x, i) => this.pageCount - 5 + i)
      }
      return Array.from(Array(5)).map((x, i) => this.pageIndex + i)
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
    getPage (index) {
      if (typeof index === 'number') {
        this.pageIndex = index
      } else {
        this.pageIndex += 1
      }

      let requestIndex = this.pageIndex
      if (requestIndex === 0) {
        this.isMergeFirstTwo = false
      } else if (this.isMergeFirstTwo) {
        requestIndex = this.pageIndex + 1
      }
      return this.recordManager.getRecordSet(requestIndex)
        .then(({recordSet, pageCount}) => {
          if (!recordSet) {
            this.rawRecords = []
            return
          }
          const rawRecords = recordSet.data
          rawRecords.forEach(record => {
            record.setId = recordSet.id
            record.localeDate = moment(record.date, 'MMDDYYYY').format('dddd LL')
          })
          if (requestIndex === 0 && recordSet.wordCount < 50 && pageCount >= 2) {
            this.isMergeFirstTwo = true
            // merge with the second set
            this.recordManager.getRecordSet(requestIndex + 1)
              .then(({recordSet, pageCount}) => {
                if (!recordSet) { return }
                recordSet.data.forEach(record => {
                  record.setId = recordSet.id
                  record.localeDate = moment(record.date, 'MMDDYYYY').format('dddd LL')
                })
                this.rawRecords = rawRecords.concat(recordSet.data)
                this.pageCount = pageCount - 1
              })
          } else {
            this.rawRecords = rawRecords
            this.pageCount = this.isMergeFirstTwo ? pageCount - 1 : pageCount
          }
        })
    },
    getWordCount () {
      this.recordManager.getWordCount()
        .then(wordCount => {
          this.wordCount = wordCount
        })
    },
    getPlainText () {
      return this.recordManager.getAllWords()
        .then(records => records.join('\n'))
    },
    getPlainTextWin () {
      return this.recordManager.getAllWords()
        .then(records => records.join('\r\n'))
    },
    showPlainTextPanel () {
      this.plainText = ''
      this.getPlainText()
        .then(text => {
          this.plainText = text
          this.isShowPlainTextPanel = true
        })
    },
    saveAsFile () {
      const a = document.createElement('a')
      chrome.runtime.getPlatformInfo(({os}) => {
        (os === 'win' ? this.getPlainTextWin() : this.getPlainText())
          .then(text => {
            const file = new Blob([text], {type: 'text/plain;charset=utf-8'})
            a.href = URL.createObjectURL(file)
            a.download = this.downloadFileName
            a.click()
          })
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
          this.popup(chrome.i18n.getMessage('wordpage_copy_success'), 'alert-success')
        } else {
          this.popup(chrome.i18n.getMessage('wordpage_copu_failed'), 'alert-danger')
        }
      })
    },
    clearRecords () {
      this.$refs.alert.$emit('show', {
        title: chrome.i18n.getMessage(`${this.id}_clear_modal_title`),
        content: chrome.i18n.getMessage(`${this.id}_clear_modal_content`),
        onConfirm: () => {
          this.recordManager.clearRecords()
            .then(() => this.getPage(0))
            .then(() => this.popup(chrome.i18n.getMessage('wordpage_clear_success'), 'alert-success'))
        }
      })
    },
    removeWord (setId, recordDate, word, iRecord, iWord) {
      this.recordManager.removeWord(setId, recordDate, word)
        .then(() => {
          this.rawRecords[iRecord].data.splice(iWord, 1)
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
            message.self.send({msg: 'SEARCH_TEXT', text})
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
    this.getWordCount()
    this.getPage(0)
      .then(() => {
        this.isReady = true
        this.recordManager.listenRecord(() => {
          this.getPage(0)
          this.getWordCount()
        })
      })
  },
  components: {
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
$wordpage-nav-height: 50px;

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
@import "~bootstrap-sass/assets/stylesheets/bootstrap/pagination";
@import "~bootstrap-sass/assets/stylesheets/bootstrap/close";
@import "~bootstrap-sass/assets/stylesheets/bootstrap/alerts";
@import "~bootstrap-sass/assets/stylesheets/bootstrap/button-groups";

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
.word-page-nav {
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: fixed;
  z-index: $zindex-navbar;
  top: 0;
  left: 0;
  right: 0;
  height: $wordpage-nav-height;
  padding: 0 10%;
  border-bottom: 1px #ddd solid;
  background-image: linear-gradient(white, white 30%, rgba(255, 255, 255, 0.82));
}

.word-page-header {
  font-size: 1.4em;
  margin: 10px 0;
}

.wordpage-list-wrap {
  padding-top: $wordpage-nav-height;
}

.wordpage-list {
  overflow-x: hidden;
}

.wordpage-item-title {
  padding-top: 5px;
}

.no-record {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
}

.no-wordpage-title {
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
  padding: $wordpage-nav-height 15px 0;
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

  .close {
    opacity: 0;
  }

  tr:hover .close {
    opacity: 0.2;
  }
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
