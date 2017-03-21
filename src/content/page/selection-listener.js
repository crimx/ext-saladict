/**
 * Listen to mouse selection
 * Apply to all frames
 */

import {message} from 'src/helpers/chrome-api'

document.addEventListener('mouseup', evt => {
  if (window.name === 'saladict-frame') { return }

  let text = window.getSelection().toString()
  // fire anyway, even with no selection
  message.send({
    msg: 'SELECTION',
    text,
    ctrlKey: evt.ctrlKey
  })
}, true)
