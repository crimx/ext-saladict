/**
 * Listen to mouse selection
 * Apply to all frames
 */

import {message, storage} from 'src/helpers/chrome-api'
import {isContainChinese, isContainEnglish} from 'src/helpers/lang-check'
import defaultConfig from 'src/app-config'

let config = defaultConfig
let numCtrlKeydown = 0
let ctrlTimeout = null

storage.sync.get('config', data => {
  if (data.config) {
    config = data.config
  }

  if (config.tripleCtrl) {
    document.addEventListener('keyup', handleCtrlKeyup)
  }
})

storage.listen('config', changes => {
  config = changes.config.newValue

  if (config.tripleCtrl) {
    if (!changes.config.oldValue.tripleCtrl) {
      document.addEventListener('keyup', handleCtrlKeyup)
    }
  } else {
    if (changes.config.oldValue.tripleCtrl) {
      document.removeEventListener('keyup', handleCtrlKeyup)
    }
  }
})

function handleCtrlKeyup (evt) {
  // ctrl & command(mac)
  if (evt.keyCode === 17 || evt.keyCode === 91 || evt.keyCode === 93) {
    if (++numCtrlKeydown === 3) {
      if (!config.tripleCtrl) { return }
      message.send({msg: 'TRIPLE_CTRL_SELF'})
    } else {
      if (ctrlTimeout) { clearTimeout(ctrlTimeout) }
      ctrlTimeout = setTimeout(() => {
        numCtrlKeydown = 0
        ctrlTimeout = null
      }, 500)
    }
  }
}

document.addEventListener('mouseup', evt => {
  if (evt.button !== 0 || !config.active || window.name === 'saladict-frame') { return }

  let text = window.getSelection().toString().trim()
  if (!text) {
    // empty message
    message.send({msg: 'SELECTION_SELF'})
  } else {
    // if user click on a selected text,
    // getSelection would reture the text before it disappears
    // delay to wait for selection get cleared
    setTimeout(() => {
      let text = window.getSelection().toString().trim()
      if (!text) {
        // empty message
        return message.send({msg: 'SELECTION_SELF'})
      }

      if ((config.language.english && isContainEnglish(text)) ||
          (config.language.chinese && isContainChinese(text))) {
        if (window.parent === window) {
          // top
          message.send({
            msg: 'SELECTION_SELF',
            text,
            mouseX: evt.clientX,
            mouseY: evt.clientY,
            ctrlKey: evt.ctrlKey || evt.metaKey
          })
        } else {
          // post to upper frames/window
          window.parent.postMessage({
            msg: 'SALADICT_SELECTION',
            text,
            mouseX: evt.clientX,
            mouseY: evt.clientY,
            ctrlKey: evt.ctrlKey || evt.metaKey
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

