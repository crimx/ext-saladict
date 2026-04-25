const HOST = 'https://dict.hujiang.com'

export async function ensureNetworkCompatibility(): Promise<void> {
  const cookiesApi = getBrowserCookies()
  if (!cookiesApi) {
    return
  }

  const visitorId = getUUID()
  const cookies: Array<[string, string | number]> = [
    ['HJ_SITEID', 3],
    ['HJ_UID', visitorId],
    ['HJC_USRC', 'uzhi'],
    ['HJC_NUID', 1],
    ['TRACKSITEMAP', 3],
    ['_REF', ''],
    ['_SREF_3', ''],
    ['HJ_CST', 0],
    ['HJ_CSST_3', 0],
    ['HJ_SID', getSessionId()],
    ['HJ_SSID_3', getSessionId()],
    ['_SREG_3', 'direct%7C%7Cdirect%7Cdirect'],
    ['_REG', 'direct%7C%7Cdirect%7Cdirect'],
    ['HJID', 0],
    ['HJ_VT', 2],
    ['HJ_SST', 1],
    ['HJ_ST', 1],
    ['HJ_T', +new Date()],
    ['_', getUUID(16)]
  ]

  await Promise.all(
    cookies.map(([name, value]) =>
      cookiesApi.set({
        url: HOST,
        name,
        value: String(value)
      })
    )
  )
}

function getBrowserCookies(): typeof browser.cookies | undefined {
  const browserApi = browser as
    | typeof browser
    | { cookies?: typeof browser.cookies }
  return browserApi && browserApi.cookies ? browserApi.cookies : undefined
}

function getSessionId(): string {
  return `${getUUID(6, 36)}-${getUUID('xxxx-4xxx-yxxx-xxxxxxxxxxxx')}`
}

function getUUID(e?: number | string, radix?: number): string {
  let t = radix == null ? 16 : radix
  let n = ''
  if ('number' === typeof e) {
    for (let i = 0; i < e; i++) {
      const r = Math.floor(10 * Math.random())
      n += r % 2 === 0 ? 'x' : 'y'
    }
  } else {
    n = e || 'xxxxxxxx-xyxx-yxxx-xxxy-xxyxxxxxxxxx'
  }
  return (
    ('number' !== typeof t || t < 2 || t > 36) && (t = 16),
    n.replace(/[xy]/g, function(e) {
      const n = (Math.random() * t) | 0
      return ('x' === e ? n : (3 & n) | 8).toString(t)
    })
  )
}
