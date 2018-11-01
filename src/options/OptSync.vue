<template>
  <div id="opt-sync" class="opt-item"><!-- 数据同步 -->
    <div class="opt-item__header">
      <strong>{{ $t('opt:sync_title') }}</strong>
    </div>
    <div class="opt-item__body">
      <div class="checkbox">
        <button type="button" class="btn btn-default btn-xs" @click="openPanel">{{ $t('opt:sync_add') }}</button>
      </div>

      <!--Modal 设置-->
      <transition name="fade">
        <div class="modal show text-left" v-if="isShowPanel">
          <div class="modal-dialog">
            <div class="modal-content">
              <div class="modal-header">
                <button type="button" class="close" @click="closePanel">&times;</button>
                <h4 class="modal-title">{{ $t('opt:sync_notebook_title') }}</h4>
              </div>
              <div class="modal-body">
                <p v-html="$t('opt:sync_webdav_explain')" />
                <form id="webdav-form" ref="webdavForm" @submit="save">
                  <div class="form-group">
                    <label for="webdav-url">{{ $t('opt:sync_webdav_url') }}</label>
                    <input v-model="configs.webdav.url" type="url" class="form-control" id="webdav-url" required>
                  </div>
                  <div class="form-group">
                    <label for="webdav-user">{{ $t('opt:sync_webdav_user') }}</label>
                    <input v-model="configs.webdav.user" type="text" class="form-control" id="webdav-user" required>
                  </div>
                  <div class="form-group">
                    <label for="webdav-passwd">{{ $t('opt:sync_webdav_passwd') }}</label>
                    <input v-model="configs.webdav.passwd" type="password" class="form-control" id="webdav-passwd" required>
                  </div>
                  <div class="form-group">
                    <label for="webdav-duration">{{ $t('opt:sync_webdav_duration') }}</label>
                    <div class="input-group">
                      <input :value="configs.webdav.duration / 60000" @input="configs.webdav.duration = $event.target.value * 60000" type="number" min="1" step="1" class="form-control" id="webdav-duration" required>
                      <div class="input-group-addon">{{ $t('opt:unit_mins') }}</div>
                    </div>
                    <p class="help-block">{{ $t('opt:sync_webdav_duration_helper') }}</p>
                  </div>
                </form>
              </div>
              <div class="modal-footer">
                <button type="button" class="btn btn-danger" @click="clear">{{ $t('delete') }}</button>
                <button type="submit" form="webdav-form" class="btn btn-primary" :disabled="isCheckingServer">{{ $t(isCheckingServer ? 'opt:sync_webdav_checking' : 'save') }}</button>
                <button type="button" class="btn btn-default" @click="closePanel">{{ $t('cancel') }}</button>
              </div>
            </div>
          </div>
        </div>
      </transition><!--Modal 设置-->
    </div>
    <div class="opt-item__description-wrap">
      <p class="opt-item__description" v-html="$t('opt:sync_description')"></p>
    </div>
  </div><!-- 数据同步 -->
</template>

<script lang="ts">
import Vue from 'vue'
import { message, storage } from '@/_helpers/browser-api'
import { MsgType, MsgSyncServiceInit, MsgSyncServiceDownload, MsgSyncServiceUpload } from '@/typings/message'

declare module 'vue/types/vue' {
  interface Vue {
    $t: any
    _configs: any
  }
}

function initSyncConfigs () {
  return {
    webdav: {
      url: '',
      user: '',
      passwd: '',
      duration: 15 * 60 * 1000,
    }
  }
}

export default Vue.extend({
  data () {
    return {
      isShowPanel: false,
      isCheckingServer: false,
      configs: initSyncConfigs()
    }
  },
  methods: {
    openPanel () {
      this.isShowPanel = true
    },
    closePanel () {
      for (const id in this.configs) {
        for (const key in this.configs[id]) {
          if (this.configs[id][key] !== this._configs[id][key]) {
            if (window.confirm(this.$t('opt:sync_close_confirm'))) {
              this.isShowPanel = false
              this.configs = JSON.parse(JSON.stringify(this._configs))
            }
            return
          }
        }
      }
      this.isShowPanel = false
    },
    clear () {
      if (confirm(this.$t('delete') + '?')) {
        storage.sync.remove('syncConfig')
        this.isShowPanel = false
      }
    },
    save (e) {
      if (this.$refs.webdavForm['checkValidity']()) {
        this.initServer()
      }
      e.preventDefault()
      return false
    },
    async initServer () {
      if (!this.configs.webdav.url.endsWith('/')) {
        this.configs.webdav.url += '/'
      }

      this.isCheckingServer = true

      const { error } = await message.send<MsgSyncServiceInit>({
        type: MsgType.SyncServiceInit,
        config: this.configs.webdav,
      })
      if (error && error !== 'exist') {
        if (/^(network|unauthorized|mkcol|parse)$/.test(error)) {
          alert(this.$t('opt:sync_webdav_err_' + error))
        }
        this.isCheckingServer = false
        return
      }

      await storage.sync.set({ syncConfig: this.configs })

      if (error === 'exist') {
        if (confirm(this.$t('opt:sync_webdav_err_exist'))) {
          await message.send<MsgSyncServiceDownload>({
            type: MsgType.SyncServiceDownload,
            force: true,
          }).catch(() => {
            alert(this.$t('opt:sync_webdav_err_network'))
          })
        }
      }

      await message.send<MsgSyncServiceUpload>({
        type: MsgType.SyncServiceUpload,
        force: true,
      }).catch(() => {
        alert(this.$t('opt:sync_webdav_err_network'))
      })

      this.isCheckingServer = false
      this._configs = JSON.parse(JSON.stringify(this.configs))
      this.isShowPanel = false
    },
  },
  async created () {
    const { syncConfig } = await storage.sync.get('syncConfig')
    if (syncConfig) {
      this.configs = syncConfig
    }
    this._configs = JSON.parse(JSON.stringify(this.configs))

    storage.sync.addListener(({ syncConfig }) => {
      if (syncConfig) {
        if (syncConfig.newValue) {
          this.configs = JSON.parse(JSON.stringify(syncConfig.newValue))
          this._configs = JSON.parse(JSON.stringify(syncConfig.newValue))
        } else {
          this.configs = initSyncConfigs()
          this._configs = initSyncConfigs()
        }
      }
    })
  },
})
</script>
