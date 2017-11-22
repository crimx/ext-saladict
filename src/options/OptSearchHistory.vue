<template>
  <div class="opt-item"><!-- 搜索历史 -->
    <div class="opt-item__header">
      <strong>{{ i18n('opt_search_history_title') }}</strong>
    </div>
    <div class="opt-item__body">
      <div class="checkbox">
        <label>
          <input type="checkbox" v-model="searhHistory"> {{ i18n('opt_search_history') }}
        </label>
      </div>
    </div>
    <div class="opt-item__description-wrap">
      <p class="opt-item__description" v-html="i18n('opt_search_history_description')"></p>
    </div>
  </div><!-- 搜索历史 -->
</template>

<script>
export default {
  store: {
    searhHistory: 'config.searhHistory',
    i18n: 'i18n'
  }
}
</script>
