import { fromPromise } from 'rxjs/observable/fromPromise'
import { of } from 'rxjs/observable/of'
import { switchMap } from 'rxjs/operators/switchMap'
import { delay } from 'rxjs/operators/delay'
import { repeat } from 'rxjs/operators/repeat'
import { empty } from 'rxjs/observable/empty'

import * as service from './services/webdav'
import { createSyncConfigStream, getMeta, setMeta, deleteMeta, setNotebook, getNotebook, NotebookFile, getSyncConfig } from './helpers'

/** Init on new server */
export function syncServiceInit (config: any): Promise<{ error?: string }> {
  return service.initServer(config)
}

export function startSyncServiceInterval () {
  // Moniter sync configs and start interval
  return createSyncConfigStream().pipe(
    switchMap(configs => {
      if (!configs || !configs[service.serviceID]) {
        if (process.env.DEV_BUILD) {
          console.log('No Sync Service Conifg', configs, service.serviceID)
        }
        deleteMeta(service.serviceID)
        return empty<void>()
      }

      if (process.env.DEV_BUILD) {
        console.log('Sync Service Conifg', configs, service.serviceID)
      }

      const config = configs[service.serviceID]

      return of('').pipe(
        delay(config.duration),
        switchMap(() => fromPromise<void>(download(config))),
        repeat(),
      )
    })
  ).subscribe()
}

export async function syncServiceUpload (force?: boolean) {
  const config = await getSyncConfig<service.SyncConfig>(service.serviceID)
  if (!config) {
    if (process.env.DEV_BUILD) {
      console.warn('Upload notebook failed. No Config.')
    }
    return
  }

  if (!force) {
    await download(config)
  }

  const words = await getNotebook()
  if (!words || words.length <= 0) { return }

  const timestamp = Date.now()

  let text: string
  try {
    text = JSON.stringify({ timestamp, words } as NotebookFile)
  } catch (e) {
    if (process.env.DEV_BUILD) {
      console.error('Stringify notebook failed', words)
    }
    return
  }

  const ok = await service.upload(config, text)
  if (!ok) {
    if (process.env.DEV_BUILD) {
      console.error('Upload notebook failed. Network Error.')
    }
    return
  }

  await setMeta<Required<service.Meta>>(
    service.serviceID,
    { timestamp, etag: '' },
  )
}

export async function syncServiceDownload (force?: boolean): Promise<void> {
  const config = await getSyncConfig<service.SyncConfig>(service.serviceID)
  if (!config) {
    if (process.env.DEV_BUILD) {
      console.warn('Download notebook failed. No Config.')
    }
    return
  }
  await download(config, force)
}

async function download (config, force?: boolean) {
  const meta = await getMeta<service.Meta>(service.serviceID)
  const response = await service.dlChanged(config, meta || {}, force)
  if (!response) { return }

  const { json } = response
  await setMeta<Required<service.Meta>>(
    service.serviceID,
    { timestamp: json.timestamp, etag: response.etag },
  )
  await setNotebook(json.words)
}
