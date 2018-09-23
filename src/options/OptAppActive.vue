<template>
  <div id="opt-app-active" class="opt-item"><!-- 开启查词 -->
    <div class="opt-item__header">
      <strong>{{ $t('opt:app_active_title') }}</strong>
    </div>
    <div class="opt-item__body">
      <div class="checkbox">
        <label class="checkbox-inline">
          <input type="checkbox" v-model="active"> {{ $t('opt:app_active') }}
        </label>
        <label class="checkbox-inline">
          <input type="checkbox" v-model="pdfSniff"> {{ $t('opt:pdf_sniff') }}
        </label>
        <button v-if="isChrome" type="button" class="btn btn-default btn-xs" @click="openShortkey">{{ $t('opt:set_shortkey') }}</button>
      </div>
    </div>
    <div class="opt-item__description-wrap">
      <p class="opt-item__description" v-html="$t('opt:app_active_description')"></p>
    </div>
  </div><!-- 开启查词 -->
</template>

<script>
import { openURL } from '@/_helpers/browser-api'

export default {
  store: {
    active: 'config.active',
    pdfSniff: 'config.pdfSniff',
  },
  data () {
    return {
      // @todo wait for firefox https://bugzilla.mozilla.org/show_bug.cgi?id=1303384
      isChrome: navigator.userAgent.indexOf('Chrome') !== -1
    }
  },
  methods: {
    openShortkey () {
      openURL('chrome://extensions/shortcuts')
    }
  },
}
</script>

