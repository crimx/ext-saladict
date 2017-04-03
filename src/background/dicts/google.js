import {isContainChinese, isContainEnglish} from 'src/helpers/lang-check'

export default function search (text, config) {
  return new Promise((resolve, reject) => {
    let url
    if (isContainChinese(text)) {
      // zh-CN -> en
      url = 'https://translate.googleapis.com/translate_a/single?client=gtx&sl=zh-CN&tl=en&dt=t&q='
    } else if (isContainEnglish(text)) {
      // en -> zh-CN
      url = 'https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=zh-CN&dt=t&q='
    } else {
      // auto -> zh-CN
      url = 'https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=zh-CN&dt=t&q='
    }

    fetch(url + text)
      .then(r => r.text(), reject)
      .then(handleText, reject)
      .then(resolve, reject)
      .catch(reject)

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
        return Promise.resolve(result)
      } else {
        return Promise.reject('no result')
      }
    }
  })
}
