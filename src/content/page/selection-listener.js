/**
 * Listen to mouse selection
 * Apply to all frames
 */

import {message, storage} from 'src/helpers/chrome-api'
import {isContainChinese, isContainEnglish} from 'src/helpers/lang-check'
import defaultConfig from 'src/app-config'

let config = defaultConfig
let numTripleCtrl = 0
let tripleCtrlTimeout = null
let isCtrlKeydown = false

var pageId = -1
message.send({msg: 'PAGE_ID'}, id => {
  if (id) {
    pageId = id
  }
})

storage.sync.get('config', data => {
  if (data.config) {
    config = data.config
  }

  if (config.tripleCtrl) {
    document.addEventListener('keyup', handleTripleCtrlKeyup)
  }
})

storage.sync.listen('config', changes => {
  config = changes.config.newValue

  if (config.tripleCtrl) {
    if (!changes.config.oldValue.tripleCtrl) {
      document.addEventListener('keyup', handleTripleCtrlKeyup)
    }
  } else {
    if (changes.config.oldValue.tripleCtrl) {
      document.removeEventListener('keyup', handleTripleCtrlKeyup)
    }
  }
})

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

function handleTripleCtrlKeyup (evt) {
  // ctrl & command(mac)
  if (isCtrl(evt)) {
    if (++numTripleCtrl === 3) {
      if (!config.tripleCtrl) { return }
      message.send({msg: 'TRIPLE_CTRL_SELF', page: pageId})
    } else {
      if (tripleCtrlTimeout) { clearTimeout(tripleCtrlTimeout) }
      tripleCtrlTimeout = setTimeout(() => {
        numTripleCtrl = 0
        tripleCtrlTimeout = null
      }, 500)
    }
  }
}

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

document.addEventListener('mouseup', evt => {
  if (evt.button !== 0 ||
      !config.active ||
      window.name === 'saladict-frame' ||
      evt.target.className.startsWith('saladict-')
  ) {
    return
  }

  let text = window.getSelection().toString().trim()
  if (!text) {
    // empty message
    message.send({msg: 'SELECTION_SELF', page: pageId})
  } else {
    // if user click on a selected text,
    // getSelection would reture the text before it disappears
    // delay to wait for selection get cleared
    setTimeout(() => {
      let text = window.getSelection().toString().trim()
      if (!text) {
        // empty message
        return message.send({msg: 'SELECTION_SELF', page: pageId})
      }

      if ((config.language.english && isContainEnglish(text)) ||
          (config.language.chinese && isContainChinese(text))) {
        if (window.parent === window) {
          // top
          message.send({
            msg: 'SELECTION_SELF',
            page: pageId,
            text,
            mouseX: evt.clientX,
            mouseY: evt.clientY,
            ctrlKey: isCtrlKeydown
          })
        } else {
          // post to upper frames/window
          window.parent.postMessage({
            msg: 'SALADICT_SELECTION',
            text,
            mouseX: evt.clientX,
            mouseY: evt.clientY,
            ctrlKey: isCtrlKeydown
          }, '*')
        }
      }
    }, 0)
  }
}, true)

window.addEventListener('message', evt => {
  if (evt.data.msg !== 'SALADICT_SELECTION') { return }

  // get the souce iframe
  var iframe
  Array.from(document.querySelectorAll('iframe'))
    .some(f => {
      if (f.contentWindow === evt.source) {
        iframe = f
        return true
      }
    })
  if (!iframe) { return }

  let {text, mouseX, mouseY, ctrlKey} = evt.data
  let pos = iframe.getBoundingClientRect()
  mouseX += pos.left
  mouseY += pos.top

  if (window.parent === window) {
    // top
    message.send({
      msg: 'SELECTION_SELF',
      page: pageId,
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
}, false)

