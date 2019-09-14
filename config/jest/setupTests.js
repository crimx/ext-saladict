import browser from 'sinon-chrome/extensions'
// import Enzyme from 'enzyme'
// import Adapter from 'enzyme-adapter-react-16'
import raf from 'raf'
import fetch from 'node-fetch'

window.browser = browser
window.Request = fetch.Request
window.Response = fetch.Response
window.Headers = fetch.Headers

if (process.env.CI) {
  window.FormData = require('form-data')
  window.fetch = fetch

  jest.setTimeout(30000)
}

// Enzyme.configure({ adapter: new Adapter() })

// In tests, polyfill requestAnimationFrame since jsdom doesn't provide it yet.
// We don't polyfill it in the browser--this is user's responsibility.
raf.polyfill(global)
