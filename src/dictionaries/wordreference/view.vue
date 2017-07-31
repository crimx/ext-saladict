<template>
<section>
  <div class="wordreference-result" v-if="result">
    <div class="etym" v-if="result.etym">
      {{ result.etym }}
    </div>
    <div class="idioms" v-if="result.idioms">
      <div class="idioms-item" v-for="idiom in result.idioms">
        {{ idiom }}
      </div>
    </div>
  </div>
</section>
</template>

<script>
export default {
  name: 'Wordreference',
  props: ['result']
}
</script>

<style scoped>
.wordreference-result {
  padding: 10px;
}

.etym {
  margin-bottom: 5px;
}

.idioms {
  padding-left: 5px;
  border-left: 2px solid #666;
}

.idioms-item {
  margin-bottom: 5px;
}
</style>
