<template>
<div class="panel-container" :class="{'no-user-select': isDragging}">
  <header class="panel-header">
    <input type="text" class="search-input"
      ref="searchbox"
      v-model.trim="text"
      @keyup.enter="handleSearchText()"
    >
    <svg class="icon-search" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 52.966 52.966"
      @click="handleSearchText()"
    >
      <path d="M51.704 51.273L36.844 35.82c3.79-3.8 6.14-9.04 6.14-14.82 0-11.58-9.42-21-21-21s-21 9.42-21 21 9.42 21 21 21c5.082 0 9.747-1.817 13.383-4.832l14.895 15.49c.196.206.458.308.72.308.25 0 .5-.093.694-.28.398-.382.41-1.015.028-1.413zM21.984 40c-10.478 0-19-8.523-19-19s8.522-19 19-19 19 8.523 19 19-8.525 19-19 19z"/>
    </svg>
    <div class="dragarea" @mousedown.stop="handleDragStart"></div>
    <svg class="icon-options" @click="openOptionsPage" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 612 612">
      <path d="M0 97.92v24.48h612V97.92H0zm0 220.32h612v-24.48H0v24.48zm0 195.84h612V489.6H0v24.48z"/>
    </svg>
    <svg class="icon-qrcode" @mouseenter="showQRcode" @mouseleave="currentTabUrl = ''"xmlns="http://www.w3.org/2000/svg" viewBox="0 0 612 612">
      <path d="M0 225v25h250v-25H0zM0 25h250V0H0v25z"/>
      <path d="M0 250h25V0H0v250zm225 0h25V0h-25v250zM87.5 162.5h75v-75h-75v75zM362 587v25h80v-25h-80zm0-200h80v-25h-80v25z"/>
      <path d="M362 612h25V362h-25v250zm190-250v25h60v-25h-60zm-77.5 87.5v25h50v-25h-50z"/>
      <path d="M432 497.958v-25h-70v25h70zM474.5 387h50v-25h-50v25zM362 225v25h250v-25H362zm0-200h250V0H362v25z"/>
      <path d="M362 250h25V0h-25v250zm225 0h25V0h-25v250zm-137.5-87.5h75v-75h-75v75zM0 587v25h250v-25H0zm0-200h250v-25H0v25z"/>
      <path d="M0 612h25V362H0v250zm225 0h25V362h-25v250zM87.5 524.5h75v-75h-75v75zM587 612h25V441h-25v171zM474.5 499.5v25h50v-25h-50z"/>
      <path d="M474.5 449.5v75h25v-75h-25zM562 587v25h50v-25h-50z"/>
    </svg>
    <svg class="icon-share" @click="openShareimgPage" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 58.999 58.999">
      <path d="M19.48 12.02c.255 0 .51-.1.706-.294L28.5 3.413V39c0 .552.446 1 1 1s1-.448 1-1V3.412l8.27 8.272c.392.39 1.024.39 1.415 0s.39-1.023 0-1.414L30.207.294C30.115.2 30.004.127 29.88.076c-.244-.1-.52-.1-.764 0-.123.05-.234.125-.326.217l-10.018 10.02c-.39.39-.39 1.022 0 1.413.195.196.45.293.707.293z"/>
      <path d="M36.5 16c-.554 0-1 .446-1 1s.446 1 1 1h13v39h-40V18h13c.552 0 1-.448 1-1s-.448-1-1-1h-15v43h44V16h-15z"/>
    </svg>
    <svg class="icon-pin" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 53.011 53.011"
      :class="{'icon-pin--pinned': isPinned}"
      @click="pinPanel"
    >
      <path d="M52.963 21.297c-.068-.33-.297-.603-.61-.727-8.573-3.416-16.172-.665-18.36.288L19.113 8.2C19.634 3.632 17.17.508 17.06.372c-.18-.22-.442-.356-.725-.372-.282-.006-.56.09-.76.292L.32 15.546c-.202.2-.308.48-.29.765.015.285.152.55.375.727 2.775 2.202 6.35 2.167 7.726 2.055l12.722 14.953c-.868 2.23-3.52 10.27-.307 18.337.124.313.397.54.727.61.067.013.135.02.202.02.263 0 .518-.104.707-.293l14.57-14.57 13.57 13.57c.196.194.452.292.708.292s.512-.098.707-.293c.39-.392.39-1.024 0-1.415l-13.57-13.57 14.527-14.528c.237-.238.34-.58.27-.91zm-17.65 15.458L21.89 50.18c-2.437-8.005.993-15.827 1.03-15.91.158-.352.1-.764-.15-1.058L9.31 17.39c-.19-.225-.473-.352-.764-.352-.05 0-.103.004-.154.013-.036.007-3.173.473-5.794-.954l13.5-13.5c.604 1.156 1.39 3.26.964 5.848-.058.346.07.697.338.924l15.785 13.43c.31.262.748.31 1.105.128.077-.04 7.378-3.695 15.87-1.017L35.313 36.754z"/>
    </svg>
    <svg class="icon-close" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 31.112 31.112"
      @click="closePanel"
    >
      <path d="M31.112 1.414L29.698 0 15.556 14.142 1.414 0 0 1.414l14.142 14.142L0 29.698l1.414 1.414L15.556 16.97l14.142 14.142 1.414-1.414L16.97 15.556"/>
    </svg>
  </header>
  <div class="dicts" @click="handleDictsPanelClick">
    <section class="dict-item" v-for="id in config.dicts.selected">
      <header class="dict-item-header">
        <img class="dict-item-logo" :src="dicts[id].favicon" @click="handleDictPage(id)">
        <h1 class="dict-item-name" @click="handleDictPage(id)">{{ dicts[id].name }}</h1>
        <div class="loader-wrap">
          <transition name="fade">
            <svg viewBox="0 0 120 10" xmlns="http://www.w3.org/2000/svg" width="120" height="10"
              v-if="dicts[id].isSearching"
              class="loader"
            >
              <circle class="loader-item" cx="5" cy="5" r="5"/>
              <circle class="loader-item" cx="5" cy="5" r="5" style="animation-delay: -0.4s"/>
              <circle class="loader-item" cx="5" cy="5" r="5" style="animation-delay: -0.8s"/>
              <circle class="loader-item" cx="5" cy="5" r="5" style="animation-delay: -1.2s"/>
              <circle class="loader-item" cx="5" cy="5" r="5" style="animation-delay: -1.6s"/>
            </svg>
          </transition>
        </div>
        <svg class="fold-arrow" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 59.414 59.414"
          :class="{'fold-arrow--unfold': dicts[id].isUnfolded}"
          @click="handleUnfold(id)"
        >
          <path d="M43.854 59.414L14.146 29.707 43.854 0l1.414 1.414-28.293 28.293L45.268 58"/>
        </svg>
      </header>
      <div ref="dict" class="dict-item-body"
        :class="{'dict-item-body--show': dicts[id].height > 0}"
        :style="{height: dicts[id].height + 'px'}"
      >
        <component :is="id" :result="dicts[id].result"></component>
        <transition name="fade">
          <div class="semi-unfold-mask"
            v-if="dicts[id].height > 0 && dicts[id].height !== dicts[id].offsetHeight"
            @click="dicts[id].height = dicts[id].offsetHeight"
          >
            <svg class="semi-unfold-mask-arrow" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 59.414 59.414">
              <path d="M58 14.146L29.707 42.44 1.414 14.145 0 15.56 29.707 45.27 59.414 15.56"/>
            </svg>
          </div>
        </transition>
      </div>
    </section>
  </div>
  <transition name="fade">
    <div class="qrcode-panel" v-if="currentTabUrl">
      <qrcode :value="currentTabUrl" :size="250"></qrcode>
      <p class="qrcode-panel-title">{{ i18n('popup_tab_title') || 'Tab Title' }}</p>
    </div>
  </transition>
