import { message, storage, openURL, __META__ } from '../browser-api'

describe('Browser API Wapper', () => {
  describe('Storage', () => {
    ['sync', 'local'].forEach(area => {
      it(`storage.${area}.clear`, () => {
        browser.storage[area].clear.mockClear()
        storage[area].clear()
        expect(browser.storage[area].clear).toHaveBeenCalledTimes(1)
      })
      it(`storage.${area}.remove`, () => {
        const key = `key-${area}`
        browser.storage[area].remove.mockClear()
        storage[area].remove(key)
        expect(browser.storage[area].remove).toHaveBeenCalledWith(key)
      })
      it(`storage.${area}.get`, () => {
        const key = `key-${area}`
        browser.storage[area].get.mockClear()
        storage[area].get(key)
        expect(browser.storage[area].get).toHaveBeenCalledWith(key)
      })
      it(`storage.${area}.set`, () => {
        const key = { key: area }
        browser.storage[area].set.mockClear()
        storage[area].set(key)
        expect(browser.storage[area].set).toHaveBeenCalledWith(key)
      })
      it(`storage.${area}.addListener`, () => {
        const cb = () => {}
        browser.storage.onChanged.addListener.mockClear()
        storage[area].addListener(cb)
        expect(browser.storage.onChanged.addListener).toHaveBeenCalledTimes(1)
        expect(typeof __META__.storageListeners.get(cb).get(area)).toBe('function')
      })
      it.skip(`storage.${area}.removeListener`, () => {
        const cb = jest.fn()
        storage[area].addListener(cb)
        browser.storage.onChanged.removeListener.mockClear()
        storage[area].removeListener(cb)
        expect(browser.storage.onChanged.removeListener).toHaveBeenCalledTimes(1)
        expect(__META__.storageListeners.get(cb).get(area)).toBeUndefined()
        expect(cb).toHaveBeenCalledTimes(0)
      })
    })

    it(`storage.clear`, () => {
      browser.storage.sync.clear.mockClear()
      browser.storage.local.clear.mockClear()
      storage.clear()
      expect(browser.storage.sync.clear).toHaveBeenCalledTimes(1)
      expect(browser.storage.local.clear).toHaveBeenCalledTimes(1)
    })
    it(`storage.addListener`, () => {
      const cb = jest.fn()
      browser.storage.onChanged.addListener.mockClear()
      storage.addListener(cb)
      expect(browser.storage.onChanged.addListener).toHaveBeenCalledTimes(1)
      expect(typeof __META__.storageListeners.get(cb).get('all')).toBe('function')
      expect(cb).toHaveBeenCalledTimes(0)
    })
    it.skip(`storage.removeListener`, () => {
      const cb = jest.fn()
      storage.addListener(cb)
      browser.storage.onChanged.removeListener.mockClear()
      storage.removeListener(cb)
      expect(browser.storage.onChanged.removeListener).toHaveBeenCalledTimes(1)
      expect(__META__.storageListeners.get(cb).get('all')).toBeUndefined()
      expect(cb).toHaveBeenCalledTimes(0)
    })
  })

  describe('Message', () => {
    it.skip('message.send', () => {
      const tabId = 1
      const msg = {}

      browser.runtime.sendMessage.mockClear()
      browser.tabs.sendMessage.mockClear()
      message.send(msg)
      expect(browser.runtime.sendMessage).toHaveBeenCalledWith(msg)
      expect(browser.tabs.sendMessage).toHaveBeenCalledTimes(0)

      browser.runtime.sendMessage.mockClear()
      browser.tabs.sendMessage.mockClear()
      message.send(tabId, msg)
      expect(browser.tabs.sendMessage).toHaveBeenCalledWith(tabId, msg)
      expect(browser.runtime.sendMessage).toHaveBeenCalledTimes(0)
    })
    it('message.addListener', () => {
      const messageType = 'MSG_1'
      const cb = jest.fn()
      browser.runtime.onMessage.addListener.mockClear()
      message.addListener(cb)
      message.addListener(messageType, cb)
      expect(browser.runtime.onMessage.addListener).toHaveBeenCalledTimes(2)
      expect(cb).toHaveBeenCalledTimes(0)
      expect(__META__.messageListeners.get(cb)).toBeTruthy()
    })
    it.skip('message.removeListener', () => {
      const messageType = 'MSG_1'
      const cb = jest.fn()
      message.addListener(cb)
      message.addListener(messageType, cb)
      browser.runtime.onMessage.removeListener.mockClear()
      message.removeListener(cb)
      message.removeListener(messageType, cb)
      expect(browser.runtime.onMessage.removeListener).toHaveBeenCalledTimes(2)
      expect(cb).toHaveBeenCalledTimes(0)
      expect(__META__.messageListeners.get(cb)).toBeUndefined()
    })

    it('message.self.initClient', () => {

    })
    it('message.self.initServer', () => {

    })
    it('message.self.send', () => {

    })
    it('message.self.addListener', () => {

    })
    it('message.self.removeListener', () => {

    })
  })
})
