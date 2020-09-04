import UAParser from 'ua-parser-js'
import axios from 'axios'
import uuid from 'uuid/v4'
import { storage } from '@/_helpers/browser-api'
import { genUniqueKey } from '@/_helpers/uniqueKey'
import { GAEvent, GAEventBase } from './events'

export type GAParams = { [key: string]: string }

export async function reportPaveview(page: string): Promise<void> {
  const ua = new UAParser()
  const browser = ua.getBrowser()
  const os = ua.getOS()

  try {
    await requestGA({
      t: 'pageview',
      // required by pageview
      dp: page,
      // Dimensions
      cd1: browser.name || 'None',
      cd2: (browser.version || '0.0')
        .split('.')
        .slice(0, 3)
        .join('.'),
      cd3: os.name || 'None',
      cd4: os.version || '0.0',
      // Document Encoding
      de: 'UTF-8',
      // Document location URL
      dl: document.location.href,
      // Screen Colors
      sd: screen.colorDepth + '-bit',
      // Screen Resolution
      sr: screen.width + 'x' + screen.height,
      // User Language
      ul: 'zh-cn'
    })
  } catch (error) {
    if (!process.env.DEBUG) {
      console.error('Report pageview error', error)
    }
  }
}

export async function reportEvent(event: GAEvent) {
  const params: GAParams = {
    t: 'event',
    ec: event.category,
    ea: event.action
  }

  if ((event as GAEventBase).label != null) {
    params.el = (event as GAEventBase).label!
  }

  if ((event as GAEventBase).value != null) {
    params.ev = (event as GAEventBase).value!
  }

  try {
    await requestGA(params)
  } catch (error) {
    if (!process.env.DEBUG) {
      console.error('Report event error', error)
    }
  }
}

async function requestGA(extraParams: GAParams) {
  if (
    process.env.DEBUG ||
    process.env.NODE_ENV === 'test' ||
    process.env.NODE_ENV === 'development'
  ) {
    return
  }

  let cid = (await storage.sync.get<{ gacid: string }>('gacid')).gacid
  if (!cid) {
    cid = uuid()
    storage.sync.set({ gacid: cid })
  }

  return axios({
    url: 'https://www.google-analytics.com/collect',
    method: 'post',
    headers: {
      'content-type': 'text/plain;charset=UTF-8'
    },
    data: new URLSearchParams({
      // required
      v: '1',
      tid: 'UA-49163616-4',
      cid,
      // Cache Buster
      z: genUniqueKey(),
      ...extraParams
    })
  })
}
