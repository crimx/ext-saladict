const path = require('path')
const env = require('dotenv').config({
  path: path.join(__dirname, '../../../../../.env')
}).parsed

module.exports = {
  files: [
    [
      '心/search.json',
      () => ({
        method: 'post',
        url: 'https://api.mojidict.com/parse/functions/search_v3',
        headers: {
          'content-type': 'text/plain'
        },
        data: JSON.stringify({
          langEnv: 'zh-CN_ja',
          needWords: true,
          searchText: '心',
          _ApplicationId: env.MOJI_ID,
          _ClientVersion: 'js2.7.1',
          _InstallationId: getInstallationId()
        })
      })
    ],
    [
      '心/fetchWord.json',
      ([searchResult]) => ({
        method: 'post',
        url: 'https://api.mojidict.com/parse/functions/fetchWord_v2',
        headers: {
          'content-type': 'text/plain'
        },
        data: JSON.stringify({
          wordId: JSON.parse(searchResult).result.searchResults[0].tarId,
          _ApplicationId: env.MOJI_ID,
          _ClientVersion: 'js2.7.1',
          _InstallationId: getInstallationId()
        })
      })
    ],
    [
      '心/fetchTts.json',
      ([searchResult, fetchWordResult]) => {
        const word = JSON.parse(fetchWordResult).result.word
        return {
          method: 'post',
          url: 'https://api.mojidict.com/parse/functions/fetchTts',
          headers: {
            'content-type': 'text/plain'
          },
          data: JSON.stringify({
            identity: word.objectId,
            text: word.spell,
            _ApplicationId: env.MOJI_ID,
            _ClientVersion: 'js2.7.1',
            _InstallationId: getInstallationId()
          })
        }
      }
    ]
  ]
}

function getInstallationId() {
  return s() + s() + '-' + s() + '-' + s() + '-' + s() + '-' + s() + s() + s()
}

function s() {
  return Math.floor(65536 * (1 + Math.random()))
    .toString(16)
    .substring(1)
}
