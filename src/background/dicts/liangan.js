export default function search (text, config) {
  // https://github.com/audreyt/moedict-webkit#7-兩岸詞典-c
  return fetch(`https://www.moedict.tw/c/${text}.json`)
    .then(res => res.json())
    .then(data => {
      if (!data) { return Promise.reject('no result') }
      data.h.forEach(h => {
        if (h.p) {
          h.p = h.p.replace('<br>陸⃝', ' [大陆]: ')
        }
      })
      return data
    })
    .catch(e => Promise.reject(e))
}
