<template>
<section>
  <div class="eudic-result" v-if="result">
    <div class="eudic-item" v-for="item in result">
      <div class="eudic-body">
        <p v-if="item.en">{{ item.en }} <speaker v-if="item.mp3" :src="item.mp3"></speaker></p>
        <p v-if="item.chs">{{ item.chs }}</p>
      </div>
      <footer class="eudic-channel">
        {{ item.channel || '' }}
      </footer>
    </div>
  </div>
</section>
</template>

<script>
import Speaker from '../Speaker'

export default {
  name: 'Eudic',
  props: ['result'],
  components: {
    Speaker
  }
}
</script>

<style scoped>
.eudic-result {
  padding: 10px;
}

.eudic-item {
  margin-bottom: 10px;
}

.eudic-cover {
  height: 1.2em;
  vertical-align: text-bottom;
}

.eudic-body p {
  margin: 0;
}

.eudic-channel {
  color: #999;
}

.eudic-channel::before {
  content: '《'
}

.eudic-channel::after {
  content: '》'
}
</style>
