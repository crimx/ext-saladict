<template>
  <div class="opt-item"><!-- 单词列表 -->
    <div class="opt-item__header">
      <strong>{{ $t('opt:word_list_title') }}</strong>
    </div>
    <div class="opt-item__body">
      <div class="checkbox">
        <label class="checkbox-inline">
          <input type="checkbox" v-model="searhHistory"> {{ $t('opt:word_list_history') }}
        </label>
      </div>
    </div>
    <div class="opt-item__description-wrap">
      <p class="opt-item__description" v-html="$t('opt:word_list_description')"></p>
    </div>
  </div><!-- 单词列表 -->
</template>

<script>
export default {
  store: {
    searhHistory: 'config.searhHistory',
  }
}
</script>
