<template>
<div>
  <transition name="dropdown">
    <div class="config-updated" v-if="isShowConfigUpdated">
      {{ i18n('opt_storage_updated') }}
    </div>
  </transition>
  <div class="opt-container">
    <h1 class="page-header">{{ i18n('opt_title') }}
      <a class="new-version" v-if="newVersionAvailable" href="http://www.crimx.com/crx-saladict/" target="_blank">{{ i18n('opt_new_version') }}</a>
      <button type="button" class="btn btn-default btn-reset" @click="handleReset">{{ i18n('opt_reset') }}</button>
    </h1>
    <opt-app-active />
    <opt-search-history />
    <opt-mode />
    <opt-pin-mode />
    <opt-triple-ctrl />
    <opt-language />
    <opt-autopron />
    <opt-dicts />
    <opt-context-menu />
  </div>

  <!--查词面板-->
  <transition appear name="popup">
    <div class="frame-container">
      <iframe class="saladict-frame"
        name="saladict-frame"
        frameBorder="0"
        :src="frameSource"
        :style="{height: panelHeight + 'px'}"
      ></iframe>
    </div>
  </transition><!--查词面板-->

  <!--Alert Modal-->
  <alert-modal ref="alert" />

  <!--赏杯咖啡呗-->
  <coffee />
</div>
</template>

<script>
import {storage, message} from 'src/helpers/chrome-api'
import AppConfig from 'src/app-config'
import Coffee from './Coffee'
import AlertModal from 'src/components/AlertModal'

import OptAppActive from './OptAppActive'
import OptSearchHistory from './OptSearchHistory'
import OptMode from './OptMode'
import OptPinMode from './OptPinMode'
import OptTripleCtrl from './OptTripleCtrl'
import OptLanguage from './OptLanguage'
import OptAutopron from './OptAutopron'
import OptDicts from './OptDicts'
import OptContextMenu from './OptContextMenu'

