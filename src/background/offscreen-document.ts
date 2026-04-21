import { timer } from '@/_helpers/promise-more'

const OFFSCREEN_URL = 'offscreen.html'
const OFFSCREEN_REASONS = ['AUDIO_PLAYBACK', 'CLIPBOARD', 'DOM_PARSER'] as const

let creatingOffscreenDocument: Promise<void> | null = null

export function canUseOffscreenDocument() {
  const manifest = browser.runtime.getManifest()
  const chromeApi = (self as any).chrome

  return !!(manifest.manifest_version === 3 && chromeApi && chromeApi.offscreen)
}

export function getOffscreenDocumentUrl() {
  return browser.runtime.getURL(OFFSCREEN_URL)
}

export async function ensureOffscreenDocument() {
  if (!canUseOffscreenDocument()) {
    return
  }

  if (creatingOffscreenDocument) {
    return creatingOffscreenDocument
  }

  creatingOffscreenDocument = doEnsureOffscreenDocument().finally(() => {
    creatingOffscreenDocument = null
  })

  return creatingOffscreenDocument
}

async function doEnsureOffscreenDocument() {
  const chromeApi = (self as any).chrome
  if (!chromeApi || !chromeApi.offscreen) {
    return
  }

  if (!(await hasOffscreenDocument())) {
    await chromeApi.offscreen.createDocument({
      url: OFFSCREEN_URL,
      reasons: [...OFFSCREEN_REASONS],
      justification:
        'Play audio, access the clipboard, and run DOM-based extension tasks.'
    })
  }

  await waitForOffscreenReady()
}

function hasOffscreenDocument() {
  const chromeApi = (self as any).chrome
  if (chromeApi && chromeApi.runtime && chromeApi.runtime.getContexts) {
    return chromeApi.runtime
      .getContexts({
        contextTypes: ['OFFSCREEN_DOCUMENT'],
        documentUrls: [getOffscreenDocumentUrl()]
      } as any)
      .then((contexts: ArrayLike<any>) => contexts.length > 0)
  }

  return (self as any).clients
    .matchAll()
    .then((clients: Array<{ url?: string }>) =>
      clients.some(client => client.url === getOffscreenDocumentUrl())
    )
}

export async function sendOffscreenMessage<T = any>(message: any): Promise<T> {
  return browser.runtime.sendMessage(message)
}

async function waitForOffscreenReady() {
  for (let attempt = 0; attempt < 10; attempt++) {
    try {
      const ready = await sendOffscreenMessage({
        type: 'SALADICT_OFFSCREEN_PING'
      })
      if (ready) {
        return
      }
    } catch (error) {
      // Wait for the offscreen document bundle to finish booting.
    }

    await timer((attempt + 1) * 50)
  }

  throw new Error('Offscreen document did not become ready in time.')
}
