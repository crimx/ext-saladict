<template>
  <div class="opt-item"><!-- 单词列表 -->
    <div class="opt-item__header">
      <strong>{{ i18n('opt_word_list_title') }}</strong>
    </div>
    <div class="opt-item__body">
      <div class="checkbox">
        <label class="checkbox-inline">
          <input type="checkbox" v-model="searhHistory"> {{ i18n('opt_word_list_history') }}
        </label>
        <label class="checkbox-inline">
          <input type="checkbox" v-model="newWordSound"> {{ i18n('opt_word_list_notebook') }}
        </label>
      </div>
    </div>
    <div class="opt-item__description-wrap">
      <p class="opt-item__description" v-html="i18n('opt_word_list_description')"></p>
    </div>
  </div><!-- 单词列表 -->
</template>

<script>
export default {
  store: {
    searhHistory: 'config.searhHistory',
    newWordSound: 'config.newWordSound',
    i18n: 'i18n'
  }
}
</script>
