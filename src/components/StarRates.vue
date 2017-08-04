<template>
  <div :class="className">
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 426.67 426.67"
      v-for="i in 5"
      :width="width"
      :style="{'margin-right': i === 5 ? '' : gutter + 'px'}"
    >
      <path :fill="i <= rate ? '#FAC917' : '#d1d8de'" d="M213.33 10.44l65.92 133.58 147.42 21.42L320 269.4l25.17 146.83-131.84-69.32-131.85 69.34 25.2-146.82L0 165.45l147.4-21.42"/>
    </svg>
  </div>
</template>

<script>
export default {
  name: 'StarRates',
  props: {
    className: {
      type: String,
      default: 'star-rates',
      required: false
    },
    rate: {
      type: Number,
      default: 1,
      required: false,
      validator (value) {
        return value >= 0 && value <= 5
      }
    },
    width: {
      type: Number,
      default: 20,
      required: false
    },
    gutter: {
      type: Number,
      default: 5,
      required: false
    }
  }
}
</script>
