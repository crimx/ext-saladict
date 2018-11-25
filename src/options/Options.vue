<template>
<div>
  <transition name="dropdown">
    <div :class="`config-updated ${configUpdateStatus}`" v-if="configUpdateStatus">
      {{ configUpdateMsg }}
    </div>
  </transition>
  <div class="opt-container">
    <div class="page-header">
      <h1>{{ $t('opt:title') }}
        <a class="new-version" v-if="newVersionAvailable" href="http://www.crimx.com/crx-saladict/" target="_blank">{{ $t('opt:new_version') }}</a>
      </h1>
      <div class="page-header-info">
        <p class="page-header-acknowledgement-wrap">
          <a href="https://github.com/crimx/crx-saladict/wiki#acknowledgement" @mouseenter="showAcknowledgement(true)" @mouseleave="showAcknowledgement(false)" @click.prevent="void 0">{{ $t('opt:acknowledgement') }}</a>
          <transition name="fade">
            <div class="page-header-acknowledgement" v-if="isShowAcknowledgement" @mouseenter="showAcknowledgement(true)"  @mouseleave="showAcknowledgement(false)">
              <ol>
                <li><a href="https://github.com/stockyman" rel="nofollow" target="_blank">stockyman</a> {{ $t('opt:acknowledgement_trans_tw') }}</li>
                <li><a href="https://github.com/caerlie" rel="nofollow" target="_blank">caerlie</a> {{ $t('opt:acknowledgement_weblio') }}</li>
              </ol>
            </div>
          </transition>
        </p>
        <p><a href="https://github.com/crimx/crx-saladict/wiki#wiki-content" target="_blank" rel="noopener">{{ $t('opt:instructions') }}</a></p>
        <p class="page-header-social-media-wrap">
          <a href="mailto:straybugs@gmail.com" @mouseenter="showSocialMedia(true)" @mouseleave="showSocialMedia(false)" @click.prevent="void 0">{{ $t('opt:contact_author') }}</a>
          <transition name="fade">
            <div class="page-header-social-media" v-if="isShowSocial" @mouseenter="showSocialMedia(true)"  @mouseleave="showSocialMedia(false)">
              <social-media />
            </div>
          </transition>
        </p>
        <p><a href="https://github.com/crimx/crx-saladict/issues" target="_blank" rel="noopener">{{ $t('opt:report_issue') }}</a></p>
      </div>
    </div>
    <div class="text-right">
      <input type="file" id="config-import" class="btn-file" @change="handleImport">
      <label class="btn btn-default btn-xs" for="config-import">{{ $t('opt:import') }}</label>
      <button type="button" class="btn btn-default btn-xs" @click="handleExport">{{ $t('opt:export') }}</button>
      <button type="button" class="btn btn-danger btn-xs" @click="handleReset">{{ $t('opt:reset') }}</button>
    </div>

    <component v-for="optName in optNames" :is="optName" :key="optName"></component>
  </div>

  <!--Alert Modal-->
  <alert-modal ref="alert" />

  <!--赏杯咖啡呗-->
  <coffee />
</div>
</template>

<script>
import { storage, message } from '@/_helpers/browser-api'
import { getWordOfTheDay } from '@/_helpers/wordoftheday'
import { timer } from '@/_helpers/promise-more'
import appConfigFactory from '@/app-config'
import { mergeConfig } from '@/app-config/merge-config'
import Coffee from './Coffee'
import SocialMedia from './SocialMedia'
import AlertModal from '@/components/AlertModal'
import { updateActiveConfig, updateActiveConfigID, updateConfigIDList, resetConfig } from '@/_helpers/config-manager'

// Auto import option section components
const _optNames = [
  'OptSync',
  'OptConfigProfile',
  'OptAppActive',
  'OptPreference',
  'OptPrivacy',
  'OptNotebook',
  'OptLanguage',
  'OptDictPanel',
  'OptMode',
  'OptPinMode',
  'OptPanelMode',
  'OptPopup',
  'OptTripleCtrl',
  'OptAutopron',
  'OptMatchPatterns',
  'OptDicts',
  'OptContextMenu',
]

const _optRequire = require.context('./', false, /^\.\/Opt.*\.vue$/)
const _optComps = _optNames.reduce((o, name) => {
   o[name] = _optRequire(`./${name}.vue`).default
  return o
}, {})

