<template>
  <div id="opt-language" class="opt-item"><!-- 语言支持 -->
    <div class="opt-item__header">
      <strong>{{ $t('opt:language_title') }}</strong>
    </div>
    <div class="opt-item__body">
      <div class="select-box-container">
        <label class="select-box">
          <span class="select-label">{{ $t('opt:language') }}</span>
          <select class="form-control" v-model="langCode">
            <option value="zh-CN">简体中文</option>
            <option value="zh-TW">繁體中文</option>
            <option value="en">English</option>
          </select>
        </label>
        <label class="checkbox-inline">
          <input type="checkbox" v-model="chinese"> {{ $t('opt:language_chinese') }}
        </label>
        <label class="checkbox-inline">
          <input type="checkbox" v-model="english"> {{ $t('opt:language_english') }}
        </label>
        <label class="checkbox-inline">
          <input type="checkbox" v-model="minor"> {{ $t('opt:language_minor') }}
        </label>
      </div>
    </div>
    <div class="opt-item__description-wrap">
      <p class="opt-item__description" v-html="$t('opt:language_mode_description')"></p>
    </div>
  </div><!-- 语言支持 -->
</template>

<script>
export default {
  store: {
    chinese: 'config.language.chinese',
    english: 'config.language.english',
    minor: 'config.language.minor',
    langCode: 'config.langCode',
    searchText: 'searchText'
  },
  watch: {
    langCode: function () { this.searchText() },
  },
}
</script>
