import { first } from './promise-more'

interface Suggest {
  entry: string
  explain: string
}

export function getSuggests(text: string): Promise<Suggest[]> {
  return first([getCiba(text), getYoudao(text)]).catch(() => [])
}

function getCiba(text: string): Promise<Suggest[]> {
  return fetch(
    'http://dict-mobile.iciba.com/interface/index.php?c=word&m=getsuggest&nums=10&client=6&uid=0&is_need_mean=1&word=' +
      encodeURIComponent(text)
  )
    .then(r => r.json())
    .then(json => {
      if (json && Array.isArray(json.message)) {
        return json.message
          .filter(x => x && x.key)
          .map(x => ({
            entry: x.key,
            explain:
              Array.isArray(x.means) && x.means.length > 0
                ? x.means[0].part + ' ' + x.means[0].means.join(' ')
                : ''
          }))
      }
      if (process.env.DEBUG) {
        console.warn('fetch suggests failed', text, json)
      }
      throw new Error()
    })
}

function getYoudao(text: string): Promise<Suggest[]> {
  return fetch(
    'https://dict.youdao.com/suggest?doctype=json&le=en&ver=2.0&q=' +
      encodeURIComponent(text)
  )
    .then(r => r.json())
    .then(json => {
      if (json && json.data && Array.isArray(json.data.entries)) {
        return json.data.entries.filter(x => x && x.explain && x.entry)
      }
      if (process.env.DEBUG) {
        console.warn('fetch suggests failed', text, json)
      }
      throw new Error()
    })
}
