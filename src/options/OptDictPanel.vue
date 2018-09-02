<template>
  <div class="opt-item"><!-- 查词面板 -->
    <div class="opt-item__header">
      <strong>{{ $t('opt:dict_panel_title') }}</strong>
    </div>
    <div class="opt-item__body">
      <div class="select-box-container">
         <label class="select-box">
           <span class="select-label">{{ $t('opt:mta_auto_unfold') }}</span>
           <select class="form-control" v-model="mtaAutoUnfold">
             <option value="">{{ $t('opt:never') }}</option>
             <option value="once">{{ $t('opt:mta_once') }}</option>
             <option value="always">{{ $t('opt:mta_always') }}</option>
             <option value="popup">{{ $t('opt:popup_title') }}</option>
           </select>
         </label>
      </div>
      <div class="input-group">
        <div class="input-group-addon">{{ $t('opt:dict_panel_height_ratio') }}</div>
        <input type="number" step="1" min="10" max="90" class="form-control"
          @change="handleRatioChange('panelMaxHeightRatio', 10, 90, $event.target.value)"
          :value="panelMaxHeightRatio * 100"
        >
        <div class="input-group-addon">%</div>
      </div>
      <div class="input-group">
        <div class="input-group-addon">{{ $t('opt:dict_panel_width') }}</div>
        <input type="number" step="1" min="50" max="1000" class="form-control"
          @change="handleNumChange('panelWidth', 50, 1000, $event.target.value)"
          :value="panelWidth"
        >
        <div class="input-group-addon">px</div>
      </div>
      <div class="input-group">
        <div class="input-group-addon">{{ $t('opt:dict_panel_font_size') }}</div>
        <input type="number" step="1" min="12" max="20" class="form-control"
          @change="handleNumChange('fontSize', 12, 20, $event.target.value)"
          :value="fontSize"
        >
        <div class="input-group-addon">px</div>
      </div>
    </div>
    <div class="opt-item__description-wrap">
      <p class="opt-item__description" v-html="$t('opt:dict_panel_description')"></p>
    </div>
  </div><!-- 查词面板 -->
</template>

<script>
export default {
  store: {
    mtaAutoUnfold: 'config.mtaAutoUnfold',
    panelWidth: 'config.panelWidth',
    panelMaxHeightRatio: 'config.panelMaxHeightRatio',
    fontSize: 'config.fontSize',
    searchText: 'searchText',
  },
  watch: {
    mtaAutoUnfold: function () { this.searchText() },
    panelMaxHeightRatio: function () { this.searchText() },
    fontSize: function () { this.searchText() },
  },
  methods: {
    handleNumChange (target, min, max, value) {
      value = Math.floor(Number(value))
      // trigger update
      this[target] = value

      if (value < min) {
        this[target] = min
      } else if (value > max) {
        this[target] = max
      }
    },
    handleRatioChange (target, min, max, value) {
      value = Number(value)
      // trigger update
      this[target] = value / 100

      if (value < min) {
        this[target] = min / 100
      } else if (value > max) {
        this[target] = max / 100
      }
    }
  },
}
</script>
