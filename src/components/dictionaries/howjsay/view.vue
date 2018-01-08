<template>
<section>
  <div class="howjsay-result" v-if="result">
    <div class="current-word">
      <a :href="`http://www.howjsay.com/index.php?word=${result.currentWord.title}`"
       @mouseenter="play(result.currentWord)"
       @mouseleave="stop(result.currentWord)"
      >{{ result.currentWord.title }}</a>
      <speaker :src="result.currentWord.mp3"></speaker>
    </div>
    <div class="related-words" v-if="result.relatedWords">
      <a v-for="word in result.relatedWords"
       :href="`http://www.howjsay.com/index.php?word=${word.title}`"
       @mouseenter="play(word)"
       @mouseleave="stop(word)"
      >{{ word.title }}</a>
    </div>
  </div>
</section>
</template>

<script>
import Speaker from 'src/components/Speaker'

export default {
  name: 'Howjsay',
  data () {
    return {
      playingTimeouts: {}
    }
  },
  props: ['result'],
  methods: {
    play (word) {
      this.playingTimeouts[word.title] = setTimeout(() => {
        chrome.runtime.sendMessage({msg: 'AUDIO_PLAY', src: word.mp3})
      }, 500)
    },
    stop (word) {
      clearTimeout(this.playingTimeouts[word.title])
    }
  },
  components: {
    Speaker
  }
}
</script>

<style lang="scss" scoped>
.howjsay-result {
  padding: 10px;

  a,
  a:link,
  a:visited,
  a:hover,
  a:active {
    color: #16a085;
    text-decoration: none;
  }

  a+a::before {
    content: '|';
    padding: 0 0.5em;
  }
}
</style>
