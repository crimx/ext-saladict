<template>
<div class="saladict-container">
  <transition name="saladict-jelly">
    <div class="saladict-icon"
      v-if="isShowIcon"
      key="saladict-icon"
      :style="{top: iconTop + 'px !important', left: iconLeft + 'px !important'}"
      @mouseover="iconMouseover"
    >
      <img class="saladict-icon__leaf" src="../../assets/leaf.svg">
      <img class="saladict-icon__orange" src="../../assets/orange.svg">
      <img class="saladict-icon__tomato" src="../../assets/tomato.svg">
      <img class="saladict-icon__bowl" src="../../assets/bowl.svg">
    </div>
  </transition>
  <transition name="saladict-jelly">
    <panel-frame
      v-if="isShowFrame"
      key="saladict-frame"
      :config="config"
      :icon-top="iconTop"
      :icon-left="iconLeft"
    ></panel-frame>
  </transition>
</div>
</template>

<script>
import defaultConfig from 'src/app-config'
import {storage, message} from 'src/helpers/chrome-api'
import PanelFrame from '../panel/PanelFrame'

export default {
  name: 'saladict-container',
  data () {
    return {
      config: defaultConfig,

      frameSource: chrome.runtime.getURL('panel.html'),

      isShowIcon: false,
      iconTop: 0,
      iconLeft: 0,

      isShowFrame: false,

      // pin the panel
      isStayVisiable: false
    }
  },
  methods: {
    iconMouseover () {
      this.isShowFrame = true
    },
    setIconPosition (mouseX, mouseY) {
      //             +-----+
      //             |     |
      //             |     | 30px
      //        60px +-----+
      //             | 30px
      //             |
      //       40px  |
      //     +-------+
      // cursor
      if (mouseX + 40 + 30 > window.innerWidth) {
        this.iconLeft = mouseX - 40 - 30
      } else {
        this.iconLeft = mouseX + 40
      }

      if (mouseY > 60) {
        this.iconTop = mouseY - 60
      } else {
        this.iconTop = mouseY + 60 - 30
      }
    }
  },
  components: {
    PanelFrame
  },
  created () {
    storage.sync.get('config').then(result => {
      if (result.config) {
        this.config = result.config
      }
    })
    storage.listen('config', changes => {
      this.config = changes.config.newValue
    })
  },
  mounted () {
    // receive signals from page and all frames
    message.on('SELECTION', (data, sender, sendResponse) => {
      if (this.isStayVisiable) {
        this.isShowIcon = false
        return
      }

      // So that the icon would dance a little bit
      if (this.isShowIcon || this.isShowFrame) {
        this.isShowIcon = false
        this.isShowFrame = false
        this.$nextTick(show)
      } else {
        show.call(this)
      }

      function show () {
        this.setIconPosition(data.mouseX, data.mouseY)

        if (data.text) {
          switch (this.config.mode) {
            case 'icon':
              this.isShowIcon = true
              break
            case 'direct':
              this.isShowFrame = true
              break
            case 'ctrl':
              if (data.ctrlKey) {
                this.isShowFrame = true
              }
              break
          }
        }
      }
    })

    message.on('CLOSE_PANEL', () => {
      this.isStayVisiable = false
      this.isShowFrame = false
      this.isShowIcon = false
    })

    message.on('PIN_PANEL', (data) => {
      this.isStayVisiable = data.flag
    })
  }
}
</script>

