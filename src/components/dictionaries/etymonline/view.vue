<template>
<section>
  <div class="etymonline-result" v-if="result">
    <div class="etymonline-item" v-for="item in result">
      <h2 class="etymonline-title" v-html="item.title"></h2>
      <p class="etymonline-def" v-html="item.def"></p>
    </div>
  </div>
</section>
</template>

<script>
export default {
  name: 'Etymonline',
  props: ['result']
}
</script>

<style lang="scss">
.etymonline-result {
  padding: 10px;

  a:link,
  a:visited {
    color: #f9690e;
    text-decoration: none;
  }

  a:hover,
  a:active,
  a:focus {
    color: #f9690e;
    text-decoration: underline;
  }

  blockquote {
    margin: 0.5em 0;
    padding: 0 1em;
    font-style: italic;
    border-left: 2px solid #f9690e;
  }

  .foreign {
    font-style: italic;
  }

  .line-break {
    margin-bottom: 5px;
  }
}

.etymonline-item {
  margin: 10px 0;
}

.etymonline-title {
  margin: 0;
  font-size: 1em;
}

.etymonline-def {
  margin: 0;
}
</style>
