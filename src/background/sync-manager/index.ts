import { SyncService } from './helpers'
import { MsgSyncServiceUpload, MsgSyncServiceInit, MsgSyncServiceDownload } from '@/typings/message'

const reqServices = require['context']('./services', false, /./)

let services: Map<string, SyncService> = new Map()

export function startSyncServiceInterval () {
  services = (reqServices.keys() as string[]).reduce(
    (map, path) => {
      const Service = new reqServices(path).Service
      return map.set(Service.id, new Service())
    },
    services,
  )

  services.forEach(s => s.startInterval())
}

export async function syncServiceInit (msg: MsgSyncServiceInit) {
  const service = services.get(msg.serviceID)
  if (!service) {
    if (process.env.DEV_BUILD) {
      console.error(`Sync service init error: wrong service id ${msg.serviceID}`)
    }
    return wrapError('wrong service id')
  }

  return service.init(msg.config).catch(wrapError)
}

export async function syncServiceUpload (msg: MsgSyncServiceUpload) {
  if (msg.serviceID) {
    const service = services.get(msg.serviceID)
    if (service) {
      return service.upload({ word: msg.word, force: msg.force }).catch(wrapError)
    }

    if (process.env.DEV_BUILD) {
      console.error(`Sync service upload error: wrong service id ${msg.serviceID}`)
    }
  }

  services.forEach(
    s => s.upload({ word: msg.word, force: msg.force }).catch(e => {
      browser.notifications.create({
        type: 'basic',
        iconUrl: browser.runtime.getURL(`static/icon-128.png`),
        title: `Saladict Sync Service ${(s.constructor as typeof SyncService).title[window.appConfig.langCode]}`,
        message: `'${typeof e === 'string' ? e : 'unknown'}' error occurs during uploading.`,
        eventTime: Date.now() + 20000,
        priority: 2,
      })
    })
  )
}

export async function syncServiceDownload (msg: MsgSyncServiceDownload) {
  const service = services.get(msg.serviceID)
  if (!service) {
    if (process.env.DEV_BUILD) {
      console.error(`Sync service download error: wrong service id ${msg.serviceID}`)
    }
    return wrapError('wrong service id')
  }

  return service.download({ noCache: msg.noCache }).catch(wrapError)
}

function wrapError (e: string | Error) {
  return { error: typeof e === 'string' ? e : 'unknown' }
}
