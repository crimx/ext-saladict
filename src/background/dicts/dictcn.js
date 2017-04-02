import fetchDom from 'src/helpers/fetch-dom'

export default function search (text, config) {
  return new Promise((resolve, reject) => {
    const options = config.dicts.all.dictcn.options

    fetchDom('http://dict.cn/' + text)
      .then(handleDom, reject)
      .then(resolve, reject)
      .catch(reject)

    function handleDom (doc) {
      let result = {}

      if (options.chart) {
        // chart
        try {
          result.chart = JSON.parse(decodeURIComponent(doc.getElementById('dict-chart-basic').getAttribute('data')))
        } catch (e) {}
      }

      if (options.etym) {
        // etymology
        let $etym = doc.querySelector('.etm')
        if ($etym && $etym.innerText) {
          result.etym = $etym.innerText.split('\n')
        }
      }

      if (Object.keys(result).length <= 0) {
        return Promise.reject('no result')
      }

      return Promise.resolve(result)
    }
  })
}
