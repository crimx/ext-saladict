<template>
  <div id="opt-pin-mode" class="opt-item"><!-- 钉住查词-->
    <div class="opt-item__header">
      <strong>{{ $t('opt:pinmode_title') }}</strong>
    </div>
    <div class="opt-item__body">
      <div class="checkbox">
        <label class="checkbox-inline">
          <input type="checkbox" v-model="pinMode.direct"> {{ $t('opt:mode_direct') }}
        </label>
        <label class="checkbox-inline">
          <input type="checkbox" v-model="pinMode.double"> {{ $t('opt:mode_double') }}
        </label>
        <label class="checkbox-inline">
          <input type="checkbox" v-model="holding"> {{ $t('opt:mode_holding') }}
        </label>
        <label class="checkbox-inline">
          <input type="checkbox" v-model="pinMode.instant.enable"> {{ $t('opt:mode_instant') }}
        </label>
      </div>
      <div v-if="holding">
        <span>{{ $t('opt:mode_holding_subtitle') }}</span>
        <label class="checkbox-inline">
          <input type="checkbox" v-model="pinMode.holding.shift"> {{ $t('opt:mode_holding_shift') }}
        </label>
        <label class="checkbox-inline">
          <input type="checkbox" v-model="pinMode.holding.ctrl"> {{ $t('opt:mode_holding_ctrl') }}
        </label>
        <label class="checkbox-inline">
          <input type="checkbox" v-model="pinMode.holding.meta"> {{ $t('opt:mode_holding_meta') }}
        </label>
      </div>
      <div class="input-group" v-if="pinMode.double">
        <div class="input-group-addon">{{ $t('opt:mode_double_click_delay') }}</div>
        <input type="number" min="1" class="form-control" v-model.number="doubleClickDelay">
        <div class="input-group-addon">{{ $t('opt:unit_ms') }}</div>
      </div>
      <div class="instant-capture-container" v-if="pinMode.instant.enable">
        <label class="select-box">
          <span class="select-label">{{ $t('opt:mode_instant_key') }}</span>
          <select class="form-control" v-model="pinMode.instant.key">
            <option value="alt">{{ $t('opt:mode_instant_alt') }}</option>
            <option value="ctrl">{{ $t('opt:mode_instant_ctrl') }}</option>
            <option value="direct">{{ $t('opt:mode_instant_direct') }}</option>
          </select>
        </label>
        <div class="input-group instant-capture-delay">
          <div class="input-group-addon">{{ $t('opt:mode_instant_delay') }}</div>
          <input type="number" min="1" class="form-control" v-model.number="pinMode.instant.delay">
          <div class="input-group-addon">{{ $t('opt:unit_ms') }}</div>
        </div>
      </div>
    </div>
    <div class="opt-item__description-wrap">
      <p class="opt-item__description" v-html="$t('opt:pinmode_description') + $t('opt:mode_explain')"></p>
    </div>
  </div><!-- 钉住查词-->
</template>

<script>
export default {
  store: {
    pinMode: 'config.pinMode',
    doubleClickDelay: 'config.doubleClickDelay',
  },
  data () {
    const { holding } = this.$store.config.pinMode
    return {
      holding: holding.shift || holding.ctrl || holding.meta
    }
  },
  watch: {
    holding (val) {
      const { holding } = this.$store.config.pinMode
      holding.shift = val
      holding.ctrl = val
      holding.meta = val
    }
  },
}
</script>
