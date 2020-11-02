import { message, storage, openUrl } from '@/_helpers/browser-api'
import { take } from 'rxjs/operators'
import sinon from 'sinon'
import { browser } from '../../helper'
import { Message } from '@/typings/message'

describe('Browser API Wapper', () => {
  beforeEach(() => {
    browser.flush()
    delete window.pageId
    delete window.faviconURL
    delete window.pageTitle
    delete window.pageURL
    browser.runtime.sendMessage.callsFake(() => Promise.resolve({}))
    browser.tabs.sendMessage.callsFake(() => Promise.resolve({}))
  })

  describe('Storage', () => {
    const storageArea: ['sync', 'local'] = ['sync', 'local']
    storageArea.forEach(area => {
      it(`storage.${area}.clear`, () => {
        storage[area].clear()
        expect(browser.storage[area].clear.calledOnce).toBeTruthy()
      })
      it(`storage.${area}.remove`, () => {
        const key = `key-${area}`
        storage[area].remove(key)
        expect(browser.storage[area].remove.calledWith(key)).toBeTruthy()
      })
      it(`storage.${area}.get`, () => {
        const key = `key-${area}`
        storage[area].get(key)
        expect(browser.storage[area].get.calledWith(key)).toBeTruthy()
      })
      it(`storage.${area}.set`, () => {
        const key = { key: area }
        storage[area].set(key)
        expect(browser.storage[area].set.calledWith(key)).toBeTruthy()
      })
      describe(`storage.${area}.addListener`, () => {
        const changes = {
          key: { newValue: 'new value', oldValue: 'old value' }
        }
        const otherArea = storageArea.find(x => x !== area)

        it('with cb', () => {
          const cb = jest.fn()
          let cbCall = 0
          storage[area].addListener(cb)
          expect(browser.storage.onChanged.addListener.calledOnce).toBeTruthy()

          browser.storage.onChanged.dispatch(changes, otherArea)
          expect(cb).toHaveBeenCalledTimes(cbCall)

          browser.storage.onChanged.dispatch(changes, area)
          expect(cb).toHaveBeenCalledTimes(++cbCall)
          expect(cb).toBeCalledWith(changes, area)
        })
        it('with key and cb', () => {
          const cb = jest.fn()
          let cbCall = 0
          storage[area].addListener('key', cb)
          expect(browser.storage.onChanged.addListener.calledOnce).toBeTruthy()

          browser.storage.onChanged.dispatch(changes, otherArea)
          expect(cb).toHaveBeenCalledTimes(cbCall)

          browser.storage.onChanged.dispatch({ badKey: 'value' }, area)
          expect(cb).toHaveBeenCalledTimes(cbCall)

          browser.storage.onChanged.dispatch(changes, area)
          expect(cb).toHaveBeenCalledTimes(++cbCall)
          expect(cb).toBeCalledWith(changes, area)
        })
      })
      describe(`storage.${area}.removeListener`, () => {
        const changes = {
          key: { newValue: 'new value', oldValue: 'old value' }
        }

        it('with cb remove addListener with cb', () => {
          const cb = jest.fn()
          let cbCall = 0
          storage[area].addListener(cb)

          // won't affect cb
          storage[area].removeListener('key', cb)
          expect(
            browser.storage.onChanged.removeListener.calledOnce
          ).toBeTruthy()

          browser.storage.onChanged.dispatch(changes, area)
          expect(cb).toHaveBeenCalledTimes(++cbCall)
          expect(cb).toBeCalledWith(changes, area)

          storage[area].removeListener(cb)
          expect(
            browser.storage.onChanged.removeListener.calledTwice
          ).toBeTruthy()

          browser.storage.onChanged.dispatch(changes, area)
          expect(cb).toHaveBeenCalledTimes(cbCall)

          browser.storage.onChanged.dispatch({ badKey: 'value' }, area)
          expect(cb).toHaveBeenCalledTimes(cbCall)
        })

        it('with cb, remove addListener with key and cb', () => {
          const cb = jest.fn()
          let cbCall = 0
          storage[area].addListener('key', cb)

          browser.storage.onChanged.dispatch(changes, area)
          expect(cb).toHaveBeenCalledTimes(++cbCall)
          expect(cb).toBeCalledWith(changes, area)

          storage[area].removeListener(cb)
          expect(
            browser.storage.onChanged.removeListener.calledOnce
          ).toBeTruthy()

          browser.storage.onChanged.dispatch(changes, area)
          expect(cb).toHaveBeenCalledTimes(cbCall)

          browser.storage.onChanged.dispatch({ badKey: 'value' }, area)
          expect(cb).toHaveBeenCalledTimes(cbCall)
        })

        it('with key and cb', () => {
          const cb = jest.fn()
          let cbCall = 0
          storage[area].addListener('key', cb)

          // won't affect key + cb
          storage[area].removeListener('badkey', cb)
          expect(
            browser.storage.onChanged.removeListener.calledOnce
          ).toBeTruthy()

          browser.storage.onChanged.dispatch(changes, area)
          expect(cb).toHaveBeenCalledTimes(++cbCall)
          expect(cb).toBeCalledWith(changes, area)

          storage[area].removeListener('key', cb)
          expect(
            browser.storage.onChanged.removeListener.calledTwice
          ).toBeTruthy()

          browser.storage.onChanged.dispatch(changes, area)
          expect(cb).toHaveBeenCalledTimes(cbCall)

          browser.storage.onChanged.dispatch({ badKey: 'value' }, area)
          expect(cb).toHaveBeenCalledTimes(cbCall)
        })
      })
      describe(`storage.${area}.createStream`, () => {
        const changes = {
          key: { newValue: 'new value', oldValue: 'old value' }
        }
        const otherArea = storageArea.find(x => x !== area)

        it('with key', () => {
          const nextStub = jest.fn()
          const errorStub = jest.fn()
          const completeStub = jest.fn()
          storage[area]
            .createStream<typeof changes.key>('key')
            .pipe(take(1))
            .subscribe(nextStub, errorStub, completeStub)
          expect(browser.storage.onChanged.addListener.calledOnce).toBeTruthy()
          expect(nextStub).toHaveBeenCalledTimes(0)
          expect(errorStub).toHaveBeenCalledTimes(0)
          expect(completeStub).toHaveBeenCalledTimes(0)

          browser.storage.onChanged.dispatch(changes, otherArea)
          expect(nextStub).toHaveBeenCalledTimes(0)
          expect(errorStub).toHaveBeenCalledTimes(0)
          expect(completeStub).toHaveBeenCalledTimes(0)

          browser.storage.onChanged.dispatch(changes, area)
          expect(nextStub).toHaveBeenCalledTimes(1)
          expect(errorStub).toHaveBeenCalledTimes(0)
          expect(completeStub).toHaveBeenCalledTimes(1)
          expect(nextStub).toBeCalledWith(changes.key)
        })
      })
    })

    it('storage.clear', () => {
      storage.clear()
      expect(browser.storage.sync.clear.calledOnce).toBeTruthy()
      expect(browser.storage.local.clear.calledOnce).toBeTruthy()
    })
    describe('storage.addListener', () => {
      const changes = { key: { newValue: 'new value', oldValue: 'old value' } }
      const otherChanges = { otherKey: 'other value' }

      it('with cb', () => {
        const cb = jest.fn()
        let cbCall = 0
        storage.addListener(cb)
        expect(browser.storage.onChanged.addListener.calledOnce).toBeTruthy()
        expect(cb).toHaveBeenCalledTimes(cbCall)

        storageArea.forEach(area => {
          browser.storage.onChanged.dispatch(changes, area)
          expect(cb).toHaveBeenCalledTimes(++cbCall)
          browser.storage.onChanged.dispatch(otherChanges, area)
          expect(cb).toHaveBeenCalledTimes(++cbCall)
        })
      })
      it('with key and cb', () => {
        const cb = jest.fn()
        let cbCall = 0
        storage.addListener('key', cb)
        expect(browser.storage.onChanged.addListener.calledOnce).toBeTruthy()
        expect(cb).toHaveBeenCalledTimes(cbCall)

        const changes = {
          key: { newValue: 'new value', oldValue: 'old value' }
        }
        const otherChanges = { otherKey: 'other value' }
        storageArea.forEach(area => {
          browser.storage.onChanged.dispatch(changes, area)
          expect(cb).toHaveBeenCalledTimes(++cbCall)
          browser.storage.onChanged.dispatch(otherChanges, area)
          expect(cb).toHaveBeenCalledTimes(cbCall)
        })
      })
    })
    describe('storage.removeListener', () => {
      const changes = { key: { newValue: 'new value', oldValue: 'old value' } }
      const otherChanges = { otherKey: 'other value' }

      it('with cb', () => {
        const cb = jest.fn()
        let cbCall = 0
        storage.addListener(cb)

        storageArea.forEach(area => {
          browser.storage.onChanged.dispatch(changes, area)
          expect(cb).toHaveBeenCalledTimes(++cbCall)
          browser.storage.onChanged.dispatch(otherChanges, area)
          expect(cb).toHaveBeenCalledTimes(++cbCall)
        })

        storage.removeListener(cb)
        expect(browser.storage.onChanged.removeListener.calledOnce).toBeTruthy()

        storageArea.forEach(area => {
          browser.storage.onChanged.dispatch(changes, area)
          expect(cb).toHaveBeenCalledTimes(cbCall)
          browser.storage.onChanged.dispatch(otherChanges, area)
          expect(cb).toHaveBeenCalledTimes(cbCall)
        })
      })

      it('with key and cb', () => {
        const cb = jest.fn()
        let cbCall = 0
        storage.addListener('key', cb)

        storageArea.forEach(area => {
          browser.storage.onChanged.dispatch(changes, area)
          expect(cb).toHaveBeenCalledTimes(++cbCall)
          browser.storage.onChanged.dispatch(otherChanges, area)
          expect(cb).toHaveBeenCalledTimes(cbCall)
        })

        storage.removeListener('otherKey', cb)
        expect(browser.storage.onChanged.removeListener.calledOnce).toBeTruthy()

        storageArea.forEach(area => {
          browser.storage.onChanged.dispatch(changes, area)
          expect(cb).toHaveBeenCalledTimes(++cbCall)
          browser.storage.onChanged.dispatch(otherChanges, area)
          expect(cb).toHaveBeenCalledTimes(cbCall)
        })

        storage.removeListener('key', cb)
        expect(
          browser.storage.onChanged.removeListener.calledTwice
        ).toBeTruthy()

        storageArea.forEach(area => {
          browser.storage.onChanged.dispatch(changes, area)
          expect(cb).toHaveBeenCalledTimes(cbCall)
          browser.storage.onChanged.dispatch(otherChanges, area)
          expect(cb).toHaveBeenCalledTimes(cbCall)
        })
      })
    })
    describe(`storage.createStream`, () => {
      const changes1 = {
        key1: { newValue: 'new value', oldValue: 'old value' }
      }
      const changes2 = {
        key2: { newValue: 'new value', oldValue: 'old value' }
      }

      it('with key', () => {
        const nextStub = jest.fn()
        const errorStub = jest.fn()
        const completeStub = jest.fn()
        storage
          .createStream<typeof changes2.key2>('key2')
          .pipe(take(1))
          .subscribe(nextStub, errorStub, completeStub)
        expect(browser.storage.onChanged.addListener.calledOnce).toBeTruthy()
        expect(nextStub).toHaveBeenCalledTimes(0)
        expect(errorStub).toHaveBeenCalledTimes(0)
        expect(completeStub).toHaveBeenCalledTimes(0)

        browser.storage.onChanged.dispatch(changes1, 'local')
        expect(nextStub).toHaveBeenCalledTimes(0)
        expect(errorStub).toHaveBeenCalledTimes(0)
        expect(completeStub).toHaveBeenCalledTimes(0)

        browser.storage.onChanged.dispatch(changes2, 'sync')
        expect(nextStub).toHaveBeenCalledTimes(1)
        expect(errorStub).toHaveBeenCalledTimes(0)
        expect(completeStub).toHaveBeenCalledTimes(1)
        expect(nextStub).toBeCalledWith(changes2.key2)
      })
    })
  })

  describe('Message', () => {
    it('message.send', () => {
      const tabId = 1
      const msg: Message = { type: 'OPEN_QS_PANEL' }

      message.send(msg)
      expect(browser.runtime.sendMessage.calledWith(msg)).toBeTruthy()
      expect(browser.tabs.sendMessage.notCalled).toBeTruthy()

      browser.runtime.sendMessage.flush()
      browser.tabs.sendMessage.flush()
      browser.runtime.sendMessage.callsFake(() => Promise.resolve({}))
      browser.tabs.sendMessage.callsFake(() => Promise.resolve({}))

      message.send(tabId, msg)
      expect(browser.tabs.sendMessage.calledWith(tabId, msg)).toBeTruthy()
      expect(browser.runtime.sendMessage.notCalled).toBeTruthy()
    })
    it('message.addListener', () => {
      const cb1 = jest.fn()
      const cb2 = jest.fn()
      let cb1Call = 0
      let cb2Call = 0
      message.addListener(cb1)
      message.addListener('OPEN_QS_PANEL', cb2)
      expect(browser.runtime.onMessage.addListener.calledTwice).toBeTruthy()
      expect(cb1).toHaveBeenCalledTimes(cb1Call)
      expect(cb2).toHaveBeenCalledTimes(cb2Call)

      browser.runtime.onMessage.dispatch({ type: 'CLOSE_QS_PANEL' })
      expect(cb1).toHaveBeenCalledTimes(++cb1Call)
      expect(cb2).toHaveBeenCalledTimes(cb2Call)

      browser.runtime.onMessage.dispatch({ type: 'OPEN_QS_PANEL' })
      expect(cb1).toHaveBeenCalledTimes(++cb1Call)
      expect(cb2).toHaveBeenCalledTimes(++cb2Call)
    })
    it('message.removeListener', () => {
      const cb1 = jest.fn()
      const cb2 = jest.fn()
      let cb1Call = 0
      const cb2Call = 0
      message.addListener('OPEN_QS_PANEL', cb1)
      message.addListener('CLOSE_QS_PANEL', cb2)
      browser.runtime.onMessage.dispatch({ type: 'OPEN_QS_PANEL' })
      expect(cb1).toHaveBeenCalledTimes(++cb1Call)
      expect(cb2).toHaveBeenCalledTimes(cb2Call)

      message.removeListener('QUERY_QS_PANEL', cb1)
      message.removeListener(cb2)
      expect(browser.runtime.onMessage.removeListener.calledTwice).toBeTruthy()

      browser.runtime.onMessage.dispatch({ type: 'OPEN_QS_PANEL' })
      browser.runtime.onMessage.dispatch({ type: 'CLOSE_QS_PANEL' })
      expect(cb1).toHaveBeenCalledTimes(++cb1Call)
      expect(cb2).toHaveBeenCalledTimes(cb2Call)

      message.removeListener('OPEN_QS_PANEL', cb1)
      browser.runtime.onMessage.dispatch({ type: 'OPEN_QS_PANEL' })
      expect(cb1).toHaveBeenCalledTimes(cb1Call)
    })
    describe('message.createStream', () => {
      it('without argument', () => {
        const nextStub = jest.fn()
        const errorStub = jest.fn()
        const completeStub = jest.fn()
        message
          .createStream()
          .pipe(take(2))
          .subscribe(nextStub, errorStub, completeStub)
        expect(browser.runtime.onMessage.addListener.calledOnce).toBeTruthy()
        expect(nextStub).toHaveBeenCalledTimes(0)
        expect(errorStub).toHaveBeenCalledTimes(0)
        expect(completeStub).toHaveBeenCalledTimes(0)

        browser.runtime.onMessage.dispatch({ type: 1 })
        expect(nextStub).toHaveBeenCalledTimes(1)
        expect(errorStub).toHaveBeenCalledTimes(0)
        expect(completeStub).toHaveBeenCalledTimes(0)
        expect(nextStub).toBeCalledWith({ type: 1 })

        browser.runtime.onMessage.dispatch({ type: 2 })
        expect(nextStub).toHaveBeenCalledTimes(2)
        expect(errorStub).toHaveBeenCalledTimes(0)
        expect(completeStub).toHaveBeenCalledTimes(1)
        expect(nextStub).toBeCalledWith({ type: 2 })
      })

      it('with message type', () => {
        const nextStub = jest.fn()
        const errorStub = jest.fn()
        const completeStub = jest.fn()
        message
          .createStream('OPEN_QS_PANEL')
          .pipe(take(1))
          .subscribe(nextStub, errorStub, completeStub)
        expect(browser.runtime.onMessage.addListener.calledOnce).toBeTruthy()
        expect(nextStub).toHaveBeenCalledTimes(0)
        expect(errorStub).toHaveBeenCalledTimes(0)
        expect(completeStub).toHaveBeenCalledTimes(0)

        browser.runtime.onMessage.dispatch({ type: 'CLOSE_QS_PANEL' })
        expect(nextStub).toHaveBeenCalledTimes(0)
        expect(errorStub).toHaveBeenCalledTimes(0)
        expect(completeStub).toHaveBeenCalledTimes(0)

        browser.runtime.onMessage.dispatch({ type: 'OPEN_QS_PANEL' })
        expect(nextStub).toHaveBeenCalledTimes(1)
        expect(errorStub).toHaveBeenCalledTimes(0)
        expect(completeStub).toHaveBeenCalledTimes(1)
        expect(nextStub).toBeCalledWith({ type: 'OPEN_QS_PANEL' })
      })
    })

    it('message.self.initClient', () => {
      browser.runtime.sendMessage.withArgs({ type: 'PAGE_INFO' }).returns(
        Promise.resolve({
          pageId: 'pageId',
          faviconURL: 'faviconURL',
          pageTitle: 'pageTitle',
          pageURL: 'pageURL'
        })
      )
      return message.self.initClient().then(() => {
        expect(
          browser.runtime.sendMessage.calledWith({ type: 'PAGE_INFO' })
        ).toBeTruthy()
        expect(window.pageId).toBe('pageId')
        expect(window.faviconURL).toBe('faviconURL')
        expect(window.pageTitle).toBe('pageTitle')
        expect(window.pageURL).toBe('pageURL')
      })
    })
    describe('message.self.initServer', () => {
      const tab = {
        id: 1,
        favIconUrl: 'https://example.com/favIconUrl',
        url: 'https://example.com/url',
        title: 'title'
      }

      it('From tab', done => {
        message.self.initServer()
        expect(browser.runtime.onMessage.addListener.calledOnce).toBeTruthy()

        browser.runtime.onMessage['_listeners']
          [0]({ type: 'PAGE_INFO' }, { tab })
          .then(response => {
            expect(response).toEqual({
              pageId: tab.id,
              faviconURL: tab.favIconUrl,
              pageTitle: tab.title,
              pageURL: tab.url
            })
            done()
          })
      })

      it('From browser action page', done => {
        message.self.initServer()
        expect(browser.runtime.onMessage.addListener.calledOnce).toBeTruthy()

        const sendResponse = jest.fn()
        browser.runtime.onMessage['_listeners']
          [0]({ type: 'PAGE_INFO' }, {}, sendResponse)
          .then(response => {
            expect(response).toHaveProperty('pageId', 'popup')
            done()
          })
      })

      it('Self page message transmission', () => {
        message.self.initServer()
        expect(browser.runtime.onMessage.addListener.calledOnce).toBeTruthy()

        browser.runtime.onMessage.dispatch({ type: '[[1]]', __pageId__: 1 }, {})
        expect(
          browser.runtime.sendMessage.calledWith({ type: '1', __pageId__: 1 })
        ).toBeTruthy()
        browser.runtime.sendMessage.resetHistory()

        browser.runtime.onMessage.dispatch(
          { type: '[[1]]', __pageId__: 1 },
          { tab }
        )
        expect(
          browser.tabs.sendMessage.calledWith(tab.id, {
            type: '1',
            __pageId__: 1
          })
        ).toBeTruthy()
      })
    })
    it('message.self.send', () => {
      window.pageId = 1
      message.self.send({
        type: 'QUERY_PANEL_STATE',
        payload: 'value'
      })
      expect(
        browser.runtime.sendMessage.calledWith({
          type: '[[QUERY_PANEL_STATE]]',
          __pageId__: window.pageId,
          payload: 'value'
        })
      ).toBeTruthy()
    })
    it('message.self.addListener', () => {
      window.pageId = 1
      const cb1 = jest.fn()
      const cb2 = jest.fn()
      let cb1Call = 0
      let cb2Call = 0
      message.self.addListener(cb1)
      message.addListener(cb2)
      expect(browser.runtime.onMessage.addListener.calledTwice).toBeTruthy()
      expect(cb1).toHaveBeenCalledTimes(cb1Call)
      expect(cb2).toHaveBeenCalledTimes(cb2Call)

      browser.runtime.onMessage.dispatch({ type: 1, __pageId__: window.pageId })
      expect(cb1).toHaveBeenCalledTimes(++cb1Call)
      expect(cb2).toHaveBeenCalledTimes(cb2Call)

      browser.runtime.onMessage.dispatch({ type: 1 })
      expect(cb1).toHaveBeenCalledTimes(cb1Call)
      expect(cb2).toHaveBeenCalledTimes(++cb2Call)

      browser.runtime.onMessage.dispatch({
        type: 1,
        __pageId__: window.pageId + 2
      })
      expect(cb1).toHaveBeenCalledTimes(cb1Call)
      expect(cb2).toHaveBeenCalledTimes(cb2Call)
    })
    it('message.self.removeListener', () => {
      window.pageId = 1
      const cb1 = jest.fn()
      let cb1Call = 0
      message.self.addListener(cb1)
      browser.runtime.onMessage.dispatch({ __pageId__: window.pageId })
      expect(cb1).toHaveBeenCalledTimes(++cb1Call)

      message.self.removeListener(cb1)
      expect(browser.runtime.onMessage.removeListener.calledOnce).toBeTruthy()

      browser.runtime.onMessage.dispatch({ __pageId__: window.pageId })
      expect(cb1).toHaveBeenCalledTimes(cb1Call)
    })
    describe('message.self.createStream', () => {
      it('without argument', () => {
        window.pageId = 1
        const nextStub = jest.fn()
        const errorStub = jest.fn()
        const completeStub = jest.fn()
        message.self
          .createStream()
          .pipe(take(2))
          .subscribe(nextStub, errorStub, completeStub)
        expect(browser.runtime.onMessage.addListener.calledOnce).toBeTruthy()
        expect(nextStub).toHaveBeenCalledTimes(0)
        expect(errorStub).toHaveBeenCalledTimes(0)
        expect(completeStub).toHaveBeenCalledTimes(0)

        browser.runtime.onMessage.dispatch({
          type: 1,
          __pageId__: window.pageId
        })
        expect(nextStub).toHaveBeenCalledTimes(1)
        expect(errorStub).toHaveBeenCalledTimes(0)
        expect(completeStub).toHaveBeenCalledTimes(0)
        expect(nextStub).toBeCalledWith({ type: 1, __pageId__: window.pageId })

        browser.runtime.onMessage.dispatch({
          type: 2,
          __pageId__: window.pageId
        })
        expect(nextStub).toHaveBeenCalledTimes(2)
        expect(errorStub).toHaveBeenCalledTimes(0)
        expect(completeStub).toHaveBeenCalledTimes(1)
        expect(nextStub).toBeCalledWith({ type: 2, __pageId__: window.pageId })
      })

      it('with message type', () => {
        window.pageId = 1
        const nextStub = jest.fn()
        const errorStub = jest.fn()
        const completeStub = jest.fn()
        message.self
          .createStream('OPEN_QS_PANEL')
          .pipe(take(1))
          .subscribe(nextStub, errorStub, completeStub)
        expect(browser.runtime.onMessage.addListener.calledOnce).toBeTruthy()
        expect(nextStub).toHaveBeenCalledTimes(0)
        expect(errorStub).toHaveBeenCalledTimes(0)
        expect(completeStub).toHaveBeenCalledTimes(0)

        browser.runtime.onMessage.dispatch({
          type: 'CLOSE_QS_PANEL',
          __pageId__: window.pageId
        })
        expect(nextStub).toHaveBeenCalledTimes(0)
        expect(errorStub).toHaveBeenCalledTimes(0)
        expect(completeStub).toHaveBeenCalledTimes(0)

        browser.runtime.onMessage.dispatch({
          type: 'OPEN_QS_PANEL',
          __pageId__: window.pageId
        })
        expect(nextStub).toHaveBeenCalledTimes(1)
        expect(errorStub).toHaveBeenCalledTimes(0)
        expect(completeStub).toHaveBeenCalledTimes(1)
        expect(nextStub.mock.calls[0][0]).toEqual({
          type: 'OPEN_QS_PANEL',
          __pageId__: window.pageId
        })
      })
    })
  })
  describe('openUrl', () => {
    const url = 'https://example.com'

    it('Existing tab', () => {
      browser.tabs.query.returns(
        Promise.resolve([
          {
            windowId: 10,
            index: 1
          }
        ])
      )
      return openUrl(url).then(() => {
        expect(browser.tabs.query.calledWith({ url })).toBeTruthy()
        expect(
          browser.tabs.highlight.calledWith({ tabs: 1, windowId: 10 })
        ).toBeTruthy()
        expect(browser.tabs.create.notCalled).toBeTruthy()
      })
    })
    it('New tab', () => {
      browser.tabs.query.returns(Promise.resolve([]))
      return openUrl(url).then(() => {
        expect(browser.tabs.query.calledWith({ url })).toBeTruthy()
        expect(browser.tabs.highlight.notCalled).toBeTruthy()
        expect(
          browser.tabs.create.calledWith(sinon.match({ url }))
        ).toBeTruthy()
      })
    })
    it('Concat extension base url', () => {
      browser.tabs.query.returns(Promise.resolve([]))
      browser.runtime.getURL.returns('test')
      return openUrl(url, true).then(() => {
        expect(browser.runtime.getURL.calledWith(url)).toBeTruthy()
        expect(
          browser.tabs.create.calledWith(sinon.match({ url: 'test' }))
        ).toBeTruthy()
      })
    })
  })
})
