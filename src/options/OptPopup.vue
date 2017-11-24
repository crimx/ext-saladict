<template>
  <div class="opt-item"><!-- 右上弹框 -->
    <div class="opt-item__header">
      <strong>{{ i18n('opt_popup_title') }}</strong>
    </div>
    <div class="opt-item__body">
      <div class="select-box-container">
        <label class="select-box">
          <span class="select-label">{{ i18n('opt_preload') }}</span>
          <select class="form-control" v-model="baPreload">
            <option value="">{{ i18n('opt_none') }}</option>
            <option value="clipboard">{{ i18n('opt_preload_clipboard') }}</option>
            <option value="selection">{{ i18n('opt_preload_selection') }}</option>
          </select>
        </label>
        <label class="checkbox-inline">
          <input type="checkbox" v-model="baAuto"> {{ i18n('opt_preload_auto') }}
        </label>
      </div>
    </div>
    <div class="opt-item__description-wrap">
      <p class="opt-item__description" v-html="i18n('opt_popup_description')"></p>
    </div>
  </div><!-- 右上弹框 -->
</template>

<script>
export default {
  store: {
    baPreload: 'config.baPreload',
    baAuto: 'config.baAuto',
    i18n: 'i18n'
  }
}
</script>
