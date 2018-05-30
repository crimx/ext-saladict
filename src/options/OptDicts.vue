<template>
  <div class="opt-item"><!-- 词典设置 -->
    <div class="opt-item__header">
      <strong>{{ $t('opt:dicts_title') }}</strong>
    </div>
    <div class="opt-item__body">
      <header class="panel-list__add">
        <button type="button" class="btn btn-default btn-xs"
          v-if="dictsUnselected.length > 0"
          @click="isShowAddDictsPanel = true"
        >{{ $t('opt:dicts_btn_add') }}</button>

        <!--Modal 未选择词典列表-->
        <transition name="fade">
          <div class="modal show text-left" v-if="isShowAddDictsPanel">
            <div class="modal-dialog">
              <div class="modal-content">
                <div class="modal-header">
                  <button type="button" class="close" @click="isShowAddDictsPanel = false">&times;</button>
                  <h4 class="modal-title">{{ $t('opt:dicts_add_panel_title') }}</h4>
                </div>
                <div class="modal-body">
                  <div class="panel-group">
                    <transition-group name="panel-list">
                      <div class="panel panel-default panel-list" v-for="(id, i) in dictsUnselected" :key="id">
                        <div class="panel-list__header" @click="handleAddDict(id)">
                          <img class="panel-list__icon" :src="dictsPanelInfo[id].favicon">
                          <strong class="panel-list__title">{{ $t('dict:' + id) }}</strong>
                          <span class="panel-list__title-lang" v-if="+allDicts[id].lang[0]">{{ $t('opt:dict_panel_lang_en') }}</span>
                          <span class="panel-list__title-lang" v-if="+allDicts[id].lang[1]">{{ $t('opt:dict_panel_lang_zhs') }}</span>
                          <span class="panel-list__title-lang" v-if="+allDicts[id].lang[2]">{{ $t('opt:dict_panel_lang_zht') }}</span>
                          <button type="button" class="close">&#10004;</button>
                        </div>
                      </div>
                    </transition-group>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </transition><!--Modal 未选择词典列表-->
      </header>

      <!--已选择词典列表-->
      <div class="panel-group">
        <draggable v-model="dicts.selected" :options="{animation: 200}" @start="clearDictsHeight">
          <transition-group name="panel-list">
            <div class="panel-list panel panel-default" v-for="(id, i) in dicts.selected" :key="id">
              <!--词典名字与图标-->
              <div class="panel-list__header" @click="handlePanelHeadClick(id, i)">
                <img class="panel-list__icon" :src="dictsPanelInfo[id].favicon">
                <strong class="panel-list__title">{{ $t('dict:' + id) }}</strong>
                <span class="panel-list__title-lang" v-if="+allDicts[id].lang[0]">{{ $t('opt:dict_panel_lang_en') }}</span>
                <span class="panel-list__title-lang" v-if="+allDicts[id].lang[1]">{{ $t('opt:dict_panel_lang_zhs') }}</span>
                <span class="panel-list__title-lang" v-if="+allDicts[id].lang[2]">{{ $t('opt:dict_panel_lang_zht') }}</span>
                <button type="button" class="close" @click.stop="dicts.selected.splice(i, 1)">&times;</button>
              </div><!--词典名字与图标-->
              <div class="panel-list__body" ref="dict" :style="{height: dictsPanelInfo[id].height + 'px'}">
                <div class="panel-body" :id="`dict-${id}`">
                  <!--词典语言选项-->
                  <div class="checkbox">
                    <label class="checkbox-inline">
                      <input type="checkbox" v-model="allDicts[id].defaultUnfold"> {{ $t('opt:dict_default_unfold') }}
                    </label>
                    <label class="checkbox-inline">
                      <input type="checkbox" v-model="allDicts[id].selectionLang.chs"> {{ $t('opt:dict_show_when_chs') }}
                    </label>
                    <label class="checkbox-inline">
                      <input type="checkbox" v-model="allDicts[id].selectionLang.eng"> {{ $t('opt:dict_show_when_eng') }}
                    </label>
                  </div><!--词典语言选项-->

                  <!--词典默认高度选项-->
                  <div class="input-group">
                    <div class="input-group-addon">{{ $t('opt:dict_default_height') }}</div>
                    <input type="number" min="1" class="form-control" v-model.number.lazy="allDicts[id].preferredHeight">
                    <div class="input-group-addon">px</div>
                  </div><!--词典默认高度选项-->

                  <!--词典自定义选项-->
                  <div class="checkbox" v-if="allDicts[id].options">
                    <div v-for="(__, optKey) in allDicts[id].options" :key="optKey" class="checkbox" v-if="typeof allDicts[id].options[optKey] !== 'boolean'">
                      <div class="input-group">
                        <div class="input-group-addon">{{ $t(`dict:${id}_${optKey}`) }}</div>
                        <input type="number" min="0" class="form-control" v-model.number.lazy="allDicts[id].options[optKey]">
                        <div class="input-group-addon">{{ $t(`dict:${id}_${optKey}_unit`)  }}</div>
                      </div>
                    </div>
                    <label v-for="(__, optKey) in allDicts[id].options" :key="optKey" class="checkbox-inline" v-if="typeof allDicts[id].options[optKey] === 'boolean'">
                      <input type="checkbox" v-model="allDicts[id].options[optKey]"> {{ $t(`dict:${id}_${optKey}`) }}
                    </label>
                  </div><!--词典自定义选项-->
                </div>
              </div>
            </div>
            <div key='___'></div><!--An empty div to fix a tricky bug on draggable-->
          </transition-group>
        </draggable>
      </div><!--已选择词典列表-->
    </div>
    <div class="opt-item__description-wrap">
      <p class="opt-item__description" v-html="$t('opt:dicts_description')"></p>
    </div>
  </div><!-- 词典设置 -->
