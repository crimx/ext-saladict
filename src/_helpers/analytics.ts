import UAParser from 'ua-parser-js'
import axios from 'axios'
import uuid from 'uuid/v4'
import { storage } from './browser-api'
import { genUniqueKey } from './uniqueKey'

export async function reportGA(page: string): Promise<void> {
  if (
    process.env.DEV_BUILD ||
    process.env.NODE_ENV === 'test' ||
    !process.env.SDAPP_ANALYTICS
  ) {
    return
  }

  let cid = (await storage.sync.get<{ gacid: string }>('gacid')).gacid
  if (!cid) {
    cid = uuid()
    storage.sync.set({ gacid: cid })
  }

  const ua = new UAParser()
  const browser = ua.getBrowser()
  const os = ua.getOS()

  try {
    await axios({
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
        // others
        de: 'UTF-8',
        dl: document.location.href,
        sd: screen.colorDepth + '-bit',
        sr: screen.width + 'x' + screen.height,
        ul: 'zh-cn',
        // final
        z: genUniqueKey()
      })
    })
  } catch (e) {
    console.log('ga report failed')
  }
}
