import UAParser from 'ua-parser-js'
import axios from 'axios'
import uuid from 'uuid/v4'
import { message, storage } from '@/_helpers/browser-api'
import { getConfig } from '@/_helpers/config-manager'
import { GAEvent, GAEventBase } from './events'
import { isBackgroundPage, isFirefox } from '../saladict'

export type GAEventParams = { [key: string]: string | number | undefined }

export interface GAEventPayload {
  name: string
  params?: GAEventParams
}

const GA4_MEASUREMENT_ID = process.env.SDAPP_GA4_MEASUREMENT_ID
const GA4_API_SECRET = process.env.SDAPP_GA4_API_SECRET
const FIREFOX_TECHNICAL_AND_INTERACTION = 'technicalAndInteraction'
const GA_SESSION_ID = Date.now()

export async function reportPageView(page: string): Promise<void> {
  const ua = new UAParser()
  const browser = ua.getBrowser()
  const os = ua.getOS()

  try {
    await requestGA({
      name: 'page_view',
      params: {
        page_title: page,
        page_location: `ext://saladict${page}`,
        page_path: page,
        browser_name: browser.name || 'None',
        browser_version: (browser.version || '0.0')
          .split('.')
          .slice(0, 3)
          .join('.'),
        os_name: os.name || 'None',
        os_version: os.version || '0.0',
        screen_resolution: screen.width + 'x' + screen.height,
        screen_color_depth: screen.colorDepth + '-bit',
        language: navigator.language || 'unknown'
      }
    })
  } catch (error) {
    if (!process.env.DEBUG) {
      console.error('Report pageview error', error)
    }
  }
}

export async function reportEvent(event: GAEvent) {
  const params: GAEventParams = {
    category: event.category,
    action: event.action
  }

  if ((event as GAEventBase).label != null) {
    params.label = (event as GAEventBase).label!
  }

  if ((event as GAEventBase).value != null) {
    params.value = (event as GAEventBase).value!
  }

  try {
    await requestGA({
      name: `${event.category}_${event.action}`.toLowerCase(),
      params
    })
  } catch (error) {
    if (!process.env.DEBUG) {
      console.error('Report event error', error)
    }
  }
}

export async function canReportGA(): Promise<boolean> {
  if (!isFirefox) {
    const config = await getConfig()
    return config.analytics
  }

  try {
    const permissions = (await browser.permissions.getAll()) as {
      data_collection?: string[]
    }
    return (
      Array.isArray(permissions.data_collection) &&
      permissions.data_collection.indexOf(FIREFOX_TECHNICAL_AND_INTERACTION) >=
        0
    )
  } catch (error) {
    if (process.env.DEBUG) {
      console.error('Check Firefox analytics permission error', error)
    }
  }

  return false
}

export function buildGA4Payload(clientId: string, event: GAEventPayload) {
  return {
    client_id: clientId,
    events: [
      {
        name: event.name,
        params: {
          engagement_time_msec: 1,
          session_id: GA_SESSION_ID,
          ...event.params
        }
      }
    ]
  }
}

async function requestGA(event: GAEventPayload) {
  if (!isBackgroundPage()) {
    return message.send({
      type: 'REQUEST_GA',
      payload: event
    })
  }

  if (
    process.env.DEBUG ||
    process.env.NODE_ENV === 'test' ||
    process.env.NODE_ENV === 'development'
  ) {
    console.log('requestGA', event)
    return
  }

  if (!GA4_MEASUREMENT_ID || !GA4_API_SECRET || !(await canReportGA())) {
    return
  }

  let cid = (await storage.sync.get<{ gacid: string }>('gacid')).gacid
  if (!cid) {
    cid = uuid()
    storage.sync.set({ gacid: cid })
  }

  return axios({
    url: 'https://www.google-analytics.com/mp/collect',
    method: 'post',
    headers: {
      'content-type': 'application/json'
    },
    params: {
      measurement_id: GA4_MEASUREMENT_ID,
      api_secret: GA4_API_SECRET
    },
    data: buildGA4Payload(cid, event)
  })
}

export function setupRequestGAListener() {
  message.addListener('REQUEST_GA', ({ payload }) => {
    requestGA(payload)
  })
}
