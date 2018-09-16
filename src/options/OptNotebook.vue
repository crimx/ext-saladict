<template>
  <div id="opt-notebook" class="opt-item"><!-- 生词本相关 -->
    <div class="opt-item__header">
      <strong>{{ $t('opt:notebook_title') }}</strong>
    </div>
    <div class="opt-item__body">
      <div class="checkbox">
        <label class="checkbox-inline">
          <input type="checkbox" v-model="editOnFav"> {{ $t('opt:edit_on_fav') }}
        </label>
      </div>
    </div>
    <div class="opt-item__description-wrap">
      <p class="opt-item__description" v-html="$t('opt:notebook_description')"></p>
    </div>
  </div><!-- 生词本相关 -->
</template>

<script>
export default {
  store: {
    editOnFav: 'config.editOnFav',
  },
}
</script>

