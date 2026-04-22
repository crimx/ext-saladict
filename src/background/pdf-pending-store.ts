import { PdfSniffAction } from './pdf-sniffer-shared'

export interface PendingPdfOpen {
  action: PdfSniffAction
  createdAt: number
  frameId: number
  source: 'url' | 'headers'
  tabId: number
  url: string
}

type StorageAreaLike = {
  get: (keys?: string | string[] | null) => Promise<Record<string, any>>
  remove: (keys: string | string[]) => Promise<void>
  set: (items: Record<string, any>) => Promise<void>
}

const STORAGE_KEY_PREFIX = 'saladict:pdf-pending:'
const PENDING_TTL = 2 * 60 * 1000

function getStorageArea(): StorageAreaLike {
  const chromeApi = (self as any).chrome
  if (chromeApi && chromeApi.storage && chromeApi.storage.session) {
    return chromeApi.storage.session
  }

  return browser.storage.local as any
}

function getStorageKey(tabId: number, frameId: number) {
  return `${STORAGE_KEY_PREFIX}${tabId}:${frameId}`
}

function isPendingPdfOpen(value: any): value is PendingPdfOpen {
  return (
    !!value &&
    typeof value.url === 'string' &&
    typeof value.tabId === 'number' &&
    typeof value.frameId === 'number' &&
    typeof value.createdAt === 'number' &&
    (value.action === 'open' || value.action === 'bypass')
  )
}

function isFresh(entry: PendingPdfOpen) {
  return Date.now() - entry.createdAt <= PENDING_TTL
}

export async function rememberPendingPdfOpen(entry: PendingPdfOpen) {
  await cleanupStalePendingPdfOpens()

  const storageArea = getStorageArea()
  const key = getStorageKey(entry.tabId, entry.frameId)

  await storageArea.set({
    [key]: entry
  })
}

export async function consumePendingPdfOpen(tabId: number, frameId: number) {
  await cleanupStalePendingPdfOpens()

  const storageArea = getStorageArea()
  const key = getStorageKey(tabId, frameId)
  const result = (await storageArea.get(key)) || {}
  const entry = result[key]

  await storageArea.remove(key)

  if (!isPendingPdfOpen(entry) || !isFresh(entry)) {
    return null
  }

  return entry
}

export async function cleanupStalePendingPdfOpens() {
  const storageArea = getStorageArea()
  const allItems = (await storageArea.get(null)) || {}
  const staleKeys = Object.keys(allItems).filter(key => {
    if (!key.startsWith(STORAGE_KEY_PREFIX)) {
      return false
    }

    const entry = allItems[key]
    return !isPendingPdfOpen(entry) || !isFresh(entry)
  })

  if (staleKeys.length > 0) {
    await storageArea.remove(staleKeys)
  }
}
