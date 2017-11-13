<template>
  <svg class="icon-speaker" viewBox="0 0 58 58" xmlns="http://www.w3.org/2000/svg"
    :width="width" :height="height"
    :class="{'icon-speaker--playing': isPlaying}"
    @mouseenter="handleMouseEnter"
    @mouseleave="handleMouseLeave"
    @click="handleClick"
  >
    <path class="icon-speaker__body" d="M14.35 20.237H5.77c-1.2 0-2.17.97-2.17 2.17v13.188c0 1.196.97 2.168 2.17 2.168h8.58c.387 0 .766.103 1.1.3l13.748 12.8c1.445.85 3.268-.192 3.268-1.87V9.006c0-1.677-1.823-2.72-3.268-1.87l-13.747 12.8c-.334.196-.713.3-1.1.3z" fill="#F9690E"/>
    <path class="icon-speaker__wave" d="M36.772 39.98c-.31 0-.62-.118-.856-.355-.476-.475-.476-1.243 0-1.716 5.212-5.216 5.212-13.702 0-18.916-.476-.473-.476-1.24 0-1.716.473-.474 1.24-.474 1.715 0 6.162 6.16 6.162 16.185 0 22.347-.234.237-.546.356-.858.356z" fill="#EFCE4A"/>
    <path class="icon-speaker__wave icon-speaker__wave2" d="M41.07 44.886c-.312 0-.62-.118-.86-.356-.473-.475-.473-1.24 0-1.715 7.573-7.57 7.573-19.89 0-27.462-.473-.474-.473-1.24 0-1.716.478-.473 1.243-.473 1.717 0 8.517 8.52 8.517 22.377 0 30.893-.238.238-.547.356-.857.356z" fill="#EFCE4A"/>
    <path class="icon-speaker__wave icon-speaker__wave3" d="M44.632 50.903c-.312 0-.622-.118-.858-.356-.475-.474-.475-1.24 0-1.716 5.287-5.283 8.198-12.307 8.198-19.77 0-7.466-2.91-14.49-8.198-19.775-.475-.474-.475-1.24 0-1.715.475-.474 1.24-.474 1.717 0 5.745 5.744 8.91 13.375 8.91 21.49 0 8.112-3.165 15.744-8.91 21.487-.237.238-.547.356-.858.356z" fill="#EFCE4A"/>
  </svg>
</template>

<script>
export default {
  props: {
    width: {
      type: Number,
      default: 16
    },
    height: {
      type: Number,
      default: 16
    },
    src: {
      type: String,
      required: true
    }
  },
  data () {
    return {
      isPlaying: false,
      playTimeout: null
    }
  },
  methods: {
    handleMouseEnter () {
      clearTimeout(this.playTimeout)
      this.playTimeout = setTimeout(() => this.playAudio(), 1000)
    },
    handleMouseLeave () {
      clearTimeout(this.playTimeout)
    },
    handleClick () {
      clearTimeout(this.playTimeout)
      this.playAudio()
    },
    playAudio () {
      if (this.isPlaying) { return }

      this.isPlaying = true
      // src is http, so won't be able to play in a https page. Let background page to handle.
      chrome.runtime.sendMessage({msg: 'AUDIO_PLAY', src: this.src}, () => {
        this.isPlaying = false
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.icon-speaker {
  vertical-align: text-bottom;
  cursor: pointer;
}

.speaker__body {
  fill: #f9690e;
}

$speaker-duration: 1.5s;
.icon-speaker__wave {
  fill: #f9690e;
  opacity: 0;
}

.icon-speaker--playing {
  .icon-speaker__wave {
    animation: speaker-playing $speaker-duration infinite;
  }
  .icon-speaker__wave2 {
    animation-delay: $speaker-duration / 6;
  }

  .icon-speaker__wave3 {
    animation-delay: $speaker-duration / 6 * 2;
  }
}

@keyframes speaker-playing {
  33% { opacity: 1; }
  66% { opacity: 0; }
}
</style>
