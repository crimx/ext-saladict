import { setupListener } from '../../../src/background/context-menus'
import { appConfigFactory, AppConfig } from '../../../src/app-config'
import sinon from 'sinon'

function specialConfig () {
  const config = appConfigFactory()
  config.contextMenus.selected = ['youdao', 'dictcn']
  return config
}

describe('Context Menus', () => {
  beforeEach(() => browser.flush())
  afterAll(() => browser.flush())

  describe('initListener', () => {
    let config: AppConfig

    beforeEach(() => {
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

  describe('Context Menus Click', () => {
    it('init', () => {

    })
  })
})
