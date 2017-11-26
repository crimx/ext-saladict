<template>
<div class="panel-container" :class="{'no-user-select': isDragging}">
  <header class="panel-header">
    <input type="text" class="search-input"
      ref="searchbox"
      v-model.trim="text"
      @transitionend="updateDragAreaCoord"
      @keyup.enter="handleSearchText()"
    >
    <svg class="icon-search" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 52.966 52.966"
      @click="handleSearchText()"
    >
      <path d="M51.704 51.273L36.844 35.82c3.79-3.8 6.14-9.04 6.14-14.82 0-11.58-9.42-21-21-21s-21 9.42-21 21 9.42 21 21 21c5.082 0 9.747-1.817 13.383-4.832l14.895 15.49c.196.206.458.308.72.308.25 0 .5-.093.694-.28.398-.382.41-1.015.028-1.413zM21.984 40c-10.478 0-19-8.523-19-19s8.522-19 19-19 19 8.523 19 19-8.525 19-19 19z"/>
    </svg>
    <div class="dragarea" ref="dragarea"></div>
    <svg class="icon-options" @click="openOptionsPage" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 612 612">
      <path d="M0 97.92v24.48h612V97.92H0zm0 220.32h612v-24.48H0v24.48zm0 195.84h612V489.6H0v24.48z"/>
    </svg>
    <svg class="icon-notebook" @click.left="addNewWord" @click.right.prevent="openNoteBook" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
      <path d="M448 0H85.333c-17.643 0-32 14.357-32 32v53.333H42.667C36.78 85.333 32 90.113 32 96s4.78 10.667 10.667 10.667h10.667V192H42.667C36.78 192 32 196.78 32 202.667s4.78 10.667 10.667 10.667h10.667v85.333H42.667c-5.888 0-10.667 4.78-10.667 10.667S36.78 320 42.667 320h10.667v85.333H42.667C36.78 405.333 32 410.113 32 416c0 5.888 4.78 10.667 10.667 10.667h10.667V480c0 17.643 14.357 32 32 32H448c17.643 0 32-14.357 32-32V32c0-17.643-14.357-32-32-32zm10.667 480c0 5.888-4.8 10.667-10.667 10.667H85.333c-5.867 0-10.667-4.78-10.667-10.667v-53.333h23.296C102.38 439.06 114.112 448 128 448c17.643 0 32-14.357 32-32s-14.357-32-32-32c-13.888 0-25.62 8.94-30.037 21.333H74.667V320h23.296c4.416 12.395 16.15 21.333 30.037 21.333 17.643 0 32-14.357 32-32s-14.357-32-32-32c-13.888 0-25.62 8.94-30.037 21.333H74.667v-85.333h23.296c4.416 12.395 16.15 21.333 30.037 21.333 17.643 0 32-14.357 32-32s-14.357-32-32-32c-13.888 0-25.62 8.94-30.037 21.333H74.667v-85.335h23.296C102.38 119.06 114.113 128 128 128c17.643 0 32-14.357 32-32s-14.357-32-32-32c-13.888 0-25.62 8.94-30.037 21.333H74.667V32c0-5.888 4.8-10.667 10.667-10.667H448c5.867 0 10.667 4.78 10.667 10.667v448zm-341.334-64c0-5.888 4.8-10.667 10.667-10.667s10.667 4.78 10.667 10.667c0 5.888-4.8 10.667-10.667 10.667s-10.667-4.78-10.667-10.667zm0-106.667c0-5.888 4.8-10.667 10.667-10.667s10.667 4.78 10.667 10.667S133.867 320 128 320s-10.667-4.78-10.667-10.667zm0-106.666c0-5.888 4.8-10.667 10.667-10.667s10.667 4.78 10.667 10.667-4.8 10.667-10.667 10.667-10.667-4.78-10.667-10.667zm0-106.667c0-5.888 4.8-10.667 10.667-10.667s10.667 4.78 10.667 10.667-4.8 10.667-10.667 10.667-10.667-4.78-10.667-10.667z"/>
    </svg>
    <svg class="icon-history" @click="openHistoryPage" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
      <path d="M34.688 3.315c-15.887 0-28.812 12.924-28.81 28.73-.012.25-.157 4.434 1.034 8.94l-3.88-2.262c-.965-.56-2.193-.235-2.76.727-.557.96-.233 2.195.728 2.755l9.095 5.302c.02.01.038.013.056.022.1.05.2.09.31.12.07.02.14.05.21.07.09.02.176.02.265.03.06.003.124.022.186.022.036 0 .07-.01.105-.015.034 0 .063.007.097.004.05-.003.097-.024.146-.032.097-.017.19-.038.28-.068.08-.028.157-.06.23-.095.086-.04.165-.085.24-.137.074-.046.14-.096.206-.15.07-.06.135-.125.198-.195.06-.067.11-.135.16-.207.026-.04.062-.07.086-.11.017-.03.017-.067.032-.1.03-.053.07-.1.096-.16l3.62-8.96c.417-1.03-.08-2.205-1.112-2.622-1.033-.413-2.207.083-2.624 1.115l-1.86 4.6c-1.24-4.145-1.1-8.406-1.093-8.523C9.92 18.455 21.04 7.34 34.7 7.34c13.663 0 24.78 11.116 24.78 24.78S48.357 56.9 34.694 56.9c-1.114 0-2.016.902-2.016 2.015s.9 2.02 2.012 2.02c15.89 0 28.81-12.925 28.81-28.81 0-15.89-12.923-28.814-28.81-28.814z"/>
      <path d="M33.916 36.002c.203.084.417.114.634.13.045.002.09.026.134.026.236 0 .465-.054.684-.134.06-.022.118-.054.177-.083.167-.08.32-.18.463-.3.03-.023.072-.033.103-.07L48.7 22.98c.788-.79.788-2.064 0-2.852-.787-.788-2.062-.788-2.85 0l-11.633 11.63-10.44-4.37c-1.032-.432-2.208.052-2.64 1.08-.43 1.027.056 2.208 1.08 2.638L33.907 36c.002 0 .006 0 .01.002z"/>
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
  <div ref="scrollContainer" class="dicts" @click="handleDictsPanelClick" @dblclick="handleDictsPanelDbClick">
    <section class="dict-item" v-for="id in config.dicts.selected" v-show="dicts[id].isShow">
      <header class="dict-item-header" @click="handleUnfold(id)">
        <img class="dict-item-logo" :src="dicts[id].favicon" @click.stop="handleDictPage(id)">
        <h1 class="dict-item-name" @click.stop="handleDictPage(id)">{{ dicts[id].name }}</h1>
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
          @click.stop="handleUnfold(id)"
        >
          <path d="M43.854 59.414L14.146 29.707 43.854 0l1.414 1.414-28.293 28.293L45.268 58"/>
        </svg>
      </header>
      <div ref="dict" class="dict-item-body"
        :class="{'dict-item-body--show': dicts[id].height > 0}"
        :style="{height: dicts[id].height + 'px'}"
      >
        <component :is="id" :result="dicts[id].result" @search="handleSearchText"></component>
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
  <transition appear name="popup" v-if="isShowNewWordCard" @after-enter="isShowNewWordCard = false">
    <div class="new-word-card">
      <h1>{{ text }}</h1>
    </div>
  </transition>
