<template>
<section>
  <div class="dict-bing" v-if="result">
    <div class="lex-result" v-if="result.type === 'lex'">
      <div class="phsym" v-if="phsym">
        <div class="phsym-item" v-for="p in phsym">
          {{ `${p.lang}: ${p.al}` }}
          <speaker v-if="p.pron" :src="p.pron"></speaker>
        </div>
      </div> <!--phsym-->

      <div class="cdef" v-if="result.cdef">
        <div class="cdef-item" v-for="d in result.cdef">
          <div class="cdef-item-pos">{{ d.pos + '.' }}</div>
          <div class="cdef-item-def">{{ d.def }}</div>
        </div>
      </div> <!--cdef-->

      <div class="inf" v-if="result.inf">
        <div class="inf-item" v-if="inf.s">
          {{ inf.s.tense }}: {{ inf.s.word }}
        </div>
        <div class="inf-item" v-if="inf.pl">
          {{ inf.pl.tense }}: {{ inf.pl.word }}
        </div>
        <div class="inf-item" v-if="inf.pt">
          {{ inf.pt.tense }}: {{ inf.pt.word }}
        </div>
        <div class="inf-item" v-if="inf.pp">
          {{ inf.pp.tense }}: {{ inf.pp.word }}
        </div>
        <div class="inf-item" v-if="inf.prp">
          {{ inf.prp.tense }}: {{ inf.prp.word }}
        </div>
        <div class="inf-item" v-if="inf['3pps']">
          {{ inf['3pps'].tense }}: {{ inf['3pps'].word }}
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
          p.lang = chrome.i18n.getMessage(p.lang) || p.lang
          return p
        })
      }
      return null
    },
    inf () {
      if (this.result.inf) {
        let inf = this.result.inf
        let result = {}
        Object.keys(inf).forEach(i => {
          result[i] = {
            word: inf[i],
            tense: chrome.i18n.getMessage('inf_' + i)
          }
        })
        return result
      }
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
}

.phsym {
  display: flex;
  margin-bottom: 5px;
}

.phsym-item {
  margin-right: 1em;
}

.cdef {
  margin-bottom: 5px;
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

.inf {
  display: flex;
  flex-wrap: wrap;
  font-size: 12px;
  color: #777;
}

.inf-item {
  margin-right: 1em;
}
</style>
