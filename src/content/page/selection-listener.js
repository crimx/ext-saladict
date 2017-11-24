/**
 * Listen to mouse selection
 * Apply to all frames
 */

import {message, storage} from 'src/helpers/chrome-api'
import {isContainChinese, isContainEnglish} from 'src/helpers/lang-check'
import AppConfig from 'src/app-config'

let config = new AppConfig()
let numTripleCtrl = 0
let tripleCtrlTimeout = null
let isCtrlKeydown = false
let selectionText = ''

storage.sync.get('config', data => {
  if (data.config) {
    config = data.config
  }

  if (config.tripleCtrl) {
    document.addEventListener('keyup', handleTripleCtrlKeyup)
  }
})

storage.sync.listen('config', ({config: {newValue, oldValue}}) => {
  if (newValue.tripleCtrl) {
    if (!oldValue.tripleCtrl) {
      document.addEventListener('keyup', handleTripleCtrlKeyup)
    }
  } else {
    if (oldValue.tripleCtrl) {
      document.removeEventListener('keyup', handleTripleCtrlKeyup)
    }
  }
})

document.addEventListener('keydown', evt => {
  if (isCtrl(evt)) {
    isCtrlKeydown = true
  }
})

document.addEventListener('keyup', evt => {
  isCtrlKeydown = false
})

// Reset state when user switching window with ctrl/meta key
window.addEventListener('blur', () => {
  isCtrlKeydown = false
})

document.addEventListener('mouseup', handleMouseup, true)

window.addEventListener('message', handleFrameMsg, false)

message.on('__PRELOAD_SELECTION__', (data, sender, sendResponse) => {
  sendResponse(selectionText)
})

/**
 * send when hits ctrl button three times
 * @param {MouseEvent} evt
 */
function handleTripleCtrlKeyup (evt) {
  // ctrl & command(mac)
  if (isCtrl(evt)) {
    if (++numTripleCtrl === 3) {
      if (!config.tripleCtrl) { return }
      message.self.send({msg: 'TRIPLE_CTRL'})
    } else {
      if (tripleCtrlTimeout) { clearTimeout(tripleCtrlTimeout) }
      tripleCtrlTimeout = setTimeout(() => {
        numTripleCtrl = 0
        tripleCtrlTimeout = null
      }, 500)
    }
  }
}

/**
 * handle mouseup, send selection to dict panal
 * @param {MouseEvent} event
 */
function handleMouseup ({button, target, clientX, clientY}) {
  if (button !== 0 || // 0: Main button pressed, usually the left button
      !config.active ||
      window.name === 'saladict-frame' ||
      target.className.startsWith('saladict-')
  ) {
    return // ignore mouse events on dict panal
  }

  if (!window.getSelection().toString().trim()) {
    // empty message
    selectionText = ''
    return message.self.send({msg: 'SELECTION'})
  }

  // if user click on a selected text,
  // getSelection would reture the text before it disappears
  // delay to wait for selection get cleared
  setTimeout(() => {
    let text = window.getSelection().toString().trim()
    if (!text) {
      // empty message
      selectionText = ''
      return message.self.send({msg: 'SELECTION'})
    }

    selectionText = text

    if ((config.language.english && isContainEnglish(text)) ||
        (config.language.chinese && isContainChinese(text))) {
      if (window.parent === window) {
        // top
        message.self.send({
          msg: 'SELECTION',
          text,
          mouseX: clientX,
          mouseY: clientY,
          ctrlKey: isCtrlKeydown
        })
      } else {
        // post to upper frames/window
        window.parent.postMessage({
          msg: 'SALADICT_SELECTION',
          text,
          mouseX: clientX,
          mouseY: clientY,
          ctrlKey: isCtrlKeydown
        }, '*')
      }
    }
  }, 0)
}

/**
 * handle message from iframes, add up coordinates
 * @param {MessageEvent} event
 */
function handleFrameMsg ({data, source}) {
  if (data.msg !== 'SALADICT_SELECTION') { return }

  // get the souce iframe
  const iframe = Array.from(document.querySelectorAll('iframe'))
    .find(({contentWindow}) => contentWindow === source)
  if (!iframe) { return }

  let {text, mouseX, mouseY, ctrlKey} = data
  let {left, top} = iframe.getBoundingClientRect()
  mouseX += left
  mouseY += top

  if (window.parent === window) {
    // top
    message.self.send({
      msg: 'SELECTION',
      text,
      mouseX,
      mouseY,
      ctrlKey
    })
  } else {
    // post to upper frames/window
    window.parent.postMessage({
      msg: 'SALADICT_SELECTION',
      text,
      mouseX,
      mouseY,
      ctrlKey
    }, '*')
  }
}

/**
 * is ctrl button pressed
 * @param {MouseEvent} evt
 */
function isCtrl (evt) {
  // ctrl & command(mac)
  if (evt.keyCode) {
    if (evt.keyCode === 17 || evt.keyCode === 91 || evt.keyCode === 93) {
      return true
    }
    return false
  }

  if (evt.key) {
    if (evt.key === 'Control' || evt.key === 'Meta') {
      return true
    }
  }

  return false
}
