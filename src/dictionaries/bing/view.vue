<template>
<section>
  <div class="dict-bing" v-if="result">
    <div class="lex-result" v-if="result.type === 'lex'">
      <div class="phsym" v-if="result.phsym">
        <div class="phsym-item" v-for="p in result.phsym">
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
        <div class="inf-item" v-for="f in ['s', 'pl', 'pt', 'pp', 'prp', '3pps']" v-if="result.inf[f]">
          {{ result.inf[f].tense }}: {{ result.inf[f].word }}
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
import Speaker from 'src/components/Speaker'

export default {
  name: 'Bing',
  props: ['result'],
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
