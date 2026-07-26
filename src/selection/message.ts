import { Message } from '@/typings/message'
import { message } from '@/_helpers/browser-api'

interface PostMessageEvent extends MessageEvent {
  data: {
    type: 'SALADICT_SELECTION'
    payload: Message<'SELECTION'>['payload']
  }
}

type FrameElement = HTMLIFrameElement | HTMLFrameElement

const frameBySource = new WeakMap<object, FrameElement>()

function isFrameElement(element: Element | null): element is FrameElement {
  return (
    element instanceof HTMLIFrameElement || element instanceof HTMLFrameElement
  )
}

function findFrameBySource(source: MessageEventSource | null) {
  if (!source) {
    return
  }

  const cachedFrame = frameBySource.get(source)
  if (
    cachedFrame &&
    cachedFrame.isConnected &&
    cachedFrame.contentWindow === source
  ) {
    return cachedFrame
  }

  // This also works for frames inside closed shadow roots when same-origin.
  try {
    const frame = (source as Window).frameElement
    if (isFrameElement(frame)) {
      frameBySource.set(source, frame)
      return frame
    }
  } catch {
    // Accessing frameElement on a cross-origin WindowProxy throws.
  }

  const roots: Array<Document | ShadowRoot> = [document]

  while (roots.length) {
    const root = roots.pop()!
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_ELEMENT)
    let element = walker.nextNode() as Element | null

    while (element) {
      if (isFrameElement(element) && element.contentWindow === source) {
        frameBySource.set(source, element)
        return element
      }

      if (element.shadowRoot) {
        roots.push(element.shadowRoot)
      }

      element = walker.nextNode() as Element | null
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
