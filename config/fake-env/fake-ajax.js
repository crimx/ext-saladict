/**
 * Intercept ajax calls and return fake data
 * You can use libraries like 'mork-fetch', 'faker'
 */

const fakeXHRData = [
]

const fakeFetchData = [
  {
    test: {
      method: /.*/,
      url: /bing\.com/,
    },
    response: {
      text: () => require('raw-loader!../../test/specs/components/dictionaries/bing/response/lex.html'),
    },
  },
  {
    test: {
      method: /.*/,
      url: /\.iciba\.com/,
    },
    response: {
      text: () => require('raw-loader!../../test/specs/components/dictionaries/cobuild/response/love.html'),
    },
  },
  {
    test: {
      method: /.*/,
      url: /\.etymonline\.com/,
    },
    response: {
      text: () => require('raw-loader!../../test/specs/components/dictionaries/etymonline/response/love.html'),
    },
  },
  {
    test: {
      method: /.*/,
      url: /translate\.googleapis\.com/,
    },
    response: {
      text: () => require('raw-loader!../../test/specs/components/dictionaries/google/response/f.txt')
    },
  },
  {
    test: {
      method: /.*/,
      url: /moedict\.tw/,
    },
    response: {
      json: () => JSON.parse(require('raw-loader!../../test/specs/components/dictionaries/guoyu/response/愛.json'))
    },
  },
  {
    test: {
      method: /.*/,
      url: /urbandictionary\.com/,
    },
    response: {
      text: () => require('raw-loader!../../test/specs/components/dictionaries/urban/response/test.html')
    },
  },
  {
    test: {
      method: /.*/,
      url: /eudic\.net.*tab-detail/,
    },
    response: {
      text: () => require('raw-loader!../../test/specs/components/dictionaries/eudic/response/sentences.html')
    },
  },
  {
    test: {
      method: /.*/,
      url: /eudic\.net/,
    },
    response: {
      text: () => require('raw-loader!../../test/specs/components/dictionaries/eudic/response/love.html')
    },
  },
  {
    test: {
      method: /.*/,
      url: /zdic\.net.*爱/,
    },
    response: {
      text: () => require('raw-loader!../../test/specs/components/dictionaries/zdic/response/爱.html')
    },
  },
  {
    test: {
      method: /.*/,
      url: /zdic\.net.*沙拉/,
    },
    response: {
      text: () => require('raw-loader!../../test/specs/components/dictionaries/zdic/response/沙拉.html')
    },
  },
  {
    test: {
      method: /.*/,
      url: /vocabulary\.com/,
    },
    response: {
      text: () => require('raw-loader!../../test/specs/components/dictionaries/vocabulary/response/love.html')
    },
  },
  {
    test: {
      method: /.*/,
      url: /macmillandictionary\.com.*love$/,
    },
    response: {
      text: () => require('raw-loader!../../test/specs/components/dictionaries/macmillan/response/love.html')
    },
  },
  {
    test: {
      method: /.*/,
      url: /macmillandictionary\.com.*love_2$/,
    },
    response: {
      text: () => require('raw-loader!../../test/specs/components/dictionaries/macmillan/response/love_2.html')
    },
  },
  {
    test: {
      method: /.*/,
      url: /macmillandictionary\.com.*jumblish$/,
    },
    response: {
      text: () => require('raw-loader!../../test/specs/components/dictionaries/macmillan/response/jumblish.html')
    },
  },
  {
    test: {
      method: /.*/,
      url: /ldoceonline\.com.*love$/,
    },
    response: {
      text: () => require('raw-loader!../../test/specs/components/dictionaries/longman/response/love.html')
    },
  },
  {
    test: {
      method: /.*/,
      url: /ldoceonline\.com.*profit$/,
    },
    response: {
      text: () => require('raw-loader!../../test/specs/components/dictionaries/longman/response/profit.html')
    },
  },
  {
    test: {
      method: /.*/,
      url: /ldoceonline\.com.*jumblish$/,
    },
    response: {
      text: () => require('raw-loader!../../test/specs/components/dictionaries/longman/response/jumblish.html')
    },
  },
  {
    test: {
      method: /.*/,
      url: /youdao\.com.*jumblish$/,
    },
    response: {
      text: () => require('raw-loader!../../test/specs/components/dictionaries/youdao/response/jumblish.html')
    },
  },
  {
    test: {
      method: /.*/,
      url: /youdao\.com.*love$/,
    },
    response: {
      text: () => require('raw-loader!../../test/specs/components/dictionaries/youdao/response/love.html')
    },
  },
  {
    test: {
      method: /.*/,
      url: /youdao\.com.*translation$/,
    },
    response: {
      text: () => require('raw-loader!../../test/specs/components/dictionaries/youdao/response/translation.html')
    },
  },
  {
    test: {
      method: /.*/,
      url: /learnersdictionary\.com.*house$/,
    },
    response: {
      text: () => require('raw-loader!../../test/specs/components/dictionaries/websterlearner/response/house.html')
    },
  },
  {
    test: {
      method: /.*/,
      url: /learnersdictionary\.com.*door$/,
    },
    response: {
      text: () => require('raw-loader!../../test/specs/components/dictionaries/websterlearner/response/door.html')
    },
  },
  {
    test: {
      method: /.*/,
      url: /learnersdictionary\.com.*jumblish$/,
    },
    response: {
      text: () => require('raw-loader!../../test/specs/components/dictionaries/websterlearner/response/jumblish.html')
    },
  },
  {
    test: {
      method: /.*/,
      url: /oxfordlearnersdictionaries\.com.*love$/,
    },
    response: {
      text: () => require('raw-loader!../../test/specs/components/dictionaries/oald/response/love.html')
    },
  },
  {
    test: {
      method: /.*/,
      url: /oxfordlearnersdictionaries\.com.*love_2$/,
    },
    response: {
      text: () => require('raw-loader!../../test/specs/components/dictionaries/oald/response/love_2.html')
    },
  },
  {
    test: {
      method: /.*/,
      url: /oxfordlearnersdictionaries\.com.*jumblish$/,
    },
    response: {
      text: () => require('raw-loader!../../test/specs/components/dictionaries/oald/response/jumblish.html')
    },
  },
  {
    test: {
      method: /.*/,
      url: /cambridge\.org.*love$/,
    },
    response: {
      text: () => require('raw-loader!../../test/specs/components/dictionaries/cambridge/response/love.html')
    },
  },
  {
    test: {
      method: /.*/,
      url: /cambridge\.org.*catch$/,
    },
    response: {
      text: () => require('raw-loader!../../test/specs/components/dictionaries/cambridge/response/catch-zht.html')
    },
  },
  {
    test: {
      method: /.*/,
      url: /cambridge\.org.*house$/,
    },
    response: {
      text: () => require('raw-loader!../../test/specs/components/dictionaries/cambridge/response/house-zhs.html')
    },
  },
]

