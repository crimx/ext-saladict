<template>
<section>
  <div class="vocabulary-result" v-if="result">
    <div class="short" v-if="result.short">
      {{ result.short }}
    </div>
    <div class="long" v-if="result.long">
      {{ result.long }}
    </div>
  </div>
</section>
</template>

<script>
export default {
  name: 'Vocabulary',
  props: ['result']
}
</script>

<style scoped>
.vocabulary-result {
  padding: 10px;
}

.short {
  margin-bottom: 5px;
}

.long {
  padding-left: 5px;
  border-left: 2px solid #666;
}
</style>
