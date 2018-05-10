/**
 * Intercept ajax calls and return fake data
 * You can use libraries like 'mork-fetch', 'faker'
 */

const fakeXHRData = [
  {
    test: {
      method: /.*/,
      url: /bing\.com/,
    },
    response: {
      status: 200,
      responseXML: new DOMParser().parseFromString(
        require('raw-loader!../../test/specs/components/dictionaries/bing/response/lex.html'),
        'text/html'
      )
    },
  },
  {
    test: {
      method: /.*/,
      url: /\.iciba\.com/,
    },
    response: {
      status: 200,
      responseXML: new DOMParser().parseFromString(
        require('raw-loader!../../test/specs/components/dictionaries/cobuild/response/love.html'),
        'text/html'
      )
    },
  },
]

const fakeFetchData = [
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
      return new Promise(resolve => setTimeout(() =>
        resolve(data.response), 1000 + Math.random() * 3000)
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
              setTimeout(() => {
                target.onload()
              }, 1000 + Math.random() * 3000);
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
