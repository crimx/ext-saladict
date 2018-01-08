<template>
<section>
  <div class="dict-bing" v-if="result">
    <div class="lex-result" v-if="result.type === 'lex'">
      <div class="title">{{ result.title }}</div>
      <div class="phsym" v-if="result.phsym">
        <div class="phsym-item" v-for="p in result.phsym">
          {{ p.lang }}
          <speaker v-if="p.pron" :src="p.pron"></speaker>
        </div>
      </div> <!--phsym-->

      <div class="cdef" v-if="result.cdef">
        <div class="cdef-item" v-for="d in result.cdef">
          <div class="cdef-item-pos">{{ d.pos }}</div>
          <div class="cdef-item-def">{{ d.def }}</div>
        </div>
      </div> <!--cdef-->

      <div class="inf" v-if="result.infs">
        词形：
        <div class="inf-item" v-for="inf in result.infs">
          {{ inf }}
        </div>
      </div>

      <div class="sentence">
        <div class="sentence-item" v-for="sen in result.sentences">
          <div class="sentence-body">
            <p v-if="sen.en">{{ sen.en }} <speaker v-if="sen.mp3" :src="sen.mp3"></speaker></p>
            <p v-if="sen.chs">{{ sen.chs }}</p>
          </div>
          <footer class="sentence-source" v-if="sen.source">
            {{ sen.source }}
          </footer>
        </div>
      </div>
    </div> <!--lex-->

    <div class="machine-result" v-else-if="result.type === 'machine'">
      {{ result.mt }}
    </div> <!--machine-->

    <div class="related-result" v-else-if="result.type === 'related'">
      <h2 class="related-title">{{ result.title }}</h2>
      <template v-for="def in result.defs">
        <h2 class="def-title">{{ def.title }}</h2>
        <div class="meaning-list" v-for="meaning in def.meanings">
          <a class="meaning-word" :href="meaning.href">{{ meaning.word }}</a>
          <span class="meaning-def">{{ meaning.def }}</span>
        </div>
      </template>
    </div> <!--machine-->

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

.title {
  font-size: 1.3em;
  font-weight: bold;
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
  margin-bottom: 5px;
  font-size: 12px;
  color: #777;
}

.inf-item {
  margin-right: 1em;
}

.sentence-item {
  margin-bottom: 10px;
}

.sentence-body p {
  margin: 0;
}

.sentence-source {
  color: #999;
}

.related-title {
  font-size: 1em;
  margin: 5px 0;
}

.def-title {
  font-size: 1.2em;
  margin: 5px 0 0 0;
}

.meaning-list {
  display: table;
  margin-bottom: 2px;
}

.meaning-word {
  display: table-cell;
  width: 8em;
  text-align: right;
  cursor: pointer;
  text-decoration: none;
  color: #16a085 !important;
}

.meaning-def {
  display: table-cell;
  padding: 0 12px;
}
</style>