export default {
  name: 'options',
  store: ['activeConfigID', 'configProfileIDs', 'configProfiles', 'config', 'newVersionAvailable', 'searchText'],
  data () {
    return {
      configUpdateStatus: '',
      configUpdateMsg: '',
      isShowSocial: false,
      isShowAcknowledgement: false,
      optNames: _optNames,
    }
  },
  methods: {
    showConfigUpdateBar (msg, status) {
      this.configUpdateMsg = msg
      this.configUpdateStatus = status
      clearTimeout(this.showConfigUpdatedTimeout)
      this.showConfigUpdatedTimeout = setTimeout(() => {
        this.configUpdateStatus = ''
        this.configUpdateMsg = ''
      }, 1500)
    },
    showSavedBar () {
      this.showConfigUpdateBar(this.$t('opt:storage_updated'), 'alert-success')
    },
    showImportErrorBar () {
      this.showConfigUpdateBar(this.$t('opt:storage_import_error'), 'alert-danger')
    },
    showSocialMedia (flag) {
      clearTimeout(this.__showSocialMediaTimeout)
      if (flag) {
        this.isShowSocial = true
      } else {
        this.__showSocialMediaTimeout = setTimeout(() => {
          this.isShowSocial = false
        }, 400)
      }
    },
    showAcknowledgement (flag) {
      clearTimeout(this.__showAcknowledgementTimeout)
      if (flag) {
        this.isShowAcknowledgement = true
      } else {
        this.__showAcknowledgementTimeout = setTimeout(() => {
          this.isShowAcknowledgement = false
        }, 400)
      }
    },
    handleImport (e) {
      const fr = new FileReader()
      fr.onload = async () => {
        let newStore

        try {
          newStore = JSON.parse(fr.result)
        } catch (err) {
          if (process.env.NODE_ENV !== 'production' || process.env.DEV_BUILD) {
            console.warn(err)
          }
          this.showImportErrorBar()
          return
        }

        const {
          activeConfigID,
          configProfileIDs,
          configProfiles,
          syncConfig,
        } = newStore

        if (syncConfig) {
          await storage.sync.set({ syncConfig })
        }

        if (!activeConfigID ||
            typeof activeConfigID !== 'string' ||
            !Array.isArray(configProfileIDs) ||
            !configProfileIDs.includes(activeConfigID) ||
            !configProfiles ||
            configProfileIDs.some(id => !configProfiles[id] || !configProfiles[id].id)
          ) {
          if (process.env.DEV_BUILD) {
            console.error('Wrong import file')
          }
          this.showImportErrorBar()
          return
        }

        const newProfiles = configProfileIDs.reduce((profiles, id) => {
          profiles[id] = mergeConfig(configProfiles[id], appConfigFactory(id))
          return profiles
        }, {})

        await storage.sync.remove(this.configProfileIDs)
        await storage.sync.set({
          activeConfigID,
          configProfileIDs,
        })

        // beware of quota bytes per item exceeds
        for (let i = 0; i < configProfileIDs.length; i++) {
          const id = configProfileIDs[i]
          await storage.sync.set({ [id]: newProfiles[id] })
        }

        this.configProfiles = newProfiles
        this.configProfileIDs = configProfileIDs
        this.activeConfigID = activeConfigID
        this.config = newProfiles[activeConfigID]
      }
      fr.readAsText(e.currentTarget.files[0])
    },
    async handleExport () {
      const { os } = await browser.runtime.getPlatformInfo()
      let config = JSON.stringify({
        activeConfigID: this.activeConfigID,
        configProfileIDs: this.configProfileIDs,
        configProfiles: this.configProfiles,
        syncConfig: (await storage.sync.get('syncConfig')).syncConfig,
      })
      if (os === 'win') {
        config = config.replace(/\r\n|\n/g, '\r\n')
      }
      const file = new Blob([config], { type: 'text/plain;charset=utf-8' })
      const a = document.createElement('a')
      a.href = URL.createObjectURL(file)
      a.download = `config-${Date.now()}.saladict`
      // firefox
      a.target = '_blank'
      document.body.appendChild(a)

      a.click()
    },
    handleReset () {
      this.$refs.alert.$emit('show', {
        title: this.$t('opt:reset_modal_title'),
        content: this.$t('opt:reset_modal_content'),
        onConfirm: async () => {
          await resetConfig()
          await storage.sync.remove('syncConfig')
          const {
            activeConfigID,
            configProfileIDs
          } = await storage.sync.get(['activeConfigID', 'configProfileIDs'])
          const configProfiles = {}
          // quota bytes limit
          for (let i = 0; i < configProfileIDs.length; i++) {
            const id = configProfileIDs[i]
            configProfiles[id] = (await storage.sync.get(id))[id]
          }

          this.configProfiles = configProfiles
          this.configProfileIDs = configProfileIDs
          this.activeConfigID = activeConfigID
          this.config = configProfiles[activeConfigID]
        }
      })
    }
  },
  watch: {
    async activeConfigID (newID) {
      await updateActiveConfigID(newID)
      this.config = this.configProfiles[newID]
    },
    configProfileIDs: {
      deep: true,
      async handler () {
        await updateConfigIDList(this.configProfileIDs)
        const profiles = {}
        // quota bytes limit
        for (let i = 0; i < this.configProfileIDs.length; i++) {
          const id = this.configProfileIDs[i]
          profiles[id] = (await storage.sync.get(id))[id]
        }
        this.configProfiles = profiles
        this.showSavedBar()
      }
    },
    config: {
      deep: true,
      handler () {
        /*-----------------------------------------------*\
            Patch update url
        \*-----------------------------------------------*/
        const config = JSON.parse(JSON.stringify(this.config))

        const googleLocation = config.dicts.all.google.options.cnfirst ? 'cn' : 'com'
        const googleLang = config.dicts.all.google.options.tl === 'default'
          ? config.langCode
          : config.dicts.all.google.options.tl
        config.contextMenus.all.google_translate = `https://translate.google.${googleLocation}/#auto/${googleLang}/%s`

        const sogouLang = config.dicts.all.sogou.options.tl === 'default'
          ? config.langCode === 'zh-CN'
            ? 'zh-CHS'
            : config.langCode === 'zh-TW'
              ? 'zh-CHT'
              : 'en'
          : config.dicts.all.sogou.options.tl
        config.contextMenus.all.sogou = `https://fanyi.sogou.com/#auto/${sogouLang}/%s`

        updateActiveConfig(config)
          .then(() => this.showSavedBar())
      }
    },
  },
  components: {
    ..._optComps,
    Coffee,
    SocialMedia,
    AlertModal
  },
  mounted () {
    if (process.env.NODE_ENV !== 'development') {
      Promise.all([getWordOfTheDay(), timer(1000)])
        .then(([word]) => this.searchText(word))
        .catch(() => this.searchText('salad'))
    }

    setTimeout(() => {
      if(window.location.hash){
         const el = document.querySelector(window.location.hash)
         if (el) {
           window.scrollTo({
             top: el.offsetTop,
             left: 0,
             behavior: 'smooth',
           })
         }
      }
    }, 1000)
  }
}
</script>

