import { SyncService } from './interface'
import { MsgSyncServiceUpload, MsgSyncServiceInit, MsgSyncServiceDownload, SyncServiceUploadOp } from '@/typings/message'

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
      try {
        if (msg.op === SyncServiceUploadOp.Add) {
          await service.add({ words: msg.words, force: msg.force })
        } else if (msg.op === SyncServiceUploadOp.Delete) {
          await service.delete({ dates: msg.dates, force: msg.force })
        }
      } catch (e) {
        return wrapError(e)
      }
      return
    }

    if (process.env.DEV_BUILD) {
      console.error(`Sync service upload error: wrong service id ${msg.serviceID}`)
    }

    return
  }

  services.forEach(
    async service => {
      try {
        if (msg.op === SyncServiceUploadOp.Add) {
          await service.add({ words: msg.words, force: msg.force })
        } else if (msg.op === SyncServiceUploadOp.Delete) {
          await service.delete({ dates: msg.dates, force: msg.force })
        }
      } catch (e) {
        const title = (service.constructor as typeof SyncService).title[window.appConfig.langCode]
        const errMsg = typeof e === 'string' ? e : 'unknown'
        browser.notifications.create({
          type: 'basic',
          iconUrl: browser.runtime.getURL(`static/icon-128.png`),
          title: `Saladict Sync Service ${title}`,
          message: `Error '${errMsg}' occurs during sync service ${title} uploading.`,
          eventTime: Date.now() + 20000,
          priority: 2,
        })
      }
    }
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
