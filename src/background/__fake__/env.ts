import axios from 'axios'
import AxiosMockAdapter from 'axios-mock-adapter'

browser.runtime.sendMessage['_sender'].callsFake(() => ({
  tab: {
    id: 'saladict-page'
  }
}))

// mock dict search requests
const dictMock = new AxiosMockAdapter(axios)
const dictMockReq = require.context(
  '../../../test/specs/components/dictionaries/',
  true,
  /requests\.mock\.ts$/
)
dictMockReq.keys().forEach(filename => {
  const { mockRequest } = dictMockReq(filename)
  mockRequest(dictMock)
})
dictMock.onAny().reply(config => {
  console.warn(`Unmatch url: ${config.url}`, config)
  return [404, {}]
})
