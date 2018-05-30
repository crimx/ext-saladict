<template>
  <div class="opt-item"><!-- 开启查词 -->
    <div class="opt-item__header">
      <strong>{{ $t('opt:privacy_title') }}</strong>
    </div>
    <div class="opt-item__body">
      <div class="checkbox">
        <label class="checkbox-inline">
          <input type="checkbox" v-model="searhHistory"> {{ $t('opt:word_list_history') }}
        </label>
      </div>
    </div>
    <div class="opt-item__description-wrap">
      <p class="opt-item__description" v-html="$t('opt:privacy_description')"></p>
    </div>
  </div><!-- 开启查词 -->
</template>

<script>
export default {
  store: {
    searhHistory: 'config.searhHistory',
  },
}
</script>

