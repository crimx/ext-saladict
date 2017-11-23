<template>
  <div class="opt-item"><!-- 开启查词 -->
    <div class="opt-item__header">
      <strong>{{ i18n('opt_app_active_title') }}</strong>
    </div>
    <div class="opt-item__body">
      <div class="checkbox">
        <label>
          <input type="checkbox" v-model="active"> {{ i18n('opt_app_active') }}
        </label>
      </div>
    </div>
    <div class="opt-item__description-wrap">
      <p class="opt-item__description" v-html="i18n('opt_app_active_description')"></p>
    </div>
  </div><!-- 开启查词 -->
</template>

<script>
export default {
  store: {
    active: 'config.active',
    i18n: 'i18n'
  }
}
</script>