export default {
  name: 'options',
  store: ['config', 'pageId', 'unlock', 'newVersionAvailable', 'i18n'],
  data () {
    return {
      text: 'salad',
      frameSource: chrome.runtime.getURL('panel.html'),
      isShowConfigUpdated: false
    }
  },
  methods: {
    searchText () {
      clearTimeout(this.searchTextTimeout)
      this.searchTextTimeout = setTimeout(() => {
        message.send({msg: 'SEARCH_TEXT_SELF', text: this.text, page: this.pageId})
      }, 2000)
    },
    handleReset () {
      this.$refs.alert.$emit('show', {
        title: chrome.i18n.getMessage('opt_reset_modal_title'),
        content: chrome.i18n.getMessage('opt_reset_modal_content'),
        onConfirm: () => {
          storage.sync.set({config: new AppConfig()})
            .then(() => storage.sync.get('config'))
            .then(({config}) => {
              if (config) {
                this.config = config
              } else {
                // something wrong with the sync storage, use default config without syncing
                const defaultConfig = new AppConfig()
                storage.sync.set({config: defaultConfig})
                this.config = defaultConfig
              }
            })
        }
      })
    }
  },
  watch: {
    config: {
      deep: true,
      handler () {
        storage.sync.set({config: this.config})
          .then(() => {
            this.isShowConfigUpdated = true
            clearTimeout(this.showConfigUpdatedTimeout)
            this.showConfigUpdatedTimeout = setTimeout(() => {
              this.isShowConfigUpdated = false
            }, 1500)
          })
      }
    },
    'config.dicts': {
      deep: true,
      handler () { this.searchText() }
    },
    'config.autopron': {
      deep: true,
      handler () { this.searchText() }
    }
  },
  computed: {
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
  components: {
    OptAppActive,
    OptSearchHistory,
    OptMode,
    OptPinMode,
    OptTripleCtrl,
    OptLanguage,
    OptAutopron,
    OptDicts,
    OptContextMenu,
    Coffee,
    AlertModal
  },
  created () {
    message.on('PANEL_READY', (__, ___, sendResponse) => {
      this.searchText()
      sendResponse()
    })
  },
  mounted () {
    // monitor search text
    message.on('FETCH_DICT_RESULT', (data, sender) => {
      if (this.pageId === sender.tab.id) {
        this.text = data.text
      }
    })
  }
}
</script>

<style lang="scss">
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
@import "~bootstrap-sass/assets/stylesheets/bootstrap/forms";
@import "~bootstrap-sass/assets/stylesheets/bootstrap/buttons";

// Components
@import "~bootstrap-sass/assets/stylesheets/bootstrap/button-groups";
@import "~bootstrap-sass/assets/stylesheets/bootstrap/input-groups";
@import "~bootstrap-sass/assets/stylesheets/bootstrap/panels";
@import "~bootstrap-sass/assets/stylesheets/bootstrap/close";
@import "~bootstrap-sass/assets/stylesheets/bootstrap/alerts";

// Components w/ JavaScript
@import "~bootstrap-sass/assets/stylesheets/bootstrap/modals";

.checkbox-inline {
  margin-right: 10px;

  + .checkbox-inline {
    margin-left: 0;
  }

  :last-child {
    margin-right: 0;
  }
}

/*------------------------------------*\
   Base
\*------------------------------------*/
html {
  overflow-y: scroll;
}

body {
  font-size: 14px;
  font-family: "Helvetica Neue", Helvetica, Arial, "Hiragino Sans GB", "Hiragino Sans GB W3", "Microsoft YaHei UI", "Microsoft YaHei", "WenQuanYi Micro Hei", sans-serif;
}

/* type.css */
kbd {
  display: inline-block;
  padding: .25em .5em .2em;
  margin-left: .25em;
  margin-right: .25em;
  font: 75%/1 monaco, menlo, consolas, 'courier new', courier, monospace;
  border: solid 1px #ccc;
  border-bottom-color: #bbb;
  border-radius: 3px;
  white-space: nowrap;
  word-wrap: normal;
  text-transform: capitalize;
  color: #555;
  background-color: #fefefe;
  background-image: linear-gradient(to bottom, rgba(0, 0, 0, 0.05), transparent);
  box-shadow: 0 2px 0 #ccc, 0 3px 1px #999, inset 0 1px 1px #fff;
}

/*------------------------------------*\
   Components
\*------------------------------------*/
.modal-body {
  overflow-y: auto;
  max-height: 80vh;
}

.config-updated {
  @extend .alert-success;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: $global-zindex-popover;
  padding: 5px;
  font-size: 18px;
  font-weight: bold;
  text-align: center;
}

.opt-container {
  min-width: 800px;
  margin-right: 500px;
  padding: 0 15px;
}

.new-version {
  text-decoration: none;
  color: #16a085;
}

.page-header {
  position: relative;
}

.btn-reset {
  position: absolute;
  bottom: 8px;
  right: 0;
}

.opt-item {
  @extend .row;
  position: relative;
  margin-bottom: 10px;
}

.opt-item__header {
  @extend .col-xs-2;
  text-align: right;
}

.opt-item__body {
  @extend .col-xs-6;
  background-color: #fafafa;

  &:hover + .opt-item__description-wrap {
    opacity: 1;
    z-index: 100;
  }
}

.opt-item__description-wrap {
  @extend .col-xs-4;
  position: absolute;
  z-index: -1;
  right: 0;
  padding-left: 15px;
  opacity: 0;
  transition: all 400ms;

  &:hover {
    opacity: 1;
    z-index: 100;
  }
}

.opt-item__description {
  border-left: 1px solid #666;
  padding-left: 15px;
  line-height: 1.8;
  color: #666;
}

.frame-container {
  position: fixed;
  top: 0;
  right: 0;
  height: 100%;
  width: 500px;
}

.saladict-frame {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 400px;
  overflow: hidden;
  border: 0 none;
  box-shadow: rgba(0, 0, 0, 0.8) 0px 4px 23px -6px;
  transition: all 1s;
}

.panel-list__add {
  text-align: right;
  margin: 15px 0;
}

.panel-list__header {
  @extend .panel-heading;
  cursor: pointer;
}

.panel-list__title {
  cursor: move;
}

.panel-list__header {
  cursor: move;
}

.panel-list__icon {
  width: 16px;
  height: 16px;
  vertical-align: text-bottom;
}

.panel-list__body {
  transition: height 600ms;
  overflow: hidden;
}

.double-click-delay {
  overflow: hidden;
  height: 0;
  transition: height 400ms;
}

/*------------------------------------*\
   States
\*------------------------------------*/
// Utility classes
@import "~bootstrap-sass/assets/stylesheets/bootstrap/utilities";

.panel-list {
  transition: all 600ms;
}

.panel-list-enter, .panel-list-leave-to {
  opacity: 0;
}

.panel-list-leave-active {
  position: absolute;
  left: 15px;
  right: 15px;
}

.sortable-drag,
.sortable-ghost {
  opacity: 0;
}

.fade-enter-active, .fade-leave-active {
  transition: opacity 500ms;
}
.fade-enter, .fade-leave-active {
  opacity: 0;
}

.popup-enter-active {
  transition: all 1.5s 1s;
}
.popup-enter {
  opacity: 0;
  transform: translate3d(0px, 40px, 0px);
}

.dropdown-enter-active, .dropdown-leave-active {
  transition: transform 500ms;
}
.dropdown-enter, .dropdown-leave-active {
  transform: translateY(-100%);
}

@media (max-width: 1024px) {
  .opt-container {
    width: 100%;
  }

  .frame-container {
    display: none;
  }
}
</style>
