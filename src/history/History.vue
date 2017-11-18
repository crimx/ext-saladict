<template>
<div class="container">
  <template v-if="historyItems" v-for="item in historyItems">
    <div class="h" v-for="word in item.words">{{ word }}</div>
  </template>
</div>
</template>

<script>
import searchHistory from 'src/background/search-history'
import moment from 'moment'
let lang = chrome.i18n.getUILanguage().toLowerCase()
if (!/^(en|zh-cn|zh-tw|zh-hk)$/.test(lang)) {
  lang = 'en'
}
moment.locale(lang)

export default {
  data () {
    return {
      historyItems: [{
        date: '',
        words: []
      }]
    }
  },
  created () {
    searchHistory.getAll().then(items => { this.historyItems = items })
  }
}
</script>

<style lang="scss">
.container {
  background: #ddd;
}
</style>
