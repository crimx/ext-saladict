<template>
  <div class="opt-item"><!-- 快捷查词 -->
    <div class="opt-item__header">
      <strong>{{ $i18n('opt_triple_ctrl_title') }}</strong>
    </div>
    <div class="opt-item__body">
      <div class="select-box-container">
        <label class="select-box">
          <span class="select-label">{{ $i18n('opt_preload') }}</span>
          <select class="form-control" v-model="tripleCtrlPreload">
            <option value="">{{ $i18n('opt_none') }}</option>
            <option value="clipboard">{{ $i18n('opt_preload_clipboard') }}</option>
            <option value="selection">{{ $i18n('opt_preload_selection') }}</option>
          </select>
        </label>
        <label class="checkbox-inline">
          <input type="checkbox" v-model="tripleCtrlAuto"> {{ $i18n('opt_preload_auto') }}
        </label>
        <label class="select-box">
          <span class="select-label">{{ $i18n('opt_triple_ctrl_loc_title') }}</span>
          <select class="form-control" v-model.number="tripleCtrlLocation">
            <option v-for="n in 9" :value="n - 1">{{ $i18n(`opt_triple_ctrl_loc_${n-1}`) }}</option>
          </select>
        </label>
        <label class="checkbox-inline">
          <input type="checkbox" v-model="tripleCtrl"> {{ $i18n('opt_triple_ctrl') }}
        </label>
      </div>
    </div>
    <div class="opt-item__description-wrap">
      <p class="opt-item__description" v-html="$i18n('opt_triple_ctrl_description')"></p>
    </div>
  </div><!-- 快捷查词 -->
</template>

<script>
export default {
  store: {
    tripleCtrl: 'config.tripleCtrl',
    tripleCtrlPreload: 'config.tripleCtrlPreload',
    tripleCtrlAuto: 'config.tripleCtrlAuto',
    tripleCtrlLocation: 'config.tripleCtrlLocation',
  }
}
</script>