<style lang="scss">
/*-----------------------------------------------*\
    Extreme reset, based on Cleanslate css
\*-----------------------------------------------*/
%reset {
  background-attachment: scroll;
  background-color: transparent;
  background-image: none;
  background-position: 0 0;
  background-repeat: repeat;
  border-color: transparent;
  border-radius: 0;
  border-style: none;
  border-width: 0;
  bottom: auto;
  clear: none;
  clip: auto;
  color: inherit;
  counter-increment: none;
  counter-reset: none;
  cursor: auto;
  direction: inherit;
  display: inline;
  float: none;
  font-family: inherit;
  font-size: inherit;
  font-style: inherit;
  font-variant: normal;
  font-weight: inherit;
  height: auto;
  left: auto;
  letter-spacing: normal;
  line-height: inherit;
  list-style-type:  inherit; /* Could set list-style-type to none */
  list-style-position:  outside;
  list-style-image:  none;
  margin: 0;
  max-height: none;
  max-width: none;
  min-height: 0;
  min-width: 0;
  opacity: 1;
  outline: invert none medium;
  overflow: visible;
  padding: 0;
  position: static;
  quotes:  "" "";
  right: auto;
  table-layout: auto;
  text-align: inherit;
  text-decoration: inherit;
  text-indent: 0;
  text-transform: none;
  top: auto;
  unicode-bidi: normal;
  vertical-align: baseline;
  visibility: inherit;
  white-space: normal;
  width: auto;
  word-spacing: normal;
  z-index: auto;

  /* CSS3 */
  /* Including all prefixes according to http://caniuse.com/ */
  /* CSS Animations don't cascade, so don't require resetting */
  background-origin: padding-box;
  background-clip: border-box;
  background-size: auto;
  border-image: none;
  border-radius: 0;
  box-shadow: none;
  box-sizing: content-box;
  column-count: auto;
  column-gap: normal;
  column-rule: medium none black;
  column-span: 1;
  column-width: auto;
  font-feature-settings: normal;
  overflow-x: visible;
  overflow-y: visible;
  hyphens: manual;
  perspective: none;
  perspective-origin: 50% 50%;
  backface-visibility: visible;
  text-shadow: none;
  transition: all 0s ease 0s;
  transform: none;
  transform-origin: 50% 50%;
  transform-style: flat;
  word-break: normal;
}

div.saladict-container {
  @extend %reset;
  display: block;
}

iframe.saladict-frame {
  @extend %reset;
  position: fixed;
  z-index: $global-zindex-tooltip;
  overflow: hidden;
  width: 400px;
  box-shadow: rgba(0, 0, 0, 0.8) 0px 4px 23px -6px;
}

$icon-width: 30px;
div.saladict-icon {
  @extend %reset;
  position: fixed;
  z-index: $global-zindex-tooltip;
  overflow: hidden;
  width: $icon-width;
  height: $icon-width;
}

$tomato-rotate: 45deg;
$leaf-rotate: 30deg;

img.saladict-icon__leaf {
  @extend %reset;
  position: absolute;
  z-index: 1;
  top: 50 * $icon-width / 1024;
  left: 600 * $icon-width / 1024;
  width: $icon-width * 729 / 1024 * 0.6;
  height: $icon-width * 0.6;
  transform: rotate($leaf-rotate);
}

img.saladict-icon__orange {
  @extend %reset;
  position: absolute;
  z-index: 2;
  top: 0 * $icon-width / 1024;
  left: 195 * $icon-width / 1024;
  width: $icon-width * 0.6;
  height: $icon-width * 0.6;
}

img.saladict-icon__tomato {
  @extend %reset;
  position: absolute;
  z-index: 3;
  top: 250 * $icon-width / 1024;
  left: -117 * $icon-width / 1024;
  width: $icon-width * 0.6;
  height: $icon-width * 513 / 1024 * 0.6;
  transform: rotate($tomato-rotate);
}

img.saladict-icon__bowl {
  @extend %reset;
  position: absolute;
  z-index: 4;
  bottom: 0;
  left: 0;
  width: $icon-width;
  height: $icon-width * 530 / 1024;
}

/*-----------------------------------------------*\
    States
\*-----------------------------------------------*/
.saladict-jelly-enter-active {
  animation: saladict-jelly 1000ms linear;
}

.saladict-jelly-leave-active {
  animation: saladict-jelly 1000ms reverse linear;
}

.saladict-icon:hover {
  .saladict-icon__leaf {
    animation: saladict-leaf-shake 1s infinite linear;
  }
  .saladict-icon__orange {
    animation: saladict-orange-spin 1s infinite linear;
  }
  .saladict-icon__tomato {
    animation: saladict-tomato-shake 0.7s infinite linear;
  }
}

/* Generated with Bounce.js. Edit at https://goo.gl/Vn2Euz */

