<template>
<div class="popup-container">
  <button type="button" class="btn btn-success btn-lg btn-block btn-options" @click="openOptions">{{ i18n('popup_enter_options') }}</button>
  <div class="qrcode" @click="openOptions">
    <qrcode :value="tabsUrl" v-if="tabsUrl" :size="250"></qrcode>
    <div class="tab-title">{{ i18n('popup_tab_title') }}</div>
  </div>
  <div class="active-switch">
    <span class="switch-title">{{ i18n('opt_app_active_title') }}</span>
    <input type="checkbox" id="opt-active" class="btn-switch" v-model="config.active">
    <label for="opt-active"></label>
  </div>
</div>
</template>

<script>
import Qrcode from 'vue-qrious'
import defaultConfig from 'src/app-config'
import {storage, message} from 'src/helpers/chrome-api'

export default {
  name: 'Popup',
  data () {
    return {
      config: defaultConfig,
      tabsUrl: '',
      tabsTitle: ''
    }
  },
  watch: {
    config: {
      deep: true,
      handler () {
        storage.sync.set({config: this.config})
      }
    }
  },
  methods: {
    i18n (key) {
      return chrome.i18n.getMessage(key)
    },
    openOptions () {
      message.send({msg: 'CREATE_TAB', url: chrome.runtime.getURL('options.html')})
    }
  },
  created () {
    chrome.tabs.query({active: true, currentWindow: true}, tabs => {
      if (tabs && tabs[0]) {
        let tab = tabs[0]
        this.tabsUrl = tab.url
        this.tabsTitle = tab.title
      }
    })

    storage.sync.get('config').then(result => {
      if (result.config) {
        this.config = result.config
      }
    })
    storage.listen('config', changes => {
      this.config = changes.config.newValue
    })
  },
  components: {
    Qrcode
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
@import "~bootstrap-sass/assets/stylesheets/bootstrap/buttons";

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

/*------------------------------------*\
   Components
\*------------------------------------*/
.popup-container {
  width: 300px;
  padding: 20px 10px 0 10px;
  text-align: center;
  color: #333;
}

.btn-options {
  position: relative;

  &::before {
    content: '';
    display: block;
    position: absolute;
    top: 100%;
    left: 2px;
    width: 100px;
    height: 100px;
    background: #87d37c;
    transform: skewX(50deg);
    transform-origin: top;
  }

  &::after {
    content: '';
    display: block;
    position: absolute;
    top: 100%;
    right: 2px;
    width: 100px;
    height: 100px;
    background: #87d37c;
    transform: skewX(-50deg);
    transform-origin: top;
  }
}

.qrcode {
  position: relative;
  cursor: pointer;
}

.active-switch {
  display: flex;
  align-items: center;
  position: relative;
  height: 56px;
  margin: 20px -10px 0 -10px;
  padding: 0 20px;
  background: #f9f9f9;
  box-shadow: inset 0 10px 6px -6px rgba(0,0,0,.13);
}

.switch-title {
  flex: 1;
  font-size: 1.2em;
  font-weight: bold;
  text-align: left;
  color: #333;
}

$switch-button-width: 63px;
$switch-button-height: 37px;
.btn-switch {
  // hide input
  position: absolute;
  z-index: -200000;
  opacity: 0;

  & + label {
    display: inline-block;
    width: $switch-button-width;
    height: $switch-button-height;
    position: relative;
    margin: auto;
    background-color: #ddd;
    border-radius: $switch-button-height;
    cursor: pointer;
    outline: 0;
    user-select: none;
  }

  & + label:before {
    content: '';
    display: block;
    position: absolute;
    top: 1px;
    left: 1px;
    bottom: 1px;
    right: 1px;
    background-color: #f1f1f1;
    border-radius: $switch-button-height;
    transition: background 0.4s;
  }

  & + label:after {
    content: '';
    display: block;
    position: absolute;
    height: $switch-button-height - 2px;
    width: $switch-button-height - 2px;
    background-color: #fff;
    border-radius: 100%;
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.3);
    transition: margin 0.4s;
  }

  &:checked + label:before {
    background-color: #8ce196;
  }

  &:checked + label:after {
    margin-left: $switch-button-width - $switch-button-height + 2px;
  }
}
</style>
