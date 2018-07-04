<template>
<div>
  <div class="buy-me-coffee" @click="showPayment = !showPayment" :title="$t('opt:buy_me_a_coffee')">
    <svg width="80" height="80" viewBox="0 0 32.273 37.388" xmlns="http://www.w3.org/2000/svg" xmlns:bx="https://boxy-svg.com">
      <g transform="translate(-1.158 6.833) scale(1.01513)">
        <path d="M28.595 8.638c0 .073-.017.146-.052.218l-.84 3.15c2.255.007 4.077.746 4.63 2.49.89 2.8-1.832 7.137-5.805 8.4-.615.195-1.23.33-1.83.408l-1.24 4.653h-.056c.002.012.003.025.003.037 0 .84-3.72 1.52-8.31 1.52-4.587 0-8.307-.68-8.307-1.52 0-.023.002-.047.008-.07L1.714 8.834c-.028-.065-.042-.13-.042-.196 0-1.36 6.027-2.462 13.462-2.462 7.434 0 13.46 1.102 13.46 2.462zm-1.214 4.58l-2.42 9.095c.283-.06.57-.135.858-.227 3.342-1.062 5.592-4.724 4.844-7.08-.454-1.428-1.658-1.885-3.28-1.787z" fill="#EDEDED" style="fill:#fff"/>
        <ellipse cx="15.12" cy="8.694" rx="11.983" ry="2.08" bx:origin="0.5 0.47" fill="#452C1A"/>
        <ellipse cx="-22.706" cy="20.249" rx="10.275" ry="1.574" transform="translate(37.79 -11.59)" bx:origin="0.5 0.47" fill="#E48416"/>
        <path d="M6.493 21.316q.476 1.74.14-.032L4.552 10.3q-.336-1.774-.476-1.742l-.866.2q-.14.033.336 1.773z" bx:shape="triangle 29.61 32.66 1.177 14.777 0.5 0.122 1@0888b5df" fill="#452C1A"/>
        <path d="M21.038 8.614c0 .498-2.658.902-5.936.902s-5.936-.404-5.936-.902 2.658-.903 5.936-.903 5.936.406 5.936.904zm-5.735-.672c-2.404 0-4.352.296-4.352.66 0 .367 1.95.663 4.353.663 2.403 0 4.35-.296 4.35-.662 0-.365-1.947-.66-4.35-.66z" fill="#452C1A"/>
      </g>
      <path class="coffee-steam1" d="M8.15 14.534c-.043.03.854-.426 1.264-1.628.237-.696.292-1.408.008-2.057-.447-1.02-1.577-1.34-1.71-2.457-.13-1.067 1.2-1.472 1.066-2.567-.1-.804-.76-1.313-1.63-1.6"/>
      <path class="coffee-steam2" d="M15.006 12.48c.046.022-.9-.32-1.453-1.463-.32-.662-.462-1.362-.26-2.04.32-1.067 1.402-1.523 1.4-2.647-.002-1.075-1.372-1.315-1.372-2.418 0-.81.596-1.396 1.424-1.787"/>
      <path class="coffee-steam3" d="M18.126 14.344c-.048.016.94-.174 1.665-1.216.42-.604.67-1.273.575-1.976-.147-1.103-1.145-1.722-.968-2.832.172-1.062 1.56-1.084 1.734-2.174.127-.8-.368-1.472-1.125-1.987"/>
    </svg>
  </div>
  <transition name="fade">
    <div class="payment-panel" v-if="showPayment">
      <div class="payment-aside">
        <ul class="payment-tabs">
          <li class="payment-item" :class="{active: active === 'wechat'}" @mouseover="active = 'wechat'"><img class="payment-icon icon-wechat" src="./assets/wechat.svg">{{ $t('opt:wechat') }}</li>
          <li class="payment-item" :class="{active: active === 'alipay'}" @mouseover="active = 'alipay'"><img class="payment-icon icon-alipay" src="./assets/alipay.svg">{{ $t('opt:alipay') }}</li>
          <li class="payment-item" :class="{active: active === 'paypal'}" @mouseover="active = 'paypal'"><img class="payment-icon icon-paypal" src="./assets/ko-fi.svg">PayPal</li>
          <li class="payment-item disabled"><img class="payment-icon icon-bitcoin" src="./assets/bitcoin.svg">{{ $t('opt:bitcoin') }}</li>
        </ul>
        <div>
          <p class="coffee-social-media-wrap">
            <a href="mailto:straybugs@gmail.com" @mouseenter="showSocialMedia(true)" @mouseleave="showSocialMedia(false)" @click.prevent="void 0">{{ $t('opt:contact_author') }}</a>
            <transition name="fade">
              <div class="coffee-social-media" v-if="isShowSocial" @mouseenter="showSocialMedia(true)" @mouseleave="showSocialMedia(false)">
                <social-media />
              </div>
            </transition>
          </p>
          <p><a href="https://github.com/crimx/crx-saladict/issues" target="_blank" rel="noopener">{{ $t('opt:report_issue') }}</a></p>
        </div>
        <div class="payment-title">
          <div>
            <p>BUY ME A</p>
            <p>COFFEE <svg class="icon-heart" viewBox="0 0 32 32"><path d="M23.6 2c-3.363 0-6.258 2.736-7.599 5.594-1.342-2.858-4.237-5.594-7.601-5.594-4.637 0-8.4 3.764-8.4 8.401 0 9.433 9.516 11.906 16.001 21.232 6.13-9.268 15.999-12.1 15.999-21.232 0-4.637-3.763-8.401-8.4-8.401z"/></svg></p>
          </div>
          <div class="easter-egg" title="Unlock secrets" @dblclick="eggClicked">
            <svg width="30" height="30" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
              <path fill="#AF9CE6" d="M407.64 135.93l-.05-.1C373 53.93 313.1 0 256 0c-57.15 0-117.04 53.96-151.63 135.93l19.7 32.25L256 182.88l131.94-14.7 19.7-32.25z"/>
              <path fill="#FFA0C1" d="M437.16 285.64c0-37.54-5.2-73.24-14.28-105.87L256 182.87l-166.88-3.1c-9.08 32.63-14.28 68.33-14.28 105.87 0 21.26 1.65 40.86 4.72 58.88l.13.7 37.4 36.1L256 402.54l138.9-21.22 37.4-36.1c3.16-18.22 4.86-38.05 4.86-59.58z"/>
              <path fill="#AF9CE6" d="M256 402.54H96.27l.07.15C128.9 478.6 193.58 512 256 512c62.43 0 127.12-33.4 159.68-109.35l.05-.1H256z"/>
              <path fill="#ABEB8A" d="M425.37 375.5c.68-2.36 1.34-4.74 1.97-7.16 0-.06.03-.12.05-.18 1.9-7.35 3.5-15 4.9-22.95-41.8 21.2-103.2 36.2-176.3 36.2s-134.6-14.9-176.3-36.1c1.3 8 3 15.6 4.9 23v.2c.6 2.5 1.3 4.8 1.9 7.2 2 7.1 4.4 13.9 6.9 20.4l.2.5c.8 2.1 1.6 4.2 2.5 6.24C142.5 419.2 197.9 428 255.8 428s113.3-8.82 159.72-25.2c.86-2.03 1.7-4.1 2.54-6.2.06-.14.1-.3.17-.44 2.55-6.5 4.86-13.3 6.93-20.4z"/>
              <ellipse cx="256" cy="293.14" fill="#61CCFF" rx="34.58" ry="44.41"/>
              <g fill="#FFDF96">
                <ellipse cx="140.06" cy="272.58" rx="32.69" ry="41.97"/>
                <ellipse cx="371.94" cy="272.58" rx="32.69" ry="41.97"/>
              </g>
              <path fill="#ABEB8A" d="M422.88 179.77v-.05c-.87-3.1-1.78-6.15-2.7-9.2l-.75-2.4c-.37-1.2-.75-2.35-1.13-3.5-.26-.8-.5-1.6-.78-2.4l-1.2-3.5c-.25-.77-.5-1.53-.78-2.3-.4-1.18-.84-2.36-1.27-3.54l-.76-2.1-1.3-3.65-.7-1.85-1.5-3.8-.6-1.42-1.7-4.13c-39.8 15.22-91.8 25.22-151.6 25.22s-111.8-10-151.6-25.22l-1.7 4.12-.6 1.43-1.5 3.8-.7 1.85-1.3 3.65-.7 2.1-1.25 3.55-.8 2.28c-.4 1.2-.8 2.4-1.17 3.6l-.8 2.4c-.34 1.2-.72 2.3-1.1 3.5l-.72 2.4c-.92 3.1-1.82 6.1-2.7 9.2v.1c47.8 18.1 105.94 27.8 166.88 27.8s119.1-9.7 166.9-27.8z"/>
              <path d="M164.34 422.95c-9.3-16.5-16.87-35.46-22.27-57-5.9-23.6-9.2-50.32-9.2-80.3 0-43.92 7.12-85.28 19.24-122.2 9.5-28.9 22.1-55.07 36.7-77.58 27.1-41.64 61.3-70.73 96.3-81.38-9.7-3-19.4-4.5-29-4.5-44.5 0-90.6 32.7-125.2 85.8-14.6 22.5-27.2 48.6-36.7 77.6-12.2 36.9-19.3 78.3-19.3 122.2 0 30 3.3 56.7 9.2 80.3 5.4 21.5 13 40.5 22.3 57C141 484.6 199.5 512 256 512c9.66 0 19.37-.82 29-2.45-46.8-7.94-91.9-35.5-120.66-86.6z" opacity=".1"/>
            </svg>
          </div>
        </div>
      </div>
      <div class="payment-content">
        <transition name="fade">
          <div class="payment-pane" key="wechat"      v-if="active === 'wechat'"><img src="./assets/qrcode/wechat.png" alt="wechat qrcode"><p><small>{{ $t('opt:buy_me_a_coffee') }}</small></p></div>
          <div class="payment-pane" key="alipay" v-else-if="active === 'alipay'"><img src="./assets/qrcode/alipay.png" alt="alipay qrcode"><p> </p></div>
        </transition>
      </div>
    </div>
  </transition>