</template>

<script>
import Draggable from 'vuedraggable'
import appConfigFactory from '@/app-config'

export default {
  store: {
    dicts: 'config.dicts',
    allDicts: 'config.dicts.all',
    unlock: 'unlock',
    searchText: 'searchText',
  },
  watch: {
    dicts: {
      deep: true,
      handler () { this.searchText() },
    },
  },
  data () {
    const dictsPanelInfo = {}
    Object.keys(appConfigFactory().dicts.all).forEach(id => {
      dictsPanelInfo[id] = {
        favicon: require('@/components/dictionaries/' + id + '/favicon.png'),
        height: 0
      }
    })
    return {
      dictsPanelInfo,
      isShowAddDictsPanel: false
    }
  },
  computed: {
    dictsUnselected () {
      let selected = new Set(this.dicts.selected)
      let all = this.allDicts
      let ids = Object.keys(all)
      if (!this.unlock) {
        ids = ids.filter(id => !all[id].secret)
      }
      return ids.filter(id => !selected.has(id))
    }
  },
  methods: {
    clearDictsHeight () {
      // fold all dicts
      this.dicts.selected.forEach(id => {
        this.dictsPanelInfo[id].height = 0
      })
    },
    handleAddDict (id) {
      let selected = this.dicts.selected
      selected.push(id)
      if (Object.keys(this.dicts.all).length === selected.length) {
        this.isShowAddDictsPanel = false
      }
    },
    handlePanelHeadClick (id, i) {
      const el = document.querySelector(`#dict-${id}`)
      let height = this.dictsPanelInfo[id].height <= 0 && el ? el.offsetHeight : 0
      this.clearDictsHeight()
      this.dictsPanelInfo[id].height = height
    }
  },
  mounted () {
    // unfold the fisrt dictionary
    setTimeout(() => {
      this.handlePanelHeadClick(this.dicts.selected[0], 0)
    }, 1000)
  },
  components: {
    Draggable
  }
}
</script>
