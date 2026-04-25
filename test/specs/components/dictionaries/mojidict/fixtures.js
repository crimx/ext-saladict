const API_ROOT = 'https://api.mojidict.com/app/mojidict/api/v1'
const PARSE_ROOT = 'https://api.mojidict.com/parse/functions'
const WEB_ROOT = 'https://www.mojidict.com'
const MOJI_APP_VERSION = '4.15.13'
const MOJI_PARSE_APP_ID = 'E62VyFVLMiW7kvbtVq3p'
const MOJI_PARSE_CLIENT_VERSION = 'js4.3.1'

module.exports = {
  files: [
    [
      '心/all.json',
      () => ({
        method: 'get',
        url:
          `${API_ROOT}/search/all?text=${encodeURIComponent('心')}` +
          '&types=102&types=106&types=103&types=671&highlight=true',
        headers: requestHeaders()
      })
    ],
    [
      '心/detailInfo.json',
      ([allResult]) => ({
        method: 'get',
        url:
          `${API_ROOT}/word/detailInfo?wordId=` +
          JSON.parse(allResult).word.list[0].targetId,
        headers: requestHeaders()
      })
    ],
    [
      '心/example.json',
      ([allResult]) => ({
        method: 'get',
        url:
          `${API_ROOT}/search/example?text=${encodeURIComponent('心')}` +
          '&limit=3&needNotation=true&onlyJP=true&onlyFull=true' +
          '&targetTypes=121&wordId=' +
          JSON.parse(allResult).word.list[0].targetId,
        headers: requestHeaders()
      })
    ],
    [
      '心/examQuestion.json',
      ([allResult]) => ({
        method: 'get',
        url:
          `${API_ROOT}/search/examQuestion?text=${encodeURIComponent('心')}` +
          '&limit=3&highlight=false&onlyFull=true&wordId=' +
          JSON.parse(allResult).word.list[0].targetId,
        headers: requestHeaders()
      })
    ],
    [
      '心/related.json',
      ([allResult]) => ({
        method: 'post',
        url: `${API_ROOT}/word/related`,
        headers: {
          ...requestHeaders(),
          'content-type': 'application/json'
        },
        data: {
          wordIds: [JSON.parse(allResult).word.list[0].targetId]
        }
      })
    ],
    [
      '心/fetchTts.json',
      ([allResult]) => ({
        method: 'post',
        url: `${PARSE_ROOT}/tts-fetch`,
        headers: {
          accept: '*/*',
          origin: WEB_ROOT,
          referer: `${WEB_ROOT}/`,
          'content-type': 'text/plain'
        },
        data: JSON.stringify({
          tarId: JSON.parse(allResult).word.list[0].targetId,
          tarType: 102,
          voiceId: 'f002',
          _ApplicationId: MOJI_PARSE_APP_ID,
          _ClientVersion: MOJI_PARSE_CLIENT_VERSION,
          _InstallationId: getInstallationId(),
          g_os: 'PCWeb',
          g_ver: MOJI_APP_VERSION
        })
      })
    ]
  ]
}

function requestHeaders() {
  return {
    accept: 'application/json, text/plain, */*',
    origin: WEB_ROOT,
    referer: `${WEB_ROOT}/`,
    'x-moji-app-id': 'com.mojitec.mojidict',
    'x-moji-app-version': MOJI_APP_VERSION,
    'x-moji-device-id': getInstallationId(),
    'x-moji-os': 'PCWeb'
  }
}

function getInstallationId() {
  return s() + s() + '-' + s() + '-' + s() + '-' + s() + '-' + s() + s() + s()
}

function s() {
  return Math.floor(65536 * (1 + Math.random()))
    .toString(16)
    .substring(1)
}