</div>
</template>

<script>
import SocialMedia from './SocialMedia'
export default {
  data () {
    return {
      showPayment: false,
      active: 'wechat',
      isShowSocial: false
    }
  },
  methods: {
    showSocialMedia (flag) {
      clearTimeout(this.__showSocialMediaTimeout)
      if (flag) {
        this.isShowSocial = true
      } else {
        this.__showSocialMediaTimeout = setTimeout(() => {
          this.isShowSocial = false
        }, 400)
      }
    },
    coffeeMouseover () {
      this.showPayment = true
    },
    eggClicked () {
      browser.storage.sync.set({unlock: true})
    },
  },
  components: {
    SocialMedia
  }
}
</script>

<style>
@font-face {
  font-family: 'shadows-into-light';
  src: url('./assets/shadows-into-light.ttf') format('truetype');
  font-weight: normal;
  font-style: normal;
}
</style>

<style lang="scss" scoped>
$coffee-gutter: 14px;
$coffee-width: 100px;
.buy-me-coffee {
  display: flex;
  justify-content: center;
  align-items: center;
  position: fixed;
  left: $coffee-gutter;
  bottom: 20px;
  width: $coffee-width;
  height: $coffee-width;
  background-color: #66cc99;
  border: 5px solid #66cc99;
  border-radius: 10px;
  cursor: pointer;
}

