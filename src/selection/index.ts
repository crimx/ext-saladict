import { getText, getSentence } from 'get-selection-more'
import { AppConfig } from '@/app-config'
import { message } from '@/_helpers/browser-api'
import { newWord } from '@/_helpers/record-manager'
import { createConfigStream } from '@/_helpers/config-manager'
import { isInDictPanel } from '@/_helpers/saladict'

import { merge, from } from 'rxjs'
import { share, pluck, startWith, withLatestFrom } from 'rxjs/operators'

import { postMessageHandler, sendMessage, sendEmptyMessage } from './message'
import { isEscapeKey, whenKeyPressed } from './helper'
import { createIntantCaptureStream } from './instant-capture'
import { createQuickSearchStream } from './quick-search'
import { createSelectTextStream } from './select-text'
import { createMousedownStream } from './mouse-events'

const config$$ = share<AppConfig>()(createConfigStream())
const mousedown$$ = createMousedownStream()

/**
 * Send selection to standalone page
 * Beware that this is run on every frame.
 */
message.addListener('PRELOAD_SELECTION', () => {
  const text = getText()
  if (text) {
    return Promise.resolve(
      newWord({
        text,
        context: getSentence()
      })
    )
  }
})

/**
 * Manualy emit selection
 * Beware that this is run on every frame.
 */
message
  .createStream('EMIT_SELECTION')
  .pipe(withLatestFrom(mousedown$$))
  .subscribe(([, event]) => {
    if (event) {
      const text = getText()
      if (text) {
        const { clientX, clientY } =
          event instanceof MouseEvent ? event : event.changedTouches[0]
        sendMessage({
          mouseX: clientX,
          mouseY: clientY,
          instant: true,
          self: isInDictPanel(event.target),
          word: newWord({ text, context: getSentence() }),
          dbClick: false,
          shiftKey: Boolean(event['shiftKey']),
          ctrlKey: Boolean(event['ctrlKey']),
          metaKey: Boolean(event['metaKey']),
          force: false
        })
      }
    }
  })

/** Pass through message from iframes */
window.addEventListener('message', postMessageHandler)

/**
 * Escape key pressed
 */
whenKeyPressed(isEscapeKey).subscribe(() =>
  message.self.send({ type: 'ESCAPE_KEY' })
)

createQuickSearchStream(config$$).subscribe(() => {
  message.self.send({ type: 'TRIPLE_CTRL' })
})

createSelectTextStream(config$$, mousedown$$).subscribe(result => {
  if (typeof result === 'boolean') {
    sendEmptyMessage(result)
  } else {
    sendMessage({
      mouseX: result.event.clientX,
      mouseY: result.event.clientY,
      dbClick: result.clickCount >= 2,
      shiftKey: Boolean(result.event['shiftKey']),
      ctrlKey: Boolean(result.event['ctrlKey']),
      metaKey: Boolean(result.event['metaKey']),
      self: result.self,
      word: newWord({ text: result.text, context: result.context }),
      instant: false,
      force: false
    })
  }
})

createIntantCaptureStream(
  config$$,
  message.self.createStream('PIN_STATE').pipe(
    pluck('payload'),
    startWith(false)
  ),
  merge(
    // When Quick Search Panel show and hide
    from(message.send<'QUERY_QS_PANEL'>({ type: 'QUERY_QS_PANEL' })),
    message.createStream('QS_PANEL_CHANGED').pipe(
      pluck('payload'),
      startWith(false)
    )
  )
).subscribe(({ word, event, self }) => {
  sendMessage({
    word,
    shiftKey: event.shiftKey,
    ctrlKey: event.ctrlKey,
    metaKey: event.metaKey,
    dbClick: false,
    force: false,
    instant: true,
    mouseX: event.clientX,
    mouseY: event.clientY,
    self
  })
})
