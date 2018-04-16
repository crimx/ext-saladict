import { appConfigFactory, AppConfigMutable } from '@/app-config'
import sinon from 'sinon'
import * as BrowserApiMock from '@/_helpers/__mocks__/browser-api'
import { SelectionMock } from '@/_helpers/__mocks__/selection'
import * as ConfigManagerMock from '@/_helpers/__mocks__/config-manager'
import '@/selection'
import { MsgType } from '@/typings/message'

jest.mock('@/_helpers/browser-api')
jest.mock('@/_helpers/config-manager')
jest.mock('@/_helpers/selection')

const { message, storage }: {
  message: typeof BrowserApiMock.message
  storage: typeof BrowserApiMock.storage
} = require('@/_helpers/browser-api')

const selection: SelectionMock = require('@/_helpers/selection')

const { dispatchAppConfigEvent }: {
  dispatchAppConfigEvent: typeof ConfigManagerMock.dispatchAppConfigEvent
} = require('@/_helpers/config-manager')

// speed up
const mockAppConfigFactory = () => {
  const config = appConfigFactory() as AppConfigMutable
  config.doubleClickDelay = 0
  return config
}

describe('Message Selection', () => {
  beforeEach(() => {
    browser.flush()
    window.name = ''
    message.self.send.mockClear()
    selection.getSelectionText.mockReturnValue('test')
    selection.getSelectionSentence.mockReturnValue('This is a test.')
    dispatchAppConfigEvent(mockAppConfigFactory())
  })

  it('should send empty message when mouseup and no selection', done => {
    selection.getSelectionText.mockReturnValue('')

    window.dispatchEvent(new MouseEvent('mouseup', {
      button: 0,
      clientX: 10,
      clientY: 10,
    }))

    setTimeout(() => {
      expect(message.self.send).toHaveBeenCalledTimes(1)
      expect(message.self.send).toBeCalledWith({
        type: MsgType.Selection,
        selectionInfo: expect.objectContaining({ text: '' }),
      })
      done()
    }, 0)
  })

  it('should send empty message if the selection language does not match (Chinese)', done => {
    const config = mockAppConfigFactory()
    config.language.chinese = true
    config.language.english = false
    dispatchAppConfigEvent(config)

    window.dispatchEvent(new MouseEvent('mouseup', {
      button: 0,
      clientX: 10,
      clientY: 10,
    }))

    setTimeout(() => {
      expect(message.self.send).toHaveBeenCalledTimes(1)
      expect(message.self.send).toBeCalledWith({
        type: MsgType.Selection,
        selectionInfo: expect.objectContaining({ text: '' }),
      })
      done()
    }, 0)
  })

  it('should send empty message if the selection language does not match (English)', done => {
    selection.getSelectionText.mockReturnValue('你好')
    selection.getSelectionSentence.mockReturnValue('你好')
    const config = mockAppConfigFactory()
    config.language.chinese = false
    config.language.english = true
    dispatchAppConfigEvent(config)

    window.dispatchEvent(new MouseEvent('mouseup', {
      button: 0,
      clientX: 10,
      clientY: 10,
    }))

    setTimeout(() => {
      expect(message.self.send).toHaveBeenCalledTimes(1)
      expect(message.self.send).toBeCalledWith({
        type: MsgType.Selection,
        selectionInfo: expect.objectContaining({ text: '' }),
      })
      done()
    }, 0)
  })

  it('should collect selection info and send back', done => {
    window.dispatchEvent(new MouseEvent('mouseup', {
      button: 0,
      clientX: 10,
      clientY: 10,
    }))

    setTimeout(() => {
      expect(message.self.send).toHaveBeenCalledTimes(1)
      expect(message.self.send).toBeCalledWith({
        type: MsgType.Selection,
        mouseX: 10,
        mouseY: 10,
        dbClick: false,
        ctrlKey: false,
        selectionInfo: expect.objectContaining({
          text: 'test',
          context: 'This is a test.'
        }),
      })
      done()
    }, 0)
  })

  // FIX ME: Can't mock window.parent
  // it('should send message to upper frame if in iframe')
  // it('should pass message from lower frame to upper frame')

  it('should do nothing if clicking the dict panel frame', done => {
    window.name = 'saladict-frame'

    window.dispatchEvent(new MouseEvent('mouseup', {
      button: 0,
      clientX: 10,
      clientY: 10,
    }))

    setTimeout(() => {
      expect(message.self.send).toHaveBeenCalledTimes(0)
      done()
    }, 0)
  })

  it('should do nothing if conifg.active is off', done => {
    const config = mockAppConfigFactory()
    config.active = false
    dispatchAppConfigEvent(config)

    window.dispatchEvent(new MouseEvent('mouseup', {
      button: 0,
      clientX: 10,
      clientY: 10,
    }))

    setTimeout(() => {
      expect(message.self.send).toHaveBeenCalledTimes(0)
      done()
    }, 0)
  })

  it('ctrlKey should be true if ctrl key is pressed while clicking', done => {
    window.dispatchEvent(new KeyboardEvent('keydown', {
      key: 'Control',
    }))

    window.dispatchEvent(new MouseEvent('mouseup', {
      button: 0,
      clientX: 10,
      clientY: 10,
    }))

    setTimeout(() => {
      expect(message.self.send).toHaveBeenCalledTimes(1)
      expect(message.self.send).toBeCalledWith(
        expect.objectContaining({
          ctrlKey: true,
        }),
      )
      done()
    }, 0)
  })

  it('ctrlKey should be false if not released while clicking', done => {
    window.dispatchEvent(new KeyboardEvent('keydown', {
      key: 'k',
    }))

    window.dispatchEvent(new MouseEvent('mouseup', {
      button: 0,
      clientX: 10,
      clientY: 10,
    }))

    setTimeout(() => {
      expect(message.self.send).toHaveBeenCalledTimes(1)
      expect(message.self.send).toBeCalledWith(
        expect.objectContaining({
          ctrlKey: false,
        }),
      )
      done()
    }, 0)
  })

  it('ctrlKey should be false if ctrl key is released while clicking', done => {
    window.dispatchEvent(new KeyboardEvent('keydown', {
      key: 'Control',
    }))

    window.dispatchEvent(new KeyboardEvent('keyup', {
      key: 'Control',
    }))

    window.dispatchEvent(new MouseEvent('mouseup', {
      button: 0,
      clientX: 10,
      clientY: 10,
    }))

    setTimeout(() => {
      expect(message.self.send).toHaveBeenCalledTimes(1)
      expect(message.self.send).toBeCalledWith(
        expect.objectContaining({
          ctrlKey: false,
        }),
      )
      done()
    }, 0)
  })

  it('should send message when ctrl is pressed more that three times within 500ms', done => {
    for (let i = 1; i <= 3; i++) {
      window.dispatchEvent(new KeyboardEvent('keydown', {
        key: 'Control',
      }))
      window.dispatchEvent(new KeyboardEvent('keyup', {
        key: 'Control',
      }))
    }
    setTimeout(() => {
      expect(message.self.send).toHaveBeenCalledTimes(1)
      expect(message.self.send).toBeCalledWith({ type: MsgType.TripleCtrl })
      done()
    }, 510)
  })

  it('should not trigger double click if the interval is too long', done => {
    const config = mockAppConfigFactory()
    config.doubleClickDelay = 100
    dispatchAppConfigEvent(config)

    window.dispatchEvent(new MouseEvent('mouseup', {
      button: 0,
      clientX: 10,
      clientY: 10,
    }))

    setTimeout(() => {
      window.dispatchEvent(new MouseEvent('mouseup', {
        button: 0,
        clientX: 20,
        clientY: 20,
      }))

      setTimeout(() => {
        expect(message.self.send).toHaveBeenCalledTimes(2)
        expect(message.self.send).toBeCalledWith(
          expect.objectContaining({
            dbClick: false,
          }),
        )
        done()
      }, 0)
    }, 200)
  })

  it('should trigger double click if the interval is within delay', done => {
    const config = mockAppConfigFactory()
    config.doubleClickDelay = 100
    dispatchAppConfigEvent(config)

    window.dispatchEvent(new MouseEvent('mouseup', {
      button: 0,
      clientX: 10,
      clientY: 10,
    }))

    setTimeout(() => {
      window.dispatchEvent(new MouseEvent('mouseup', {
        button: 0,
        clientX: 20,
        clientY: 20,
      }))

      setTimeout(() => {
        expect(message.self.send).toHaveBeenCalledTimes(2)
        expect(message.self.send).toBeCalledWith(
          expect.objectContaining({
            dbClick: true,
          }),
        )
        done()
      }, 0)
    }, 50)
  })
})