.payment-panel {
  display: flex;
  position: fixed;
  left: $coffee-gutter * 2 + $coffee-width;
  bottom: 20px;
  z-index: 99999;
  padding: 15px;
  background-color: #fff;
  border-radius: 15px;
  box-shadow: 3px 4px 31px -8px rgba(0,0,0,0.8);
}

.payment-title {
  display: flex;
  justify-content: space-between;

  p {
    margin-bottom: 0;
    font-weight: bold;
    font-family: 'shadows-into-light', -apple-system, system-ui, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
  }
}

.easter-egg {
  display: flex;
  align-items: center;
  cursor: pointer;

  &:hover {
    animation-name: shake;
    animation-duration: 100ms;
    animation-timing-function: ease-in-out;
    animation-iteration-count: infinite
  }
}

.icon-heart {
  fill: #dd4b39;
  height: 1rem;
  vertical-align: middle;
}

.payment-aside {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.payment-tabs {
  padding: 0;
}

.payment-item {
  list-style: none;
  padding: 10px;
  font-weight: bold;
  cursor: pointer;

  &.active {
    background-color: darken(#fff, 10%);
  }

  &.disabled {
    filter: grayscale(100%);
    color: #aaa;
  }
}

.payment-icon {
  height: 1.5rem;
  margin-right: 0.7rem;
  vertical-align: bottom;
}

.payment-content {
  position: relative;
  width: 250px;
  height: 250px + 20px;
}

.payment-pane {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  text-align: center;

  img {
    max-width: 100%;
  }
}

.coffee-social-media-wrap {
  position: relative;
}

.coffee-social-media {
  position: absolute;
  z-index: 10;
  left: 80%;
  bottom: -100%;
}

.coffee-steam1,
.coffee-steam2,
.coffee-steam3 {
  stroke-linecap: round;
  stroke-miterlimit: 10;
  fill: none;
  stroke: #fff;
  stroke-dasharray: 80;
}

.coffee-steam1 { animation: coffee-steam1 4s infinite; }
.coffee-steam2 { animation: coffee-steam2 4s 0.4s infinite; }
.coffee-steam3 { animation: coffee-steam3 4s 0.2s infinite; }

@keyframes coffee-steam1 {
  0%   { stroke-dashoffset:  20; opacity: 0; transform: translate(0, 0); }
  20%  { stroke-dashoffset:   0; opacity: 1; }
  100% { stroke-dashoffset: -20; opacity: 0; transform: translate(2px, -2px); }
}

@keyframes coffee-steam2 {
  0%   { stroke-dashoffset:  20; opacity: 0; transform: translate(0, 0); }
  5%   { stroke-dashoffset:   0; opacity: 1; }
  100% { stroke-dashoffset: -20; opacity: 0; transform: translate(3px, -5px); }
}

@keyframes coffee-steam3 {
  0%   { stroke-dashoffset:  20; opacity: 0; transform: translate(0, 0); }
  10%  { stroke-dashoffset:   0; opacity: 1; }
  100% { stroke-dashoffset: -20; opacity: 0; transform: translate(5px, -4px); }
}

@keyframes shake {
   2% { transform: translate(-.5px, .5px) rotate(-.5deg) }
   4% { transform: translate(2.5px, .5px) rotate(-.5deg) }
   6% { transform: translate(-.5px, 1.5px) rotate(1.5deg) }
   8% { transform: translate(.5px, .5px) rotate(-.5deg) }
  10% { transform: translate(-.5px, -1.5px) rotate(-.5deg) }
  12% { transform: translate(.5px, -.5px) rotate(1.5deg) }
  14% { transform: translate(1.5px, 2.5px) rotate(-.5deg) }
  16% { transform: translate(-.5px, -.5px) rotate(.5deg) }
  18% { transform: translate(2.5px, .5px) rotate(.5deg) }
  20% { transform: translate(.5px, -1.5px) rotate(-.5deg) }
  22% { transform: translate(2.5px, 2.5px) rotate(-.5deg) }
  24% { transform: translate(2.5px, 1.5px) rotate(1.5deg) }
  26% { transform: translate(.5px, 1.5px) rotate(-.5deg) }
  28% { transform: translate(1.5px, .5px) rotate(.5deg) }
  30% { transform: translate(-1.5px, 2.5px) rotate(1.5deg) }
  32% { transform: translate(.5px, .5px) rotate(.5deg) }
  34% { transform: translate(.5px, 1.5px) rotate(1.5deg) }
  36% { transform: translate(2.5px, -.5px) rotate(1.5deg) }
  38% { transform: translate(.5px, 1.5px) rotate(1.5deg) }
  40% { transform: translate(2.5px, 1.5px) rotate(1.5deg) }
  42% { transform: translate(2.5px, -1.5px) rotate(.5deg) }
  44% { transform: translate(.5px, -.5px) rotate(.5deg) }
  46% { transform: translate(1.5px, -1.5px) rotate(.5deg) }
  48% { transform: translate(-1.5px, -.5px) rotate(.5deg) }
  50% { transform: translate(2.5px, -1.5px) rotate(1.5deg) }
  52% { transform: translate(.5px, 1.5px) rotate(.5deg) }
  54% { transform: translate(2.5px, -.5px) rotate(.5deg) }
  56% { transform: translate(2.5px, 2.5px) rotate(.5deg) }
  58% { transform: translate(2.5px, 1.5px) rotate(-.5deg) }
  60% { transform: translate(1.5px, 1.5px) rotate(-.5deg) }
  62% { transform: translate(-.5px, .5px) rotate(-.5deg) }
  64% { transform: translate(2.5px, 1.5px) rotate(-.5deg) }
  66% { transform: translate(-1.5px, .5px) rotate(1.5deg) }
  68% { transform: translate(1.5px, -1.5px) rotate(.5deg) }
  70% { transform: translate(.5px, .5px) rotate(-.5deg) }
  72% { transform: translate(-.5px, 1.5px) rotate(1.5deg) }
  74% { transform: translate(-1.5px, 1.5px) rotate(1.5deg) }
  76% { transform: translate(2.5px, -.5px) rotate(.5deg) }
  78% { transform: translate(2.5px, 2.5px) rotate(.5deg) }
  80% { transform: translate(-1.5px, 2.5px) rotate(.5deg) }
  82% { transform: translate(-1.5px, -.5px) rotate(.5deg) }
  84% { transform: translate(.5px, 1.5px) rotate(-.5deg) }
  86% { transform: translate(-.5px, 2.5px) rotate(.5deg) }
  88% { transform: translate(2.5px, 2.5px) rotate(1.5deg) }
  90% { transform: translate(-.5px, -1.5px) rotate(-.5deg) }
  92% { transform: translate(1.5px, .5px) rotate(.5deg) }
  94% { transform: translate(-.5px, -.5px) rotate(.5deg) }
  96% { transform: translate(1.5px, .5px) rotate(1.5deg) }
  98% { transform: translate(.5px, -.5px) rotate(1.5deg) }
  0%,100% { transform: translate(0, 0) rotate(0) }
}

.fade-enter-active, .fade-leave-active {
  transition: opacity .4s
}
.fade-enter, .fade-leave-active {
  opacity: 0
}
</style>
