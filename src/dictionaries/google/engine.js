import {isContainChinese, isContainEnglish} from 'src/helpers/lang-check'

export default function search (text, config) {
  // auto -> zh-CN
  let url = 'https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=zh-CN&dt=t&q='

  if (isContainChinese(text)) {
    // zh-CN -> en
    url = 'https://translate.googleapis.com/translate_a/single?client=gtx&sl=zh-CN&tl=en&dt=t&q='
  } else if (isContainEnglish(text)) {
    // en -> zh-CN
    url = 'https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=zh-CN&dt=t&q='
  }

  return fetch(url + text)
    .then(r => r.text())
    .then(handleText)
    .catch(e => Promise.reject(e))
}

/**
 * @async
 * @returns {Promise.<string>} A promise with the result to send back
 */
function handleText (text) {
  let json = JSON.parse(text.replace(/,+/g, ','))

  if (!json[0] || json[0].length <= 0) {
    return Promise.reject('no result')
  }

  let result = json[0].map(item => item[0]).join(' ')

  if (result.length > 0) {
    return result
  } else {
    return Promise.reject('no result')
  }
}
