/**
 * Listen to mouse selection
 * Apply to all frames
 */

import {message, storage} from 'src/helpers/chrome-api'
import defaultConfig from 'src/app-config'

let config = defaultConfig

storage.sync.get('config', data => {
  if (data.config) {
    config = data.config
  }
})

storage.listen('config', changes => {
  config = changes.config.newValue
})

document.addEventListener('mouseup', evt => {
  if (!config.active || window.name === 'saladict-frame') { return }

  let text = window.getSelection().toString()
  if (!text) {
    // empty message
    message.send({msg: 'SELECTION', self: true})
  } else {
    // if user click on a selected text,
    // getSelection would reture the text before it disappears
    // delay to wait for selection get cleared
    setTimeout(() => {
      let text = window.getSelection().toString()
      if (!text) {
        // empty message
        message.send({msg: 'SELECTION', self: true})
      } else if (window.parent === window) {
        // top
        message.send({
          msg: 'SELECTION',
          self: true,
          text,
          mouseX: evt.clientX,
          mouseY: evt.clientY,
          ctrlKey: evt.ctrlKey
        })
      } else {
        // post to upper frames/window
        window.parent.postMessage({
          msg: 'SALADICT_SELECTION',
          text,
          mouseX: evt.clientX,
          mouseY: evt.clientY,
          ctrlKey: evt.ctrlKey
        }, '*')
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
      msg: 'SELECTION',
      self: true,
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
