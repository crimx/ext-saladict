<template>
  <div id="opt-triple-ctrl" class="opt-item"><!-- 快捷查词 -->
    <div class="opt-item__header">
      <strong>{{ $t('opt:triple_ctrl_title') }}</strong>
    </div>
    <div class="opt-item__body">
      <div class="select-box-container">
        <label class="checkbox-inline">
          <input type="checkbox" v-model="tripleCtrl"> {{ $t('opt:triple_ctrl') }}
        </label>
        <transition name="fade">
          <span v-if="tripleCtrl">
            <label class="select-box">
              <span class="select-label">{{ $t('opt:triple_ctrl_loc_title') }}</span>
              <select class="form-control" v-model.number="tripleCtrlLocation">
                <option v-for="n in 9" :value="n - 1" :key="n">{{ $t(`opt:triple_ctrl_loc_${n-1}`) }}</option>
              </select>
            </label>
            <label class="select-box">
              <span class="select-label">{{ $t('opt:preload') }}</span>
              <select class="form-control" v-model="tripleCtrlPreload">
                <option value="">{{ $t('opt:none') }}</option>
                <option value="clipboard">{{ $t('opt:preload_clipboard') }}</option>
                <option value="selection">{{ $t('opt:preload_selection') }}</option>
              </select>
            </label>
            <label class="checkbox-inline">
              <input type="checkbox" v-model="tripleCtrlAuto"> {{ $t('opt:preload_auto') }}
            </label>
            <label class="checkbox-inline">
              <input type="checkbox" v-model="tripleCtrlStandalone"> {{ $t('opt:triple_ctrl_standalone') }}
            </label>
          </span>
        </transition>
      </div>
      <transition name="fade">
        <div v-if="tripleCtrl && tripleCtrlStandalone" class="checkbox">
          <div class="input-group">
            <div class="input-group-addon">{{ $t('opt:triple_ctrl_height') }}</div>
            <input type="number" min="50" class="form-control" v-model.number="tripleCtrlHeight">
            <div class="input-group-addon">px</div>
          </div>
          <label class="checkbox-inline">
            <input type="checkbox" v-model="tripleCtrlPageSel"> {{ $t('opt:triple_ctrl_page_selection') }}
          </label>
        </div>
      </transition>
      <transition name="fade">
        <div v-if="tripleCtrl && tripleCtrlStandalone && tripleCtrlPageSel">
          <div class="checkbox">
            <label class="checkbox-inline">
              <input type="checkbox" v-model="qsPanelMode.direct"> {{ $t('opt:mode_direct') }}
            </label>
            <label class="checkbox-inline">
              <input type="checkbox" v-model="qsPanelMode.double"> {{ $t('opt:mode_double') }}
            </label>
            <label class="checkbox-inline">
              <input type="checkbox" v-model="qsPanelMode.ctrl"> {{ $t('opt:mode_ctrl') }}
            </label>
            <label class="checkbox-inline">
              <input type="checkbox" v-model="qsPanelMode.instant.enable"> {{ $t('opt:mode_instant') }}
            </label>
          </div>
          <div class="input-group" v-if="qsPanelMode.double">
            <div class="input-group-addon">{{ $t('opt:mode_double_click_delay') }}</div>
            <input type="number" min="1" class="form-control" v-model.number="doubleClickDelay">
            <div class="input-group-addon">{{ $t('opt:unit_ms') }}</div>
          </div>
          <div class="instant-capture-container" v-if="qsPanelMode.instant.enable">
            <label class="select-box">
              <span class="select-label">{{ $t('opt:mode_instant_key') }}</span>
              <select class="form-control" v-model="qsPanelMode.instant.key">
                <option value="alt">{{ $t('opt:mode_instant_alt') }}</option>
                <option value="ctrl">{{ $t('opt:mode_instant_ctrl') }}</option>
                <option value="direct">{{ $t('opt:mode_instant_direct') }}</option>
              </select>
            </label>
            <div class="input-group instant-capture-delay">
              <div class="input-group-addon">{{ $t('opt:mode_instant_delay') }}</div>
              <input type="number" min="1" class="form-control" v-model.number="qsPanelMode.instant.delay">
              <div class="input-group-addon">{{ $t('opt:unit_ms') }}</div>
            </div>
          </div>
        </div>
      </transition>
    </div>
    <div class="opt-item__description-wrap">
      <p class="opt-item__description" v-html="$t('opt:triple_ctrl_description') + $t('opt:mode_explain')"></p>
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
    tripleCtrlStandalone: 'config.tripleCtrlStandalone',
    tripleCtrlHeight: 'config.tripleCtrlHeight',
    tripleCtrlPageSel: 'config.tripleCtrlPageSel',
    qsPanelMode: 'config.qsPanelMode',
  }
}
</script>
