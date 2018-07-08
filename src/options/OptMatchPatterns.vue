<template>
  <div class="opt-item"><!-- 黑白名单 -->
    <div class="opt-item__header">
      <strong>{{ $t('opt:match_pattern_title') }}</strong>
    </div>
    <div class="opt-item__body">
      <div class="select-box-container">
        <button type="button" class="btn btn-default" @click="liststate = 'blacklist'">{{ $t('opt:match_pattern_blacklist') }}</button>
        <button type="button" class="btn btn-default" @click="liststate = 'whitelist'">{{ $t('opt:match_pattern_whitelist') }}</button>
      </div>
      <transition name="fade">
        <match-pattern-editor :list="blacklist" liststate="blacklist" @close="close" @save="save" v-if="liststate === 'blacklist'" />
        <match-pattern-editor :list="whitelist" liststate="whitelist" @close="close" @save="save" v-else-if="liststate === 'whitelist'" />
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
    blacklist: 'config.blacklist',
    whitelist: 'config.whitelist',
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
        this[this.liststate] = data
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
