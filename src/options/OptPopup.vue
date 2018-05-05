<template>
  <div class="opt-item"><!-- 右上弹框 -->
    <div class="opt-item__header">
      <strong>{{ $t('opt:popup_title') }}</strong>
    </div>
    <div class="opt-item__body">
      <div class="select-box-container">
        <label class="select-box">
          <span class="select-label">{{ $t('opt:preload') }}</span>
          <select class="form-control" v-model="baPreload">
            <option value="">{{ $t('opt:none') }}</option>
            <option value="clipboard">{{ $t('opt:preload_clipboard') }}</option>
            <option value="selection">{{ $t('opt:preload_selection') }}</option>
          </select>
        </label>
        <label class="checkbox-inline">
          <input type="checkbox" v-model="baAuto"> {{ $t('opt:preload_auto') }}
        </label>
      </div>
    </div>
    <div class="opt-item__description-wrap">
      <p class="opt-item__description" v-html="$t('opt:popup_description')"></p>
    </div>
  </div><!-- 右上弹框 -->
</template>

<script>
export default {
  store: {
    baPreload: 'config.baPreload',
    baAuto: 'config.baAuto',
  }
}
</script>
