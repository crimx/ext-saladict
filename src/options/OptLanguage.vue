<template>
  <div class="opt-item"><!-- 语言支持 -->
    <div class="opt-item__header">
      <strong>{{ $i18n('opt_language_title') }}</strong>
    </div>
    <div class="opt-item__body">
      <div class="checkbox">
        <label class="checkbox-inline">
          <input type="checkbox" v-model="chinese"> {{ $i18n('opt_language_chinese') }}
        </label>
        <label class="checkbox-inline">
          <input type="checkbox" v-model="english"> {{ $i18n('opt_language_english') }}
        </label>
      </div>
    </div>
    <div class="opt-item__description-wrap">
      <p class="opt-item__description" v-html="$i18n('opt_language_mode_description')"></p>
    </div>
  </div><!-- 语言支持 -->
</template>

<script>
export default {
  store: {
    chinese: 'config.language.chinese',
    english: 'config.language.english',
  }
}
</script>
