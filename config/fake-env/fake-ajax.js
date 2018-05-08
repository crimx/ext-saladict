/**
 * Intercept ajax calls and return fake data
 * You can use libraries like 'mork-fetch', 'faker'
 */

 // bing search result example
const fakeData = [
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
  }
]

const XMLHttpRequest = window.XMLHttpRequest

function FakeXMLHttpRequest (...args) {
  return new Proxy(new XMLHttpRequest(...args), {
    get (target, propKey) {
      if (propKey === 'open') {
        return function (method, url) {
          const data = fakeData.find(data => {
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
              target.onload()
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
