<template>
<section>
  <div class="guoyu-result" v-if="result">
    <div class="guoyu-h" v-for="h in result.h">
      <h1 class="guoyu-title" v-html="getHTML(result.t)"></h1>
      <span class="meodict-p">{{ h.p || '' }}</span>
      <speaker v-if="h['=']" :src="h['=']"></speaker>
      <ol class="guoyu-defs" v-if="h.d">
        <li v-for="defs in h.d">
          <p class="guoyu-defs__f" v-html="getHTML(defs.f)"></p>
          <p class="guoyu-defs__e" v-if="defs.e" v-for="example in defs.e" v-html="getHTML(example).replace('例⃝', '')"></p>
        </li>
      </ol>
    </div>
    <template v-if="result.translation">
      <div class="guoyu-trans" v-if="result.translation.English">
        <span class="guoyu-trans__pos">英.</span>
        <span class="guoyu-trans__def">{{ result.translation.English.join(', ') }}</span>
      </div>
      <div class="guoyu-trans" v-if="result.translation.francais">
        <span class="guoyu-trans__pos">法.</span>
        <span class="guoyu-trans__def">{{ result.translation.francais.join(', ') }}</span>
      </div>
      <div class="guoyu-trans" v-if="result.translation.Deutsch">
        <span class="guoyu-trans__pos">德.</span>
        <span class="guoyu-trans__def">{{ result.translation.Deutsch.join(', ') }}</span>
      </div>
    </template>
  </div>
</section>
</template>

<script>
import Speaker from '../Speaker'

export default {
  name: 'Guoyu',
  props: ['result'],
  methods: {
    getHTML (text) {
      if (!text) { return '' }
      return text.replace(/`(.*?)~/g, (__, word) => `<a class="guoyu-link" href="https://www.moedict.tw/${word}">${word}</a>`)
    }
  },
  components: {
    Speaker
  }
}
</script>

<style scoped>
.guoyu-result {
  padding: 10px;
}

.guoyu-h {
  margin-bottom: 10px;
}

.guoyu-title {
  display: inline;
  font-size: 1.6em;
  font-weight: normal;
  margin-right: 0.2em;
}

.guoyu-defs {
  margin: 0 0 10px;
  padding-left: 1.5em;
}

.guoyu-defs__f {
  margin: 0;
}

.guoyu-defs__e {
  margin: 0;
  color: #999;
}

.guoyu-trans {
  display: table;
}

.guoyu-trans__pos {
  display: table-cell;
  width: 2em;
  font-weight: bold;
  text-align: right;
}

.guoyu-trans__def {
  display: table-cell;
  padding: 0 12px;
}
</style>

<style>
.guoyu-link:link,
.guoyu-link:visited,
.guoyu-link:hover,
.guoyu-link:active {
  color: inherit;
  text-decoration: none;
}

.guoyu-link:hover {
  background: #16a085;
  outline: 3px solid #16a085;
  color: #fff;
}
</style>

