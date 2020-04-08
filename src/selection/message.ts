import { Message } from '@/typings/message'
import { message } from '@/_helpers/browser-api'

interface PostMessageEvent extends MessageEvent {
  data: {
    type: 'SALADICT_SELECTION'
    payload: Message<'SELECTION'>['payload']
  }
}

export function postMessageHandler({ data, source }: PostMessageEvent) {
  if (!data || data.type !== 'SALADICT_SELECTION') {
    return
  }

  // get the souce iframe
  const matchSrc = ({ contentWindow }: HTMLIFrameElement | HTMLFrameElement) =>
    contentWindow === source

  const frame =
    Array.from(document.querySelectorAll('iframe')).find(matchSrc) ||
    Array.from(document.querySelectorAll('frame')).find(matchSrc)

  if (!frame) {
    return
  }

  const { left, top } = frame.getBoundingClientRect()
  data.payload.mouseX = data.payload.mouseX + left
  data.payload.mouseY = data.payload.mouseY + top
  sendMessage(data.payload)
}

/**
 * Send to upper frame for calculating offset.
 * Finally send to dict panel.
 */
export function sendMessage(payload: Message<'SELECTION'>['payload']) {
  if (window.parent === window) {
    // top
    if (process.env.DEBUG) {
      console.log('New selection', payload)
    }

    message.self.send({
      type: 'SELECTION',
      payload
    })
  } else {
    // post to upper frames/window
    window.parent.postMessage(
      {
        type: 'SALADICT_SELECTION',
        payload
      },
      '*'
    )
  }
}

/**
 * Send a
 */
export function sendEmptyMessage(isDictPanel: boolean) {
  // empty message
  const msg: Message<'SELECTION'> = {
    type: 'SELECTION',
    payload: {
      word: null,
      self: isDictPanel,
      mouseX: 0,
      mouseY: 0,
      dbClick: false,
      shiftKey: false,
      ctrlKey: false,
      metaKey: false,
      instant: false,
      force: false
    }
  }

  if (process.env.DEBUG) {
    console.log('New selection', msg.payload)
  }

  return message.self.send(msg)
}