@keyframes saladict-jelly {
      0% { transform: matrix3d(0.500, 0, 0, 0, 0, 0.500, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1); }
   3.40% { transform: matrix3d(0.658, 0, 0, 0, 0, 0.703, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1); }
   4.70% { transform: matrix3d(0.725, 0, 0, 0, 0, 0.800, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1); }
   6.81% { transform: matrix3d(0.830, 0, 0, 0, 0, 0.946, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1); }
   9.41% { transform: matrix3d(0.942, 0, 0, 0, 0, 1.084, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1); }
  10.21% { transform: matrix3d(0.971, 0, 0, 0, 0, 1.113, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1); }
  13.61% { transform: matrix3d(1.062, 0, 0, 0, 0, 1.166, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1); }
  14.11% { transform: matrix3d(1.070, 0, 0, 0, 0, 1.165, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1); }
  17.52% { transform: matrix3d(1.104, 0, 0, 0, 0, 1.120, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1); }
  18.72% { transform: matrix3d(1.106, 0, 0, 0, 0, 1.094, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1); }
  21.32% { transform: matrix3d(1.098, 0, 0, 0, 0, 1.035, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1); }
  24.32% { transform: matrix3d(1.075, 0, 0, 0, 0, 0.980, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1); }
  25.23% { transform: matrix3d(1.067, 0, 0, 0, 0, 0.969, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1); }
  29.03% { transform: matrix3d(1.031, 0, 0, 0, 0, 0.948, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1); }
  29.93% { transform: matrix3d(1.024, 0, 0, 0, 0, 0.949, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1); }
  35.54% { transform: matrix3d(0.990, 0, 0, 0, 0, 0.981, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1); }
  36.74% { transform: matrix3d(0.986, 0, 0, 0, 0, 0.989, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1); }
  41.04% { transform: matrix3d(0.980, 0, 0, 0, 0, 1.011, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1); }
  44.44% { transform: matrix3d(0.983, 0, 0, 0, 0, 1.016, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1); }
  52.15% { transform: matrix3d(0.996, 0, 0, 0, 0, 1.003, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1); }
  59.86% { transform: matrix3d(1.003, 0, 0, 0, 0, 0.995, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1); }
  63.26% { transform: matrix3d(1.004, 0, 0, 0, 0, 0.996, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1); }
  75.28% { transform: matrix3d(1.001, 0, 0, 0, 0, 1.002, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1); }
  85.49% { transform: matrix3d(0.999, 0, 0, 0, 0, 1.000, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1); }
  90.69% { transform: matrix3d(1.000, 0, 0, 0, 0, 1.000, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1); }
    100% { transform: matrix3d(1.000, 0, 0, 0, 0, 1.000, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1); }
}

@keyframes saladict-leaf-shake {
    0% { transform: translate( 2px,  1px) rotate($leaf-rotate + 0deg); }
   10% { transform: translate(-1px, -2px) rotate($leaf-rotate - 1deg); }
   20% { transform: translate(-2px,    0) rotate($leaf-rotate + 1deg); }
   30% { transform: translate(   0,  2px) rotate($leaf-rotate + 0deg); }
   40% { transform: translate( 1px, -1px) rotate($leaf-rotate + 1deg); }
   50% { transform: translate(-1px,  2px) rotate($leaf-rotate - 1deg); }
   60% { transform: translate(-2px,  1px) rotate($leaf-rotate + 0deg); }
   70% { transform: translate( 2px,  1px) rotate($leaf-rotate - 1deg); }
   80% { transform: translate(-1px, -1px) rotate($leaf-rotate + 1deg); }
   90% { transform: translate( 2px,  2px) rotate($leaf-rotate + 0deg); }
  100% { transform: translate( 1px, -2px) rotate($leaf-rotate - 1deg); }
}

@keyframes saladict-orange-spin {
  from { transform: rotate(  0deg); }
    to { transform: rotate(360deg); }
}

@keyframes saladict-tomato-shake {
    0% { transform: rotate($tomato-rotate - 10deg); }
   30% { transform: rotate($tomato-rotate +  0deg); }
   60% { transform: rotate($tomato-rotate + 10deg); }
   90% { transform: rotate($tomato-rotate +  0deg); }
  100% { transform: rotate($tomato-rotate -  5deg); }
}
</style>