</div>
</template>

<script>
import {storage, message} from 'src/helpers/chrome-api'
import {isContainEnglish} from 'src/helpers/lang-check'
import {addRecord} from 'src/helpers/record-manager'
import {promiseTimer} from 'src/helpers/promise-more'

const isSmoothScrollSupported = 'scrollBehavior' in document.documentElement.style

export default {
  name: 'dictionary-panel',
  props: ['config', 'i18n'],
  data () {
    return {
      dicts: Object.keys(this.config.dicts.all)
        .reduce((dicts, id) => {
          dicts[id] = {
            result: null,
            height: 0,
            offsetHeight: 0,
            favicon: chrome.runtime.getURL(`assets/dicts/${id}.png`),
            name: chrome.i18n.getMessage('dict_' + id) || id,
            isShow: false,
            isUnfolded: false,
            isSearching: false
          }
          return dicts
        }, {}),

      text: '',

      isShowNewWordCard: false,
      noSearchHistory: false,
      isDragging: false,
      isPinned: false
    }
  },
  methods: {
    seachText (activeDicts) {
      const isOneActiveDict = !Array.isArray(activeDicts)
      if (isOneActiveDict) {
        activeDicts = [activeDicts]
      }
      const text = this.text.trim()
      this.text = text
      const dicts = this.dicts

      this.checkSelectionLang()

      activeDicts.forEach((id) => {
        const dict = dicts[id]
        if (!dict.isShow) { return }

        this.foldDict(id)
        dict.isSearching = true
        dict.result = null // clear the results

        Promise.race([
          promiseTimer(10000),
          message.send({msg: 'FETCH_DICT_RESULT', text, dict: id})
        ]).then(response => {
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

      if (!this.noSearchHistory && this.config.searhHistory) {
        addRecord('history', text)
      }

      if (!isOneActiveDict) {
        // scroll to top after all the dicts are folded
        if (isSmoothScrollSupported) {
          this.$refs.scrollContainer.scrollTo({top: 0, left: 0, behavior: 'smooth'})
        } else {
          this.$refs.scrollContainer.scrollTo(0, 0)
        }
      }
    },
    checkSelectionLang () {
      const allDicts = this.config.dicts.all
      const isEng = isContainEnglish(this.text)
      this.config.dicts.selected.forEach(id => {
        this.dicts[id].isShow = (allDicts[id].showWhenLang.eng && isEng) ||
          (allDicts[id].showWhenLang.chs && !isEng)
      })
    },
    updateDragAreaCoord () {
      const $da = this.$refs.dragarea
      message.self.send({msg: 'DRAG_AREA', left: $da.offsetLeft, width: $da.offsetWidth})
    },
    closePanel () {
      message.self.send({msg: 'CLOSE_PANEL'})
    },
    pinPanel () {
      this.isPinned = !this.isPinned
      message.self.send({msg: 'PIN_PANEL', flag: this.isPinned})
    },
    openOptionsPage () {
      message.send({msg: 'OPEN_URL', url: chrome.runtime.getURL('options.html')})
    },
    openShareimgPage () {
      const dicts = this.config.dicts.selected.map(id => {
        const result = this.dicts[id].result
        if (result && this.dicts[id].isUnfolded) {
          return {id, result}
        }
        return null
      }).filter(Boolean)

      storage.local.set({paneldata: {text: this.text, dicts}}, () => {
        message.send({msg: 'OPEN_URL', url: chrome.runtime.getURL('shareimg.html')})
      })
    },
    openHistoryPage () {
      message.send({msg: 'OPEN_URL', url: chrome.runtime.getURL('history.html')})
    },
    openNoteBook () {
      message.send({msg: 'OPEN_URL', url: chrome.runtime.getURL('notebook.html')})
    },
    addNewWord () {
      if (!this.text) { return }
      if (this.config.newWordSound) {
        new Audio(chrome.runtime.getURL('assets/notification.mp3')).play()
      }
      this.isShowNewWordCard = true
      addRecord('notebook', this.text)
    },
    unfoldDict (id) {
      let dict = this.dicts[id]
      dict.isUnfolded = true

      if (!dict.result) {
        this.seachText(id)
        return
      }

      const preferredHeight = this.config.dicts.all[id].preferredHeight
      dict.height = dict.offsetHeight < preferredHeight ? dict.offsetHeight : preferredHeight
    },
    foldDict (id) {
      const dict = this.dicts[id]
      dict.height = 0
      dict.isUnfolded = false
    },
    handleUnfold (id) {
      const dict = this.dicts[id]
      dict.isUnfolded ? this.foldDict(id) : this.unfoldDict(id)
    },
    handleDictPage (id) {
      message.send({
        msg: 'OPEN_URL',
        escape: true,
        url: this.config.dicts.all[id].page
      })
    },
    handleDictsPanelClick (evt) {
      for (let target = evt.target; target !== evt.currentTarget; target = target.parentNode) {
        if (target.href) {
          const text = target.innerText.trim()
          if (/\s/.test(text)) {
            // more than one word
            chrome.runtime.sendMessage({msg: 'OPEN_URL', url: target.href})
          } else {
            this.handleSearchText({text})
          }
          evt.preventDefault()
          return
        }
      }
    },
    handleDictsPanelDbClick (evt) {
      const text = window.getSelection().toString().trim()
      if (text) {
        this.handleSearchText({text})
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
    }
  },
  created () {
    message.self.on('SEARCH_TEXT', (data, sender, sendResponse) => {
      this.handleSearchText(data)
      sendResponse()
    })

    message.self.send({msg: 'PANEL_READY'}, response => {
      if (!response) { return }
      if (response.preload === 'clipboard') {
        this.$refs.searchbox.focus()
        document.execCommand('paste')
        if (response.autoSearch) {
          this.handleSearchText({text: this.$refs.searchbox.value})
        } else {
          this.$refs.searchbox.select()
        }
      } else if (response.preload === 'selection') {
        message.send({msg: 'PRELOAD_SELECTION'}, text => {
          if (!text) { return }
          if (response.autoSearch) {
            this.handleSearchText({text})
          } else {
            this.text = text
            this.$nextTick(() => {
              this.$refs.searchbox.focus()
              this.$refs.searchbox.select()
            })
          }
        })
      } else {
        this.$refs.searchbox.focus()
      }

      if (response.noSearchHistory) {
        this.noSearchHistory = true
      }
    })
  },
  mounted () {
    setTimeout(() => this.updateDragAreaCoord(), 1000)
  },
  computed: {
    defaultUnfoldList () {
      const allDicts = this.config.dicts.all
      return this.config.dicts.selected.filter(id => allDicts[id].defaultUnfold)
    }
  }
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
    flex: 7;
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

.icon-history {
  @extend %icon;
  fill-opacity: 0.8;
}

.icon-notebook {
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

.new-word-card {
  position: absolute;
  z-index: $global-zindex-tooltip;
  top: 40%;
  left: 50%;
  transform: translateX(-50%);
  max-width: 380px;
  padding: 0 20px;
  word-wrap: break-word;
  background: #fff;
  border-radius: 15px;
  box-shadow: 3px 4px 31px -8px rgba(0,0,0,0.8);
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

.popup-enter-active,
.popup-leave-active {
  transition: transform 1s, opacity 0.5s;
}
.popup-enter {
  opacity: 0;
  transform: translate3d(-50%, 40px, 0px);
}
.popup-leave-to {
  opacity: 0;
}
</style>
