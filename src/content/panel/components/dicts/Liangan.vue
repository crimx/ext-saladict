<template>
<section>
  <div class="liangan-result" v-if="result">
    <div class="liangan-h" v-for="h in result.h">
      <h1 class="liangan-title" v-html="getHTML(result.t)"></h1>
      <span class="meodict-p">{{ h.p || '' }}</span>
      <ol class="liangan-defs" v-if="h.d">
        <li v-for="defs in h.d">
          <p class="liangan-defs__f" v-html="getHTML(defs.f)"></p>
          <p class="liangan-defs__e" v-if="defs.e" v-for="example in defs.e" v-html="getHTML(example).replace('例⃝', '')"></p>
        </li>
      </ol>
    </div>
    <template v-if="result.translation">
      <div class="liangan-trans" v-if="result.translation.English">
        <span class="liangan-trans__pos">英.</span>
        <span class="liangan-trans__def">{{ result.translation.English.join(', ') }}</span>
      </div>
      <div class="liangan-trans" v-if="result.translation.francais">
        <span class="liangan-trans__pos">法.</span>
        <span class="liangan-trans__def">{{ result.translation.francais.join(', ') }}</span>
      </div>
      <div class="liangan-trans" v-if="result.translation.Deutsch">
        <span class="liangan-trans__pos">德.</span>
        <span class="liangan-trans__def">{{ result.translation.Deutsch.join(', ') }}</span>
      </div>
    </template>
  </div>
</section>
</template>

<script>
export default {
  name: 'Liangan',
  props: ['result'],
  methods: {
    getHTML (text) {
      if (!text) { return '' }
      return text.replace(/`(.*?)~/g, (__, word) => `<a class="liangan-link" href="https://www.moedict.tw/~${word}">${word}</a>`)
    }
  }
}
</script>

<style scoped>
.liangan-result {
  padding: 10px;
}

.liangan-h {
  margin-bottom: 10px;
}

.liangan-title {
  display: inline;
  font-size: 1.6em;
  font-weight: normal;
  margin-right: 0.2em;
}

.liangan-defs {
  margin: 0 0 10px;
  padding-left: 1.5em;
}

.liangan-defs__f {
  margin: 0;
}

.liangan-defs__e {
  margin: 0;
  color: #999;
}

.liangan-trans {
  display: table;
}

.liangan-trans__pos {
  display: table-cell;
  width: 2em;
  font-weight: bold;
  text-align: right;
}

.liangan-trans__def {
  display: table-cell;
  padding: 0 12px;
}
</style>

<style>
.liangan-link:link,
.liangan-link:visited,
.liangan-link:hover,
.liangan-link:active {
  color: inherit;
  text-decoration: none;
}

.liangan-link:hover {
  background: #16a085;
  outline: 3px solid #16a085;
  color: #fff;
}
</style>
