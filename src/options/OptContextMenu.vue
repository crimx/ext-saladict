<template>
  <div class="opt-item"><!-- 右键菜单 -->
    <div class="opt-item__header">
      <strong>{{ i18n('opt_context_title') }}</strong>
    </div>
    <div class="opt-item__body">
      <header class="panel-list__add">
        <button type="button" class="btn btn-default btn-xs"
          v-if="contextUnselected.length > 0"
          @click="isShowAddContextPanel = true"
        >{{ i18n('opt_dicts_btn_add') }}</button>

        <!--Modal 未选择右键菜单列表-->
        <transition name="fade">
          <div class="modal show text-left" v-if="isShowAddContextPanel">
            <div class="modal-dialog">
              <div class="modal-content">
                <div class="modal-header">
                  <button type="button" class="close" @click="isShowAddContextPanel = false">&times;</button>
                  <h4 class="modal-title">{{ i18n('opt_context_add_panel_title') }}</h4>
                </div>
                <div class="modal-body">
                  <div class="panel-group">
                    <transition-group name="panel-list">
                      <div class="panel-list panel panel-default" v-for="(id, i) in contextUnselected" :key="id">
                        <div class="panel-list__header" @click="handleAddContext(id)">
                          <strong class="panel-list__title">{{ i18n('context_' + id) }}</strong>
                          <button type="button" class="close">&#10004;</button>
                        </div>
                      </div>
                    </transition-group>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </transition><!--Modal 未选择右键菜单列表-->
      </header>

      <!--已选择右键菜单列表-->
      <div class="panel-group">
        <draggable v-model="contextMenu.selected" :options="{animation: 200}">
          <transition-group name="panel-list">
            <div class="panel-list panel panel-default" v-for="(id, i) in contextMenu.selected" :key="id">
              <div class="panel-list__header">
                <strong class="panel-list__title">{{ i18n('context_' + id) }}</strong>
                <button type="button" class="close" @click.stop="contextMenu.selected.splice(i, 1)">&times;</button>
              </div>
            </div>
            <div key='___'></div><!--An empty div to fix a tricky bug on draggable-->
          </transition-group>
        </draggable>
      </div><!--已选择右键菜单列表-->
    </div>
    <div class="opt-item__description-wrap">
      <p class="opt-item__description" v-html="i18n('opt_context_description')"></p>
    </div>
  </div><!-- 右键菜单 -->
</template>

<script>
import Draggable from 'vuedraggable'

export default {
  store: {
    contextMenu: 'config.contextMenu',
    i18n: 'i18n'
  },
  data () {
    return {
      isShowAddContextPanel: false
    }
  },
  computed: {
    contextUnselected () {
      let selected = new Set(this.contextMenu.selected)
      return Object.keys(this.contextMenu.all).filter(id => !selected.has(id))
    }
  },
  methods: {
    handleAddContext (id) {
      let selected = this.contextMenu.selected
      selected.push(id)
      if (Object.keys(this.contextMenu.all).length === selected.length) {
        this.isShowAddContextPanel = false
      }
    }
  },
  components: {
    Draggable
  }
}
</script>
