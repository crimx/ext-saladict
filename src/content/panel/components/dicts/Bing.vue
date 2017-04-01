<template>
<section>
  <div class="dict-bing" v-if="result">
    <div class="lex-result" v-if="result.type === 'lex'">
      <div class="phsym" v-if="phsym">
        <div class="phsym-item" v-for="p in phsym">
          {{ `${p.lang}: ${p.al}` }}
          <speaker :src="p.pron" :width="18" :height="18"></speaker>
        </div>
      </div> <!--phsym-->
      <div class="cdef" v-if="result.cdef">
        <div class="cdef-item" v-for="d in result.cdef">
          <div class="cdef-item-pos">{{ d.pos + '.' }}</div>
          <div class="cdef-item-def">{{ d.def }}</div>
        </div>
      </div>
    </div> <!--lex-->
    <div class="machine-result" v-if="result.type === 'machine'">
      {{ result.mt }}
    </div>
  </div>
</section>
</template>

<script>
import Speaker from '../Speaker'

export default {
  name: 'Bing',
  props: ['result'],
  computed: {
    phsym () {
      if (this.result.phsym) {
        return this.result.phsym.map(p => {
          p.lang = chrome.i18n.getMessage(p.lang)
          return p
        })
      }
      return null
    }
  },
  components: {
    Speaker
  }
}
</script>

<style lang="scss" scoped>
.dict-bing {
  padding: 10px;
  font-size: 14px;
  line-height: 1.6;
  color: #333;
}

.phsym {
  display: flex;
  margin-bottom: 5px;
}

.phsym-item {
  margin-right: 1em;
}

.cdef-item {
  display: table;
}

.cdef-item-pos {
  display: table-cell;
  width: 3em;
  font-weight: bold;
  text-align: right;
}

.cdef-item-def {
  display: table-cell;
  padding: 0 12px;
}
</style>
