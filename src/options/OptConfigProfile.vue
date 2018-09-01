<template>
  <div class="opt-item"><!-- 情景模式 -->
    <div class="opt-item__header">
      <strong>{{ $t('opt:config_profile_title') }}</strong>
    </div>
    <div class="opt-item__body opt-config-profile-body">
      <button type="button" class="btn btn-default btn-xs" @click="openRename">{{ $t('rename') }}</button>
      <div class="select-box-container">
        <label class="select-box">
          <select class="form-control" v-model="activeConfigID">
            <option
              v-for="id in configProfileIDs"
              :value="id"
              :selected="id === activeConfigID"
            >{{ profileName(id) }}</option>
          </select>
        </label>
      </div>
      <button type="button" class="btn btn-default btn-xs" @click="isShowSort = true" style="margin-right: 5px">{{ $t('sort') }}</button>
      <button type="button" class="btn btn-default btn-xs" @click="openAdd">{{ $t('add') }}</button>

      <!--Modal 重命名-->
      <transition name="fade">
        <div class="modal show text-left" v-if="isShowRename">
          <div class="modal-dialog">
            <div class="modal-content">
              <div class="modal-header">
                <button type="button" class="close" @click="isShowRename = false">&times;</button>
                <h4 class="modal-title">{{ $t('opt:config_profile_rename') }}</h4>
              </div>
              <div class="modal-body">
                <input type="text" class="form-control" v-model="activeConfigName">
              </div>
              <div class="modal-footer">
                <button type="button" class="btn btn-default" @click="isShowRename = false">{{ $t('cancel') }}</button>
                <button type="button" class="btn btn-primary" @click="saveName">{{ $t('save') }}</button>
              </div>
            </div>
          </div>
        </div>
      </transition><!--Modal 重命名-->

      <!--Modal 排序-->
      <transition name="fade">
        <div class="modal show text-left" v-if="isShowSort">
          <div class="modal-dialog">
            <div class="modal-content">
              <div class="modal-header">
                <button type="button" class="close" @click="isShowSort = false">&times;</button>
                <h4 class="modal-title">{{ $t('opt:config_profile_title') }}</h4>
              </div>
              <div class="modal-body">
                <div class="panel-group">
                  <draggable v-model="configProfileIDs" :options="{animation: 200}">
                    <transition-group name="panel-list">
                      <div class="panel-list panel panel-default" v-for="id in configProfileIDs" :key="id">
                        <div class="panel-list__header">
                          <strong class="panel-list__title">{{ profileName(id) }}</strong>
                          <button type="button" class="close" @click.stop="deleteProfile(id)">&times;</button>
                        </div>
                      </div>
                      <div key='___'></div><!--An empty div to fix a tricky bug on draggable-->
                    </transition-group>
                  </draggable>
                </div><!--已选择右键菜单列表-->
              </div>
            </div>
          </div>
        </div>
      </transition><!--Modal 排序-->

      <!--Modal 添加-->
      <transition name="fade">
        <div class="modal show text-left" v-if="isShowAdd">
          <div class="modal-dialog">
            <div class="modal-content">
              <div class="modal-header">
                <button type="button" class="close" @click="isShowAdd = false">&times;</button>
                <h4 class="modal-title">{{ $t('opt:config_profile_add') }}</h4>
              </div>
              <div class="modal-body">
                <input v-focus v-select type="text" class="form-control" v-model="newProfileName">
              </div>
              <div class="modal-footer">
                <button type="button" class="btn btn-default" @click="isShowAdd = false">{{ $t('cancel') }}</button>
                <button type="button" class="btn btn-primary" @click="addProfile">{{ $t('add') }}</button>
              </div>
            </div>
          </div>
        </div>
      </transition><!--Modal 添加-->

    </div>
    <div class="opt-item__description-wrap">
      <p class="opt-item__description" v-html="$t('opt:config_profile_description')"></p>
    </div>
  </div><!-- 情景模式 -->
</template>

<script>
import Vue from 'vue'
import Draggable from 'vuedraggable'
import { storage } from '@/_helpers/browser-api'
import { appConfigFactory } from '@/app-config'
import { addConfig } from '@/_helpers/config-manager'

export default {
  store: ['configProfileIDs', 'configProfiles', 'activeConfigID', 'config'],
  data () {
    return {
      isShowRename: false,
      isShowSort: false,
      isShowAdd: false,
      activeConfigName: '',
      newProfileName: '',
    }
  },
  methods: {
    profileName (id) {
      const name = this.configProfiles[id].name

      // default names
      const match = /^%%_(\S+)_%%$/.exec(name)
      if (match) {
        return this.$t(`profile:${match[1]}`) || name
      }

      return name
    },

    openRename () {
      // Prevent reactive passing
      this.activeConfigName = String(this.profileName(this.activeConfigID))
      this.isShowRename = true
    },
    saveName () {
      this.config.name = String(this.activeConfigName)
      // also inform id list
      this.configProfileIDs = this.configProfileIDs.slice()
      this.isShowRename = false
    },

    openAdd () {
      this.isShowAdd = true
      this.newProfileName = this.$t('profile:default')
    },

    addProfile () {
      const config = appConfigFactory()
      config.name = this.newProfileName
      addConfig(config)
        .then(() => {
          Vue.set(this.configProfiles, config.id, config)
          this.configProfileIDs.push(config.id)
          this.activeConfigID = config.id
          this.isShowAdd = false
        })
    },

    deleteProfile (id) {
      if (window.confirm(this.$t('opt:config_profile_delete_confirm', { name: this.profileName(id) }))) {
        const newList = this.configProfileIDs.filter(x => x !== id)
        if (this.activeConfigID === id) {
          this.activeConfigID = newList[0]
          this.config = this.configProfiles[newList[0]]
        }
        this.configProfileIDs = newList
        Vue.delete(this.configProfiles, id)
        storage.sync.remove(id)
      }
    }
  },
  components: {
    Draggable
  },
}
</script>

<style>
.opt-config-profile-body {
  display: flex;
  justify-content: center;
  align-items: center;
  border: 1px solid #FDE3A7;
  background: #fffec8;
}

.opt-config-profile-body select {
  text-align: center;
  text-align-last: center;
}
</style>

