import { SyncService, SyncServiceConstructor } from './interface'
import { concat, from } from 'rxjs'
import { filter, pluck, map } from 'rxjs/operators'
import { storage } from '@/_helpers/browser-api'
import { Word } from '@/_helpers/record-manager'
import { notifyError } from './helpers'

const reqServices = require.context('./services', true, /index\.ts$/)

const Services = reqServices.keys().reduce((map, path) => {
  const Servicex = reqServices(path).Service
  return map.set(Servicex.id, Servicex)
}, new Map<string, SyncServiceConstructor>())

const activeServices: Map<string, SyncService> = new Map()

export function startSyncServiceInterval() {
  concat(
    from(storage.sync.get('syncConfig')).pipe(pluck('syncConfig')),
    storage.sync.createStream('syncConfig').pipe(pluck('newValue'))
  )
    .pipe(
      filter((v): v is { [id: string]: any } => !!v),
      map(syncConfig => {
        // legacy fix
        if (
          syncConfig.webdav &&
          !Object.prototype.hasOwnProperty.call(syncConfig.webdav, 'enable')
        ) {
          syncConfig.webdav.enable = !!syncConfig.webdav.url
        }
        return syncConfig
      })
    )
    .subscribe(syncConfig => {
      if (syncConfig) {
        Services.forEach(Service => {
          const service = activeServices.get(Service.id)
          if (syncConfig[Service.id]?.enable) {
            if (service) {
              service.config = syncConfig[Service.id]
            } else {
              const newService = new Service(syncConfig[Service.id])
              activeServices.set(Service.id, newService)
              newService.startInterval()
            }
          } else {
            if (service) {
              service.destroy()
              activeServices.delete(Service.id)
            }
          }
        })
      } else {
        activeServices.forEach(service => service.destroy())
        activeServices.clear()
      }

      if (process.env.DEBUG) {
        console.log(`Active Sync Services:`, [...activeServices.keys()])
      }
    })
}

export async function syncServiceUpload(
  options:
    | {
        action: 'ADD'
        words?: Word[]
        force?: boolean
      }
    | {
        action: 'DELETE'
        dates?: number[]
        force?: boolean
      }
) {
  activeServices.forEach(async (service, id) => {
    try {
      if (options.action === 'ADD') {
        await service.add({ words: options.words, force: options.force })
      } else if (options.action === 'DELETE') {
        await service.delete({ dates: options.dates, force: options.force })
      }
    } catch (error) {
      notifyError(
        id,
        error,
        options.action === 'ADD' && options.words?.[0]
          ? `「${options.words?.[0]}」`
          : ''
      )
    }
  })
}
