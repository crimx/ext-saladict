export default function search (text, config) {
  return new Promise((resolve, reject) => {
    // https://github.com/audreyt/moedict-webkit#7-兩岸詞典-c
    fetch(`https://www.moedict.tw/c/${text}.json`)
      .then(res => res.json())
      .then(data => {
        if (!data) { return reject('no result') }
        data.h.forEach(h => {
          if (h.p) {
            h.p = h.p.replace('<br>陸⃝', ' [大陆]: ')
          }
        })
        return resolve(data)
      })
      .catch(reject)
  })
}