</div>
</template>

<script>
import defaultConfig from 'src/app-config'
import {storage, message} from 'src/helpers/chrome-api'

// Dynamically & asynchronously loads components
const components = {Qrcode: () => Promise.resolve(require('vue-qrious'))}
const compReq = require.context('./components/dicts', true, /\.vue$/i)
const idChecker = /\/(\S+)\.vue$/i
const allDicts = defaultConfig.dicts.all
compReq.keys().forEach(path => {
  let id = (idChecker.exec(path) || ['', ''])[1].toLowerCase()
  if (id && allDicts[id]) {
    components[id] = () => Promise.resolve(compReq(path))
  }
})

export default {
  name: 'dictionary-panel',
  data () {
    let dicts = {}

    Object.keys(defaultConfig.dicts.all).forEach(id => {
      dicts[id] = {
        result: null,
        height: 0,
        offsetHeight: 0,
        favicon: chrome.runtime.getURL('assets/dicts/' + allDicts[id].favicon),
        name: chrome.i18n.getMessage('dict_' + id) || id,
        isUnfolded: false,
        isSearching: false
      }
    })

    return {
      config: defaultConfig,

      dicts,

      text: '',

      isDragging: false,

      currentTabUrl: '',

      isPinned: false
    }
  },
  methods: {
    i18n (key) {
      return chrome.i18n.getMessage(key) || key
    },
    seachText (selectedDicts) {
      if (!Array.isArray(selectedDicts)) {
        selectedDicts = [selectedDicts]
      }
      let text = this.text.trim()
      this.text = text
      let dicts = this.dicts

      selectedDicts.forEach((id) => {
        let dict = dicts[id]
        this.foldDict(id)
        dict.isSearching = true
        dict.result = null // clear the results

        let timer = new Promise((resolve, reject) => {
          setTimeout(resolve, 10000)
        })

        Promise.race([timer, message.send({msg: 'FETCH_DICT_RESULT', text, dict: id})])
          .then(response => {
            dict.isSearching = false

            if (!response || response.error) {
              dict.isUnfolded = true
              return
            }

            dict.result = response.result

            this.$nextTick(() => {
              let i = this.config.dicts.selected.indexOf(id)
              dict.offsetHeight = this.$refs.dict[i].firstChild.offsetHeight
              this.unfoldDict(id, i)
            })
          })
      })
    },
    closePanel () {
      message.send({msg: 'CLOSE_PANEL_SELF'})
    },
    pinPanel () {
      this.isPinned = !this.isPinned
      message.send({msg: 'PIN_PANEL_SELF', flag: this.isPinned})
    },
    showQRcode () {
      chrome.tabs.query({active: true, currentWindow: true}, tabs => {
        if (tabs.length > 0) {
          this.currentTabUrl = tabs[0].url
        }
      })
    },
    openOptionsPage () {
      message.send({msg: 'CREATE_TAB', url: chrome.runtime.getURL('options.html')})
    },
    openShareimgPage () {
      var dicts = this.config.dicts.selected.map(id => {
        var result = this.dicts[id].result
        if (result && this.dicts[id].isUnfolded) {
          return {id, result}
        }
        return null
      })
      .filter(d => d)

      storage.local.set({paneldata: {text: this.text, dicts}}, () => {
        message.send({msg: 'CREATE_TAB', url: chrome.runtime.getURL('shareimg.html')})
      })
    },
    unfoldDict (id) {
      let dict = this.dicts[id]
      dict.isUnfolded = true

      if (!dict.result) {
        this.seachText(id)
        return
      }

      let preferredHeight = this.config.dicts.all[id].preferredHeight
      dict.height = dict.offsetHeight < preferredHeight ? dict.offsetHeight : preferredHeight
    },
    foldDict (id) {
      let dict = this.dicts[id]
      dict.height = 0
      dict.isUnfolded = false
    },
    handleUnfold (id) {
      let dict = this.dicts[id]
      dict.isUnfolded ? this.foldDict(id) : this.unfoldDict(id)
    },
    handleDictPage (id) {
      message.send({msg: 'CREATE_TAB', url: this.config.dicts.all[id].page.replace('%s', this.text)})
    },
    handleDragStart (evt) {
      this.isDragging = true

      window.parent.postMessage({
        msg: 'SALADICT_DRAG_START',
        mouseX: evt.clientX,
        mouseY: evt.clientY
      }, '*')

      document.addEventListener('mouseup', this.handleDragEnd, true)
      document.addEventListener('mousemove', this.handleMousemove, true)
    },
    handleMousemove (evt) {
      window.parent.postMessage({
        msg: 'SALADICT_DRAG_MOUSEMOVE',
        mouseX: evt.clientX,
        mouseY: evt.clientY
      }, '*')
    },
    handleDragEnd () {
      this.isDragging = false

      window.parent.postMessage({
        msg: 'SALADICT_DRAG_END'
      }, '*')

      document.removeEventListener('mouseup', this.handleDragEnd, true)
      document.removeEventListener('mousemove', this.handleMousemove, true)
    },
    handleStorageChange (changes) {
      this.config = changes.config.newValue
    },
    handleDictsPanelClick (evt) {
      for (let target = evt.target; target !== evt.currentTarget; target = target.parentNode) {
        if (target.href) {
          chrome.runtime.sendMessage({msg: 'CREATE_TAB', url: target.href})
          evt.preventDefault()
          return
        }
      }
    },
    handleSearchText (data) {
      if (data && data.text) {
        this.text = data.text
      }
      this.config.dicts.selected.forEach((id) => {
        this.foldDict(id)
        this.dicts[id].result = null // clear all results
      })
      this.seachText(this.defaultUnfoldList)
    },
    handleDestroy (__, ___, sendResponse) {
      storage.off(this.handleStorageChange)
      message.off(this.handleSearchText)
      sendResponse(true)
      message.off(this.handleDestroy)
    }
  },
  created () {
    // get the lastest config
    storage.sync.get('config').then(result => {
      if (result.config) {
        this.config = result.config
      }
    })
    storage.listen('config', this.handleStorageChange)

    message.on('SEARCH_TEXT', this.handleSearchText)
    message.on('DESTROY_PANEL', this.handleDestroy)

    message.send({msg: 'PANEL_READY_SELF'}, response => {
      if (response && response.ctrl) {
        this.$refs.searchbox.focus()
        document.execCommand('paste')
        if (this.text.length) {
          this.handleSearchText()
        }
      }
    })
  },
  computed: {
    defaultUnfoldList () {
      let allDicts = this.config.dicts.all
      return this.config.dicts.selected.filter(id => allDicts[id].defaultUnfold)
    }
  },
  components
}
</script>

