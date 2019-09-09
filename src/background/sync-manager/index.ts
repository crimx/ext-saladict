import { SyncService } from './interface'
import { Message } from '@/typings/message'

const reqServices = require.context('./services', false, /./)

let services: Map<string, SyncService> = new Map()

export function startSyncServiceInterval() {
  services = reqServices.keys().reduce((map, path) => {
    const Service = reqServices(path).Service
    return map.set(Service.id, new Service())
  }, services)

  services.forEach(s => s.startInterval())
}

export async function syncServiceInit({
  serviceID,
  config
}: Message<'SYNC_SERVICE_INIT'>['payload']) {
  const service = services.get(serviceID)
  if (!service) {
    if (process.env.DEV_BUILD) {
      console.error(`Sync service init error: wrong service id ${serviceID}`)
    }
    return wrapError('wrong service id')
  }
  return service.init(config).catch(wrapError)
}

export async function syncServiceUpload(
  payload: Message<'SYNC_SERVICE_UPLOAD'>['payload']
) {
  let selectedServices: SyncService[] = []
  if (payload.serviceID) {
    const service = services.get(payload.serviceID)
    if (!service) {
      console.error(
        `Sync service upload error: wrong service id ${payload.serviceID}`
      )
      return
    }
    selectedServices.push(service)
  }

  if (selectedServices.length <= 0) {
    selectedServices.push(...services.values())
  }

  return Promise.all(
    selectedServices.map(async service => {
      try {
        if (payload.op === 'ADD') {
          await service.add({ words: payload.words, force: payload.force })
        } else if (payload.op === 'DELETE') {
          await service.delete({ dates: payload.dates, force: payload.force })
        }
      } catch (e) {
        const title = (service.constructor as typeof SyncService).title[
          window.appConfig.langCode
        ]
        const errMsg = typeof e === 'string' ? e : 'unknown'
        browser.notifications.create({
          type: 'basic',
          iconUrl: browser.runtime.getURL(`assets/icon-128.png`),
          title: `Saladict Sync Service ${title}`,
          message: `Error '${errMsg}' occurs during sync service ${title} uploading.`,
          eventTime: Date.now() + 20000,
          priority: 2
        })
      }
    })
  )
}

export async function syncServiceDownload({
  serviceID,
  noCache
}: Message<'SYNC_SERVICE_DOWNLOAD'>['payload']) {
  const service = services.get(serviceID)
  if (!service) {
    if (process.env.DEV_BUILD) {
      console.error(
        `Sync service download error: wrong service id ${serviceID}`
      )
    }
    return wrapError('wrong service id')
  }

  return service.download({ noCache }).catch(wrapError)
}

function wrapError(e: string | Error) {
  return { error: typeof e === 'string' ? e : 'unknown' }
}
