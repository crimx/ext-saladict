<template>
<section>
  <div class="google-result" v-if="result">
    {{ result }}
  </div>
</section>
</template>

<script>
export default {
  name: 'Google',
  props: ['result']
}
</script>

<style scoped>
.google-result {
  padding: 10px;
}
</style>
