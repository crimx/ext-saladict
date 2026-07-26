import { Message } from '@/typings/message'
import { message } from '@/_helpers/browser-api'

interface PostMessageEvent extends MessageEvent {
  data: {
    type: 'SALADICT_SELECTION'
    payload: Message<'SELECTION'>['payload']
  }
}

function findFrameBySource(source: MessageEventSource | null) {
  const roots: Array<Document | ShadowRoot> = [document]

  while (roots.length) {
    const root = roots.pop()!
    const frame = Array.from(
      root.querySelectorAll<HTMLIFrameElement | HTMLFrameElement>(
        'iframe, frame'
      )
    ).find(({ contentWindow }) => contentWindow === source)

    if (frame) {
      return frame
    }

    for (const element of Array.from(root.querySelectorAll('*'))) {
      if (element.shadowRoot) {
        roots.push(element.shadowRoot)
      }
    }
  }
}

export function postMessageHandler({ data, source }: PostMessageEvent) {
  if (!data || data.type !== 'SALADICT_SELECTION') {
    return
  }

  // Search open shadow roots because reader frames may be nested inside one.
  const frame = findFrameBySource(source)

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
      altKey: false,
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
