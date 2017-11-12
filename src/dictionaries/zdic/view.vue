<template>
<section>
  <div class="dict-zdic" v-if="result">
    <div v-if="result.phsym" class="zdic-phsym">
      <div class="zdic-phsym-item" v-for="p in result.phsym">
        {{ p.pinyin }}
        <speaker v-if="p.pron" :src="p.pron"></speaker>
      </div>
    </div>
    <div v-if="result.html" class="zdic-defs" v-html="result.html"></div>
  </div>
</section>
</template>

<script>
import Speaker from 'src/components/Speaker'

export default {
  name: 'Zdic',
  props: ['result'],
  components: {
    Speaker
  },
  mounted () {
    console.log(JSON.stringify(this.result, null, '  '))
  }
}
</script>

<style lang="scss">
.dict-zdic {
  position: relative;
  padding: 10px;
}

.zdic-phsym {
  display: flex;
  margin-bottom: 5px;
}

.zdic-phsym-item {
  margin-right: 1em;
}

.zdic-defs {
  h1, h2, h3, p, hr {
    margin: 0;
  }

  p {
    margin-bottom: 1px;
  }

  h1, h2 {
    margin: 5px 0;
    font-size: 1.2em;
    border-bottom: 1px solid #ddd;
  }

  rbc {
    font-size: 1.2em;
    font-weight: bold;
    margin-right: 5px;
  }

  rtc {
    margin-right: 5px;
  }

  ol {
    margin: 0;
    padding: 0 0 0 1em;
  }

  li {
    margin-bottom: 2px;
  }

  .diczx1 {
    padding-left: 2em;
    color: #777;
  }

  .gc_sy,
  .gc_jy,
  .gc_yy,
  .gc_lz,
  .gc_yx,
  .gc_fy,
  .gc_jy {
    display: block;
  }

  .gc_yy,
  .gc_lz {
    color: #777;
  }

  .gc_jfy_i {
    background-color: #633;
    border-radius: 4px;
    color: white;
    font-size: 100%;
    line-height: 1;
    padding: 2px;
    margin-right: 5px;
  }

  .zdic-header {
    margin-top: 5px;
  }
}
</style>
