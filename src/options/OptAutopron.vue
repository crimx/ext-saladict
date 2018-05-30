<template>
  <div class="opt-item"><!-- 自动发音 -->
    <div class="opt-item__header">
      <strong>{{ $t('opt:autopron_title') }}</strong>
    </div>
    <div class="opt-item__body">
       <div class="select-box-container">
          <label class="select-box">
            <span class="select-label">{{ $t('opt:autopron_cn') }}</span>
            <select class="form-control" v-model="autopron.cn.dict">
              <option value="">{{ $t('opt:none') }}</option>
              <option v-for="id in autopron.cn.list" :value="id" :key="id">{{ $t('dict:' + id) }}</option>
            </select>
          </label>
          <label class="select-box">
            <span class="select-label">{{ $t('opt:autopron_en') }}</span>
            <select class="form-control" v-model="autopron.en.dict">
              <option value="">{{ $t('opt:none') }}</option>
              <option v-for="id in autopron.en.list" :value="id" :key="id">{{ $t('dict:' + id) }}</option>
            </select>
          </label>
          <transition name="fade">
            <label class="select-box" v-if="autopron.en.dict">
              <span class="select-label">{{ $t('opt:autopron_pref') }}</span>
              <select class="form-control" v-model="autopron.en.accent">
                <option value="uk">{{ $t('opt:autopron_uk') }}</option>
                <option value="us">{{ $t('opt:autopron_us') }}</option>
              </select>
            </label>
          </transition>
       </div>
    </div>
    <div class="opt-item__description-wrap">
      <p class="opt-item__description" v-html="$t('opt:autopron_description')"></p>
    </div>
  </div><!-- 自动发音 -->
</template>

<script>
export default {
  store: {
    autopron: 'config.autopron',
    searchText: 'searchText',
  },
  watch: {
    autopron: {
      deep: true,
      handler () { this.searchText() },
    },
  },
}
</script>
