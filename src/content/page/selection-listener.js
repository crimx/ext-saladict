/**
 * Listen to mouse selection
 * Apply to all frames
 */

import {message} from 'src/helpers/chrome-api'

document.addEventListener('mouseup', evt => {
  if (window.name === 'saladict-frame') { return }

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
      // fire anyway, even with no selection
      message.send({
        msg: 'SELECTION',
        self: true,
        text,
        ctrlKey: evt.ctrlKey
      })
    }, 0)
  }
}, true)
