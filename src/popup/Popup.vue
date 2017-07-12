<template>
<div class="popup-container">
  <iframe class="saladict-frame"
    name="saladict-frame"
    frameBorder="0"
    :src="frameSource"
    :style="{height: panelHeight + 'px'}"
  ></iframe>
  <div class="active-switch">
    <span class="switch-title">{{ i18n('opt_app_active_title') }}</span>
    <input type="checkbox" id="opt-active" class="btn-switch" v-model="config.active">
    <label for="opt-active"></label>
  </div>
</div>
</template>

<script>
import defaultConfig from 'src/app-config'
import {storage, message} from 'src/helpers/chrome-api'

export default {
  name: 'Popup',
  data () {
    return {
      frameSource: chrome.runtime.getURL('panel.html'),
      config: defaultConfig
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
      return chrome.i18n.getMessage(key) || key
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
      const maxHeight = 400
      return preferredHeight > maxHeight ? maxHeight : preferredHeight
    }
  },
  created () {
    storage.sync.get('config').then(result => {
      if (result.config) {
        this.config = result.config
      }
    })
    storage.listen('config', changes => {
      this.config = changes.config.newValue
    })
    message.on('PANEL_READY', (__, ___, sendResponse) => {
      // trigger the paste command
      sendResponse({ctrl: true})
    })
  }
}
</script>

<style lang="scss">
/*------------------------------------*\
   Base
\*------------------------------------*/
html {
  margin: 0;
  padding: 0;
  overflow-y: scroll;
}

body {
  margin: 0;
  padding: 0;
  font-size: 14px;
  font-family: "Helvetica Neue", Helvetica, Arial, "Hiragino Sans GB", "Hiragino Sans GB W3", "Microsoft YaHei UI", "Microsoft YaHei", "WenQuanYi Micro Hei", sans-serif;
}

.saladict-frame {
  width: 400px;
  overflow: hidden;
  border: 0 none;
}

.active-switch {
  display: flex;
  align-items: center;
  position: relative;
  height: 56px;
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