/*-----------------------------------------------*\
    Fake fetch
\*-----------------------------------------------*/
const fetch = window.fetch

window.fetch = (url, ...args) => {
  const data = fakeFetchData.find(data => {
    return data.test.url.test(url)
  })

  if (data) {
    if (data.error) {
      return Promise.reject(data.error)
    } else {
      // return Promise.resolve(data.response)
      let delay = window['FAKE_AJAX_DELAY']
      if (typeof delay === 'undefined') {
        delay = 100 + Math.random() * 3000
      }
      return new Promise(resolve => setTimeout(() =>
        resolve(data.response), delay)
      )
    }
  }

  return fetch(url, ...args)
}

/*-----------------------------------------------*\
    Fake XHR
\*-----------------------------------------------*/

const XMLHttpRequest = window.XMLHttpRequest

function FakeXMLHttpRequest (...args) {
  return new Proxy(new XMLHttpRequest(...args), {
    get (target, propKey) {
      if (propKey === 'open') {
        return function (method, url) {
          const data = fakeXHRData.find(data => {
            return data.test.method.test(method) && data.test.url.test(url)
          })

          if (data) {
            target.__dictData = data
          } else {
            return target.open(method, url)
          }
        }
      }

      if (propKey === 'send') {
        return function (...args) {
          if (target.__dictData) {
            const data = target.__dictData

            if (data.error) {
              target.onerror && target.onerror(new Error(data.error))
              return
            }

            if (target.onload) {
              // target.onload()
              let delay = window['FAKE_AJAX_DELAY']
              if (typeof delay === 'undefined') {
                delay = 100 + Math.random() * 3000
              }
              setTimeout(() => {
                target.onload()
              }, delay);
            }
          } else {
            return target.send(...args)
          }
        }
      }

      if (target.__dictData &&
          target.__dictData.response &&
          typeof target.__dictData.response[propKey] !== 'undefined') {
        return target.__dictData.response[propKey]
      }

      return target[propKey]
    },
    set (target, propKey, value) {
      target[propKey] = value
      return true
    }
  })
}

window.XMLHttpRequest = FakeXMLHttpRequest
