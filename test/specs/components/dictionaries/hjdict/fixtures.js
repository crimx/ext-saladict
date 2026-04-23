const Accept =
  'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7'

let cookies

function getRandomChars(length, alphabet) {
  let result = ''

  for (let index = 0; index < length; index += 1) {
    const randomIndex = Math.floor(Math.random() * alphabet.length)
    result += alphabet[randomIndex]
  }

  return result
}

function getMaskedId(template) {
  return template.replace(/[xy]/g, char => {
    const value = Math.floor(Math.random() * 16)
    return (char === 'x' ? value : (value & 3) | 8).toString(16)
  })
}

function getVisitorId() {
  return getMaskedId('xxxxxxxx-xyxx-yxxx-xxxy-xxyxxxxxxxxx')
}

function getSessionId() {
  return `${getRandomChars(
    6,
    '0123456789abcdefghijklmnopqrstuvwxyz'
  )}-${getMaskedId('xxxx-4xxx-yxxx-xxxxxxxxxxxx')}`
}

function ensureCookies() {
  if (cookies) {
    return cookies
  }

  const visitorId = getVisitorId()

  cookies = [
    `HJ_UID=${visitorId}`,
    'HJC_USRC=uzhi',
    'HJC_NUID=1',
    'TRACKSITEMAP=3',
    `HJ_UID=${visitorId}`,
    '_REF=',
    '_SREF_3=',
    'HJ_CST=0',
    'HJ_CSST_3=0',
    `HJ_SID=${getSessionId()}`,
    `HJ_SSID_3=${getSessionId()}`,
    '_SREG_3=direct%7C%7Cdirect%7Cdirect',
    '_REG=direct%7C%7Cdirect%7Cdirect'
  ].join('; ')
  return cookies
}

function wrapCookies(url) {
  return () => ({
    url,
    headers: {
      Accept,
      Cookie: ensureCookies()
    }
  })
}

module.exports = {
  files: [
    ['love.html', wrapCookies('https://dict.hujiang.com/w/love')],
    ['爱.html', wrapCookies('https://dict.hujiang.com/jp/jc/%E7%88%B1')]
  ]
}
