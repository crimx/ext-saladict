<template>
<section>
  <div class="dict-cobuild" v-if="result">
    <div class="cobuild-pron">
      <span class="cobuild-pron-item"
        v-if="result.prons"
        v-for="pron in result.prons"
      >{{ pron.phsym }} <speaker v-if="pron.audio" :src="pron.audio"></speaker></span>
    </div>
    <div class="cobuild-rate" v-if="result.star >= 0 || result.level">
      <star-rates :rate="result.star" :width="15" :gutter="4"></star-rates>
      <span class="cobuild-level">{{ result.level }}</span>
    </div>
    <ol class="cobuild-defs" v-if="result.defs">
      <li class="cobuild-def" v-for="def in result.defs" v-html="def"></li>
    </ol>
  </div>
</section>
</template>

<script>
import Speaker from 'src/components/Speaker'
import StarRates from 'src/components/StarRates'

export default {
  name: 'Cobuild',
  props: ['result'],
  components: {
    StarRates,
    Speaker
  }
}
</script>

<style lang="scss">
.dict-cobuild {
  padding: 10px;
}

.cobuild-pron {
  margin-bottom: 5px;
}

.cobuild-pron-item {
  margin-right: 5px;
}

.cobuild-rate {
  display: flex;
  margin-bottom: 5px;
}

.cobuild-level {
  margin-left: 10px;
  color: #aaa;
}

.cobuild-defs {
  margin: 0;
  padding-left: 15px;
}

.cobuild-def {
  p {
    margin: 0;
  }

  b {
    color: #f9690e;
  }

  .prep-en {
    display: block;
    color: #777;
    margin-bottom: 5px;
  }

  .text-sentence {
    padding-left: 10px;
    padding-bottom: 5px;
    color: #333;
    border-left: #ddd solid 2px;

    &:last-child {
      padding-bottom: 0;
      margin-bottom: 10px;
    }
  }
}
</style>
