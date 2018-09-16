<template>
  <div id="opt-match-patterns" class="opt-item"><!-- 黑白名单 -->
    <div class="opt-item__header">
      <strong>{{ $t('opt:match_pattern_title') }}</strong>
    </div>
    <div class="opt-item__body">
      <div class="select-box-container">
        <button type="button" class="btn btn-default" @click="liststate = 'blacklist'">{{ $t('opt:match_pattern_blacklist') }}</button>
        <button type="button" class="btn btn-default" @click="liststate = 'whitelist'">{{ $t('opt:match_pattern_whitelist') }}</button>
        <button type="button" class="btn btn-default" @click="liststate = 'pdfBlacklist'">{{ $t('opt:match_pattern_pdfBlacklist') }}</button>
        <button type="button" class="btn btn-default" @click="liststate = 'pdfWhitelist'">{{ $t('opt:match_pattern_pdfWhitelist') }}</button>
      </div>
      <transition name="fade">
        <match-pattern-editor :list="config[liststate]" :liststate="liststate" @close="close" @save="save" v-if="liststate" />
      </transition>
    </div>
    <div class="opt-item__description-wrap">
      <p class="opt-item__description" v-html="$t('opt:match_pattern_description')"></p>
    </div>
  </div><!-- 黑白名单 -->
</template>

<script>
import MatchPatternEditor from './MatchPatternEditor'

export default {
  store: {
    config: 'config',
  },
  data () {
    return {
      liststate: ''
    }
  },
  methods: {
    close (changed) {
      if (changed) {
        if (window.confirm(this.$t('opt:changes_not_saved'))) {
          this.liststate = ''
        }
      } else {
        this.liststate = ''
      }
    },
    save (data) {
      if (this.liststate) {
        this.config[this.liststate] = data
        this.liststate = ''
      } else if (process.env.NODE_ENV !== 'production') {
        console.warn('match pattern list state not matching')
      }
    }
  },
  components: {
    MatchPatternEditor
  },
}
</script>
