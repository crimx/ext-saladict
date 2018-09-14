<template>
  <div id="opt-privacy" class="opt-item"><!-- 用户隐私 -->
    <div class="opt-item__header">
      <strong>{{ $t('opt:privacy_title') }}</strong>
    </div>
    <div class="opt-item__body">
      <div class="checkbox">
        <label class="checkbox-inline">
          <input type="checkbox" v-model="searhHistory"> {{ $t('opt:word_list_history') }}
        </label>
        <transition name="fade">
          <label class="checkbox-inline" v-if="searhHistory">
            <input type="checkbox" v-model="searhHistoryInco"> {{ $t('opt:word_list_historyinco') }}
          </label>
        </transition>
      </div>
    </div>
    <div class="opt-item__description-wrap">
      <p class="opt-item__description" v-html="$t('opt:privacy_description')"></p>
    </div>
  </div><!-- 用户隐私 -->
</template>

<script>
export default {
  store: {
    searhHistory: 'config.searhHistory',
    searhHistoryInco: 'config.searhHistoryInco',
  },
}
</script>

