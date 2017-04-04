<template>
<div>
  <div class="buy-me-coffee" @click="showPayment = !showPayment" :title="i18n('buy_me_a_coffee')">
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
      <ul class="payment-tabs">
        <li class="payment-item" :class="{active: active === 'wechat'}" @mouseover="active = 'wechat'"><img class="payment-icon icon-wechat" src="./assets/wechat.svg">{{ i18n('wechat') }}</li>
        <li class="payment-item" :class="{active: active === 'alipay'}" @mouseover="active = 'alipay'"><img class="payment-icon icon-alipay" src="./assets/alipay.svg">{{ i18n('alipay') }}</li>
        <li class="payment-item" :class="{active: active === 'paypal'}" @mouseover="active = 'paypal'"><img class="payment-icon icon-paypal" src="./assets/paypal.svg">PayPal</li>
        <li class="payment-item" :class="{active: active === 'bitcoin'}" @mouseover="active = 'bitcoin'"><img class="payment-icon icon-bitcoin" src="./assets/bitcoin.svg">{{ i18n('bitcoin') }}</li>
      </ul>
      <div class="payment-content">
        <transition name="fade">
          <div class="payment-pane" key="wechat"      v-if="active === 'wechat'"><img src="./assets/qrcode/wechat.png" alt="wechat qrcode"><p><small>{{ i18n('buy_me_a_coffee') }}</small></p></div>
          <div class="payment-pane" key="alipay" v-else-if="active === 'alipay'"><img src="./assets/qrcode/alipay.png" alt="alipay qrcode"><p> </p></div>
          <div class="payment-pane" key="paypal" v-else-if="active === 'paypal'"><img src="./assets/qrcode/paypal.png" alt="paypal qrcode"><p><a href="https://www.paypal.me/crimx" target="_blank">https://www.paypal.me/crimx</a></p></div>
          <div class="payment-pane" key="bitcoin" v-else-if="active === 'bitcoin'"><img src="./assets/qrcode/bitcoin.png" alt="bitcoin qrcode"><p><small>1LkSPTYg3xFTZp39XxQJHqA77rskkENDyX</small></p></div>
        </transition>
      </div>
      <div class="payment-title">
        <p>BUY ME A</p>
        <p>COFFEE <svg class="icon-heart" viewBox="0 0 32 32"><path d="M23.6 2c-3.363 0-6.258 2.736-7.599 5.594-1.342-2.858-4.237-5.594-7.601-5.594-4.637 0-8.4 3.764-8.4 8.401 0 9.433 9.516 11.906 16.001 21.232 6.13-9.268 15.999-12.1 15.999-21.232 0-4.637-3.763-8.401-8.4-8.401z"/></svg></p>
      </div>
    </div>
  </transition>
</div>
</template>

<script>
export default {
  data () {
    return {
      showPayment: false,
      active: 'wechat'
    }
  },
  methods: {
    coffeeMouseover () {
      this.showPayment = true
    },
    i18n (key) {
      return chrome.i18n.getMessage(key)
    }
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
  position: absolute;
  bottom: 15px;
  left: 15px;

  p {
    margin-bottom: 0;
    font-weight: bold;
    font-family: 'shadows-into-light', -apple-system, system-ui, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
  }
}

.icon-heart {
  fill: #dd4b39;
  height: 1rem;
  vertical-align: middle;
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

.fade-enter-active, .fade-leave-active {
  transition: opacity .4s
}
.fade-enter, .fade-leave-active {
  opacity: 0
}
</style>