<style src="normalize.css/normalize.css"></style>

<style>
/*-----------------------------------------------*\
    Global Styles
\*-----------------------------------------------*/
html {
  height: 100%;
  box-sizing: border-box;
}

*, *:before, *:after {
  box-sizing: inherit;
}

body {
  overflow: hidden;
  height: 100%;
  background-color: #fff;
  font-size: 14px;
  font-family: "Helvetica Neue", Helvetica, Arial, "Hiragino Sans GB", "Hiragino Sans GB W3", "Microsoft YaHei UI", "Microsoft YaHei", "WenQuanYi Micro Hei", sans-serif;
}
</style>

<style lang="scss" scoped>
.panel-container {
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
}

.panel-header {
  display: flex;
  align-items: center;
  position: relative;
  height: 30px;
  padding-left: 6px;
  background-color: rgb(92, 175, 158);
}

.dragarea {
  flex: 1.5;
  height: 100%;
  cursor: move;
}

.search-input {
  flex: 1;
  width: 5rem;
  padding: 0 5px;
  border: 0 none;
  outline: 0 none;
  color: #fff;
  background-color: rgba(225, 225, 225, 0.1);
  transition: flex 1s;

  &:focus {
    flex: 8;
  }
}

%icon {
  width: 30px;
  height: 30px;
  padding: 8px;
  fill: #fff;
  cursor: pointer;
}

