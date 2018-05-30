import browser from 'sinon-chrome/extensions'
import Enzyme from 'enzyme'
import Adapter from 'enzyme-adapter-react-16'
import raf from 'raf'

window.browser = browser

Enzyme.configure({ adapter: new Adapter() })

// In tests, polyfill requestAnimationFrame since jsdom doesn't provide it yet.
// We don't polyfill it in the browser--this is user's responsibility.
raf.polyfill(global)