<style lang="scss">
@import "src/_sass_global/z-indices";
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

  &:last-child {
    margin-right: 0;
  }
}

.modal {
  // leave space for the dict panel
  padding-right: 470px;
}

.modal-body {
  overflow-y: scroll;
  max-height: 80vh;
}

.input-group {
  margin: 10px 0;
}

.btn-file {
  position: absolute;
  z-index: -20000;
  left: -100%;

  &:active + label,
  &:focus + label {
    @include tab-focus;
    color: #333;
    background-color: #e6e6e6;
    border-color: #8c8c8c;
  }

  &:hover + label {
    color: #333;
    background-color: #e6e6e6;
    border-color: #adadad;
    text-decoration: none;
  }

  &:active + label {
    outline: 0;
    background-image: none;
    @include box-shadow(inset 0 3px 5px rgba(0,0,0,.125));
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
  max-width: 1280px;
  min-width: 800px;
  margin-right: 470px;
  padding: 0 15px;
}

.new-version {
  text-decoration: none;
  color: #16a085;
}

.page-header {
  display: flex;
  justify-content: space-between;
  margin: 0 0 8px 0;
}

.page-header-info {
  display: flex;
  align-items: flex-end;

  & > * {
    margin: 0 0 0 8px;
  }
}

.page-header-acknowledgement-wrap {
  position: relative;
}

.page-header-acknowledgement {
  position: absolute;
  z-index: 99999;
  top: 150%;
  right: 0;
  width: 300px;
  padding: 20px 8px;
  background-color: #fff;
  border-radius: 15px;
  box-shadow: 3px 4px 31px -8px rgba(0,0,0,0.8);
}

.page-header-social-media-wrap {
  position: relative;
}

.page-header-social-media {
  position: absolute;
  z-index: 99999;
  top: 150%;
  right: 0;
}

.opt-item {
  @extend .row;
  position: relative;
  margin-bottom: 10px;
}

.opt-item__header {
  @extend .col-xs-2;
  width: percentage(2/12);
  text-align: right;
}

.opt-item__body {
  @extend .col-xs-6;
  width: percentage(7/12);
  padding-left: 10px;
  padding-right: 10px;
  background-color: #fafafa;

  &:hover + .opt-item__description-wrap {
    opacity: 1;
    z-index: 100;
  }
}

.opt-item__description-wrap {
  @extend .col-xs-4;
   width: percentage(3/12);
  position: absolute;
  z-index: -1;
  right: 0;
  padding-left: 15px;
  opacity: 0;
  transition: all 400ms;

  ul {
    padding: 0;
  }

  li {
    list-style: none;
  }

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

  .hl {
    padding: 0 5px;
    color: white;
    border-radius: 5px;
    background: red;
  }
}

.frame-container {
  position: fixed;
  top: 0;
  right: 0;
  height: 100%;
  width: 470px;
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
  cursor: move;
}

.panel-list__title {
  cursor: move;
}

.panel-list__title-lang {
  margin-left: 5px;
  padding: 0 2px;
  border: 1px solid #333;
  border-radius: 2px;
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

.instant-capture-container {
  display: flex;
  align-items: flex-end;

  & > * {
    margin-bottom: 10px !important;
  }
}

.instant-capture-delay {
  flex: 1 50%;
  transition: opacity 0.4s;
}

.select-box-container {
  margin: 10px 0;
}

.select-box {
  margin-left: 10px;
  margin-right: 10px;
}

.select-label {
  padding-left: 5px;
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