.icon-search {
  @extend %icon;
}

.icon-qrcode {
  @extend %icon;
}

.icon-options {
  @extend %icon;
}

.icon-share {
  @extend %icon;
}

.icon-pin {
  @extend %icon;
  transition: transform 400ms;
}

.icon-close {
  @extend %icon;

  &:hover {
    animation: spin 400ms linear infinite;
  }
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.dicts {
  flex: 1;
  overflow-y: scroll;
  overflow-x: hidden;
  padding: 0 10px;
}

.dict-item {
  position: relative;
}

.dict-item-header {
  display: flex;
  align-items: center;
  border-top: 1px #ddd solid;
}

.dict-item-logo {
  align-self: flex-start;
  width: 19px;
  height: 19px;
  margin-top: -1px;
  cursor: pointer;
}

.dict-item-name {
  margin: 0;
  padding: 3px;
  font-size: 12px;
  font-weight: normal;
  color: #444;
  cursor: pointer;
}

.dict-item-body {
  visibility: hidden;
  overflow: hidden;
  margin-bottom: 10px;
  font-size: 12px;
  line-height: 1.6;
  color: #333;
  opacity: 0;
  transition: all 1s;
}

.loader-wrap {
  flex: 1;
  position: relative;
}

.loader {
  position: absolute;
  top: 50%;
  left: 0;
  transform: translateY(-50%);
}

.loader-item {
  fill: #2196f3;
  animation: dict-loader-shift 2s linear infinite;
  transform: translateZ(0);
}

@keyframes dict-loader-shift {
    0% { transform: translateX(    0); opacity: 0; fill: #ff0; }
   10% { transform: translateX( 30px); opacity: 1; }
   90% { transform: translateX( 80px); opacity: 1; }
  100% { transform: translateX(110px); opacity: 0; fill: #f00; }
}

.fold-arrow {
  fill: #000;
  width: 18px;
  height: 18px;
  margin-right: -5px;
  padding: 3px;
  transition: transform 400ms;
  cursor: pointer;
}

.semi-unfold-mask {
  position: absolute;
  bottom: 0;
  left: -10px;
  right: -10px;
  display: flex;
  justify-content: center;
  align-items: flex-end;
  height: 50%;
  max-height: 50px;
  margin: auto;
  background: linear-gradient(transparent 40%, rgba(255, 255, 255, 0.3) 60%, rgba(255, 255, 255, 0.9) 100%);
  cursor: pointer;

  &::after {
    content: '';
    position: absolute;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
    background: linear-gradient(transparent 40%, rgba(225, 225, 225, .2) 60%, rgba(225, 225, 225, .7) 100%);
    opacity: 0;
    transition: opacity 400ms;
  }

  &:hover::after {
    opacity: 1;
  }
}

.semi-unfold-mask-arrow {
  position: relative;
  z-index: 10;
  width: 15px;
  height: 15px;
  fill: #000;
}

.qrcode-panel {
  position: absolute;
  top: 40px;
  right: 40px;
  padding: 10px;
  background: #fff;
  border-radius: 10px;
  box-shadow: rgba(0, 0, 0, 0.8) 0px 4px 23px -6px;
}

.qrcode-panel-title {
  text-align: center;
  margin: 5px 0 0 0;
}

/*-----------------------------------------------*\
    States
\*-----------------------------------------------*/
.no-user-select {
  user-select: none;
}

.icon-pin--pinned {
  transform: rotate(45deg);
}

.dict-item-body--show {
  visibility: visible;
  opacity: 1;
  margin-bottom: 0;
}

.fold-arrow--unfold {
  transform: rotate(-90deg);
}

.fade-enter-active, .fade-leave-active {
  transition: opacity .5s
}
.fade-enter, .fade-leave-active {
  opacity: 0
}
</style>
