import { setupListener } from '../../../src/background/context-menus'
import { appConfigFactory, AppConfig } from '../../../src/app-config'
import sinon from 'sinon'

function specialConfig () {
  const config = appConfigFactory()
  config.contextMenus.selected = ['youdao', 'dictcn']
  return config
}

describe('Context Menus', () => {
  afterAll(() => browser.flush())

  describe('Context Menus Click', () => {
    beforeEach(() => {
      browser.tabs.create.flush()
      browser.tabs.query.flush()
      browser.runtime.getURL.callsFake(s => s)
      browser.tabs.query
        .onFirstCall().returns(Promise.resolve([{ url: 'test-url' }]))
        .onSecondCall().returns(Promise.resolve([]))
    })

    it('init', () => {
      expect(browser.contextMenus.onClicked.addListener.calledOnce).toBeTruthy()
    })

    it('google_page_translate', done => {
      browser.contextMenus.onClicked.dispatch({ menuItemId: 'google_page_translate' })

      setTimeout(() => {
        expect(browser.tabs.query.called).toBeTruthy()
        expect(browser.tabs.create.calledWith({ url: sinon.match('google') })).toBeTruthy()
        expect(browser.tabs.create.calledWith({ url: sinon.match('test-url') })).toBeTruthy()
        done()
      }, 0)
    })
    it('youdao_page_translate', () => {
      browser.tabs.executeScript.flush()
      browser.tabs.executeScript.callsFake(() => Promise.resolve())
      browser.contextMenus.onClicked.dispatch({ menuItemId: 'youdao_page_translate' })
      expect(browser.tabs.executeScript.calledWith({ file: sinon.match('youdao') })).toBeTruthy()
    })
    it('view_as_pdf', done => {
      browser.contextMenus.onClicked.dispatch({ menuItemId: 'view_as_pdf' })
      setTimeout(() => {
        expect(browser.tabs.query.called).toBeTruthy()
        expect(browser.tabs.create.calledWith({ url: sinon.match('pdf') })).toBeTruthy()
        done()
      }, 0)
    })
    it('search_history', done => {
      browser.tabs.query.onFirstCall().returns(Promise.resolve([]))
      browser.contextMenus.onClicked.dispatch({ menuItemId: 'search_history' })
      setTimeout(() => {
        expect(browser.tabs.query.called).toBeTruthy()
        expect(browser.tabs.create.calledWith({ url: sinon.match('history') })).toBeTruthy()
        done()
      }, 0)
    })
    it('notebook', done => {
      browser.tabs.query.onFirstCall().returns(Promise.resolve([]))
      browser.contextMenus.onClicked.dispatch({ menuItemId: 'notebook' })
      setTimeout(() => {
        expect(browser.tabs.query.called).toBeTruthy()
        expect(browser.tabs.create.calledWith({ url: sinon.match('notebook') })).toBeTruthy()
        done()
      }, 0)
    })
    it('default', done => {
      browser.tabs.query.onFirstCall().returns(Promise.resolve([]))
      browser.storage.sync.get.callsFake(() => Promise.resolve({ config: appConfigFactory() }))
      browser.contextMenus.onClicked.dispatch({ menuItemId: 'bing_dict' })
      setTimeout(() => {
        expect(browser.storage.sync.get.calledWith('config')).toBeTruthy()
        expect(browser.tabs.query.called).toBeTruthy()
        expect(browser.tabs.create.calledWith({ url: sinon.match('bing') })).toBeTruthy()
        done()
      }, 0)
    })
  })

  describe('initListener', () => {
    let config: AppConfig

    beforeEach(() => {
      browser.flush()
      browser.contextMenus.removeAll.callsFake(() => Promise.resolve())
      browser.contextMenus.create.callsFake((_, cb) => cb())
      config = specialConfig()
      setupListener(config.contextMenus)
    })

    it('should set menus on init', done => {
      expect(browser.contextMenus.removeAll.calledOnce).toBeTruthy()
      setTimeout(() => {
        expect(browser.contextMenus.removeAll.calledOnce).toBeTruthy()
        expect(browser.contextMenus.create.calledWithMatch({ id: 'youdao' }, sinon.match.func)).toBeTruthy()
        expect(browser.contextMenus.create.calledWithMatch({ id: 'dictcn' }, sinon.match.func)).toBeTruthy()
        done()
      }, 0)
    })

    it('should do nothing when contex menus config didn\'t change',done => {
      const newConfig = specialConfig()
      newConfig.active = !newConfig.active

      browser.storage.onChanged.dispatch({
        config: {
          newValue: newConfig,
          oldValue: config,
        }
      },
      'sync')
      expect(browser.contextMenus.removeAll.calledOnce).toBeTruthy()
      setTimeout(() => {
        expect(browser.contextMenus.removeAll.calledOnce).toBeTruthy()
        done()
      }, 0)
    })

    it('should set menus at first time change', done => {
      expect(browser.contextMenus.removeAll.calledOnce).toBeTruthy()

      const newConfig = specialConfig()
      newConfig.contextMenus.selected.pop()

      browser.storage.onChanged.dispatch({
        config: {
          newValue: newConfig,
        }
      },
      'sync')
      setTimeout(() => {
        expect(browser.contextMenus.removeAll.calledTwice).toBeTruthy()
        done()
      }, 0)
    })

    it('should set menus when contex menus config changed', done => {
      expect(browser.contextMenus.removeAll.calledOnce).toBeTruthy()

      const newConfig = specialConfig()
      newConfig.contextMenus.selected.pop()

      browser.storage.onChanged.dispatch({
        config: {
          newValue: newConfig,
          oldValue: config,
        }
      },
      'sync')
      setTimeout(() => {
        expect(browser.contextMenus.removeAll.calledTwice).toBeTruthy()
        done()
      }, 0)
    })

    it('should only set twice if source emits values during the first setting', done => {
      expect(browser.contextMenus.removeAll.calledOnce).toBeTruthy()

      const newConfig1 = specialConfig()
      newConfig1.contextMenus.selected = ['bing_dict']

      const newConfig2 = specialConfig()
      newConfig2.contextMenus.selected = ['iciba']

      const newConfig3 = specialConfig()
      newConfig3.contextMenus.selected = ['oxford']

      browser.storage.onChanged.dispatch({
        config: {
          newValue: newConfig1,
          oldValue: config,
        }
      },
      'sync')
      browser.storage.onChanged.dispatch({
        config: {
          newValue: newConfig2,
          oldValue: newConfig1,
        }
      },
      'sync')
      browser.storage.onChanged.dispatch({
        config: {
          newValue: newConfig3,
          oldValue: newConfig2,
        }
      },
      'sync')
      setTimeout(() => {
        expect(browser.contextMenus.removeAll.calledTwice).toBeTruthy()
        expect(browser.contextMenus.create.calledWithMatch({ id: 'bing_dict' }, sinon.match.func)).toBeFalsy()
        expect(browser.contextMenus.create.calledWithMatch({ id: 'iciba' }, sinon.match.func)).toBeFalsy()
        expect(browser.contextMenus.create.calledWithMatch({ id: 'oxford' }, sinon.match.func)).toBeTruthy()
        done()
      }, 0)
    })
  })
})
