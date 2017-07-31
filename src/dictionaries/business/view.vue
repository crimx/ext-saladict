<template>
<section>
  <div class="dict-business" v-if="result">
    <div v-html="result"></div>
  </div>
</section>
</template>

<script>
export default {
  name: 'Business',
  props: ['result']
}
</script>

<style lang="scss">
.dict-business {
  padding: 10px;

  .SubEntry,
  .EXAMPLE,
  .Sense {
    display: block;
  }

  .HWD,
  .FIELD,
  .FIELDXX {
    display: none;
  }

  .HYPHENATION {
    font-size: 160%;
  }

  .POS,
  .sensenum,
  .GRAM,
  .EXPR,
  .LEXUNIT,
  .COLLOINEXA,
  .HYPHENATION {
    font-weight: bold;
  }

  .GEO {
    font-weight: normal;
  }

  .COLLOINEXA,
  .GEO {
    font-style: italic;
  }

  .GRAM {
    color: #16a085;
  }

  .GEO,
  .GLOSS {
    color: #999;
  }

  .sensenum {
    margin-right: 5px;
    margin-left: 3px;
  }

  .EXAMPLE {
    margin-bottom: 5px;
    padding-left: 10px;
    color: #555;
  }

  a:link,
  a:visited,
  a:hover,
  a:active {
    margin-right: 0.5em;
    text-decoration: none;
    outline: none;
    color: #f9690e;
  }

  .SubEntry {
    color: #999;
    margin-left: 10px;

    &:last-child {
      margin-bottom: 5px;
    }

    a:link,
    a:visited,
    a:hover,
    a:active {
      text-decoration: none;
      outline: none;
      color: #999;
    }
  }
}
</style>
