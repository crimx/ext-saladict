<template>
  <div class="opt-item"><!-- 开启查词 -->
    <div class="opt-item__header">
      <strong>{{ $t('opt:preference_title') }}</strong>
    </div>
    <div class="opt-item__body">
      <div class="checkbox">
        <label class="checkbox-inline">
          <input type="checkbox" v-model="animation"> {{ $t('opt:animation') }}
        </label>
        <label class="checkbox-inline">
          <input type="checkbox" v-model="noTypeField"> {{ $t('opt:no_type_field') }}
        </label>
      </div>
    </div>
    <div class="opt-item__description-wrap">
      <p class="opt-item__description" v-html="$t('opt:preference_description')"></p>
    </div>
  </div><!-- 开启查词 -->
</template>

<script>
export default {
  store: {
    animation: 'config.animation',
    noTypeField: 'config.noTypeField',
    searchText: 'searchText',
  },
  watch: {
    animation: function () { this.searchText() },
  },
}
</script>

