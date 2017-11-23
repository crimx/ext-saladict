<template>
  <div class="opt-item"><!-- 快捷查词 -->
    <div class="opt-item__header">
      <strong>{{ i18n('opt_triple_ctrl_title') }}</strong>
    </div>
    <div class="opt-item__body">
      <div class="checkbox">
        <label>
          <input type="checkbox" v-model="tripleCtrl"> {{ i18n('opt_triple_ctrl') }}
        </label>
      </div>
    </div>
    <div class="opt-item__description-wrap">
      <p class="opt-item__description" v-html="i18n('opt_triple_ctrl_description')"></p>
    </div>
  </div><!-- 快捷查词 -->
</template>

<script>
export default {
  store: {
    tripleCtrl: 'config.tripleCtrl',
    i18n: 'i18n'
  }
}
</script>
