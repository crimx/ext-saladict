<template>
<iframe class="saladict-frame"
  name="saladict-frame"
  src=""
  :style="{top: frameTop + 'px !important', left: frameLeft + 'px !important', height: panelHeight + 'px !important'}"
></iframe>
</template>

<script>
import 'src/helpers/iframe-chrome-api-parent'
import defaultConfig from 'src/app-config'
var styleText, scriptText

// Speed up stylesheet&script loading
var styleReq = new XMLHttpRequest()
styleReq.addEventListener('load', function () {
  styleText = this.responseText
})
styleReq.open('GET', chrome.runtime.getURL('panel.css'))
styleReq.send()

var scriptReq = new XMLHttpRequest()
scriptReq.addEventListener('load', function () {
  scriptText = this.responseText
})
scriptReq.open('GET', chrome.runtime.getURL('panel.js'))
scriptReq.send()

export default {
  props: {
    config: {
      default: defaultConfig
    },
    iconTop: {
      type: Number,
      default: 0,
      required: true
    },
    iconLeft: {
      type: Number,
      default: 0,
      required: true
    }
  },
  data () {
    return {
      frameTop: 0,
      frameLeft: 0,
      isDragging: false,
      frameMouseX: 0,
      frameMouseY: 0,
      pageMouseX: 0,
      pageMouseY: 0
    }
  },
  methods: {
    handleDragStart (evt) {
      let data = evt.data
      if (data.msg === 'SALADICT_DRAG_START') {
        this.frameMouseX = data.mouseX
        this.frameMouseY = data.mouseY
        this.pageMouseX = this.frameLeft + data.mouseX
        this.pageMouseY = this.frameTop + data.mouseY
        this.isDragging = true
      }
    },
    handleDragEnd () {
      this.isDragging = false
    },
    handleFrameMousemove (evt) {
      if (!this.isDragging) { return }

      let offsetX = evt.clientX - this.frameMouseX
      let offsetY = evt.clientY - this.frameMouseY

      this.frameTop += offsetY
      this.frameLeft += offsetX
      this.$forceUpdate()

      this.pageMouseX += offsetX
      this.pageMouseY += offsetY
    },
    handlePageMousemove (evt) {
      if (!this.isDragging) { return }

      this.frameTop += evt.clientX - this.pageMouseX
      this.frameLeft += evt.clientY - this.pageMouseY
      this.$forceUpdate()

      this.pageMouseX = evt.clientX
      this.pageMouseY = evt.clientY
    }
  },
  computed: {
    panelHeight () {
      // header + each dictionary
      const preferredHeight = 30 + 110 * this.config.dicts.length
      const maxHeight = window.innerHeight * 2 / 3
      return preferredHeight > maxHeight ? maxHeight : preferredHeight
    }
  },
  created () {
    let preferredTop = this.iconTop
    if (preferredTop + this.panelHeight > window.innerHeight - 5) {
      this.frameTop = window.innerHeight - 5 - this.panelHeight
    } else {
      this.frameTop = preferredTop
    }

    let prefferedLeft = this.iconLeft + 30 + 10
    if (prefferedLeft + 400 > window.innerWidth) {
      this.frameLeft = this.iconLeft - 10 - 400
    } else {
      this.frameLeft = prefferedLeft
    }
  },
  mounted () {
    let frameWin = this.$el.contentWindow
    let frameDoc = frameWin.document
    let frameBody = frameDoc.body

    let $style
    if (styleText) {
      $style = frameDoc.createElement('style')
      $style.innerHTML = styleText
    } else {
      $style = frameDoc.createElement('link')
      $style.href = chrome.runtime.getURL('panel.css')
      $style.rel = 'stylesheet'
      $style.type = 'text/css'
    }

    let $script = frameDoc.createElement('script')
    if (scriptText) {
      $script.innerHTML = scriptText
    } else {
      $script.src = chrome.runtime.getURL('panel.js')
    }

    frameBody.appendChild($style)
    frameBody.appendChild($script)


    // attach dragging listeners
    document.addEventListener('mouseup', this.handleDragEnd, true)
    frameDoc.addEventListener('mouseup', this.handleDragEnd, true)

    document.addEventListener('mousemove', this.handlePageMousemove, true)
    frameDoc.addEventListener('mousemove', this.handleFrameMousemove, true)

    window.addEventListener('message', this.handleDragStart)
  },
  destroyed () {
    document.removeEventListener('mouseup', this.handleDragEnd, true)
    document.removeEventListener('mousemove', this.handlePageMousemove, true)
    window.removeEventListener('message', this.handleDragStart)
  }
}
</script>

<style>
</style>
