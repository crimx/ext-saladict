import { fromPromise } from 'rxjs/observable/fromPromise'
import { switchMap } from 'rxjs/operators/switchMap'
import { delay } from 'rxjs/operators/delay'
import { repeat } from 'rxjs/operators/repeat'
import { empty } from 'rxjs/observable/empty'

import * as service from './services/webdav'
import { createSyncConfigStream, getMeta, setMeta, setNotebook, getNotebook, NotebookFile, getSyncConfig } from './helpers'

// Moniter sync configs and start interval
createSyncConfigStream().pipe(
  switchMap(configs => {
    if (!configs || !configs[service.serviceID]) {
      if (process.env.DEV_BUILD) {
        console.log('No Sync Service Conifg', configs, service.serviceID)
      }
      return empty<void>()
    }

    if (process.env.DEV_BUILD) {
      console.log('Sync Service Conifg', configs, service.serviceID)
    }

    const config = configs[service.serviceID]

    return fromPromise<void>(downlaod(config)).pipe(
      delay(config.duration),
      repeat(),
    )
  })
)

export async function upload () {
  const words = await getNotebook()
  if (!words || words.length <= 0) { return }

  const config = await getSyncConfig<service.SyncConfig>(service.serviceID)
  if (!config) {
    if (process.env.DEV_BUILD) {
      console.warn('Upload notebook failed. No Config.')
    }
    return
  }

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

async function downlaod (config) {
  const meta = await getMeta<service.Meta>(service.serviceID)
  const response = await service.dlChanged(config, meta || {})
  if (!response) { return }

  const { json } = response
  await setMeta<Required<service.Meta>>(
    service.serviceID,
    { timestamp: json.timestamp, etag: response.etag },
  )
  await setNotebook(json.words)
}
