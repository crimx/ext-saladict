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

const selectionDelay = 15

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
    const randomText = 'test' + Date.now()
    selection.getSelectionText.mockReturnValue(randomText)
    selection.getSelectionSentence.mockReturnValue(`This is a ${randomText}.`)
    dispatchAppConfigEvent(mockAppConfigFactory())
  })

  it('should send empty message when mouseup and no selection', done => {
    selection.getSelectionText.mockReturnValue('')

    window.dispatchEvent(new MouseEvent('mousedown', {
      button: 0,
      clientX: 20,
      clientY: 20,
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
          type: MsgType.Selection,
          selectionInfo: expect.objectContaining({ text: '' }),
        })
      )
      done()
    }, selectionDelay)
  })

  it('should send empty message if the selection language does not match (Chinese)', done => {
    const config = mockAppConfigFactory()
    config.language.chinese = true
    config.language.english = false
    dispatchAppConfigEvent(config)

    window.dispatchEvent(new MouseEvent('mousedown', {
      button: 0,
      clientX: 20,
      clientY: 20,
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
          type: MsgType.Selection,
          selectionInfo: expect.objectContaining({ text: '' }),
        })
      )
      done()
    }, selectionDelay)
  })

  it('should send empty message if the selection language does not match (English)', done => {
    selection.getSelectionText.mockReturnValue('你好')
    selection.getSelectionSentence.mockReturnValue('你好')
    const config = mockAppConfigFactory()
    config.language.chinese = false
    config.language.english = true
    dispatchAppConfigEvent(config)

    window.dispatchEvent(new MouseEvent('mousedown', {
      button: 0,
      clientX: 20,
      clientY: 20,
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
          type: MsgType.Selection,
          selectionInfo: expect.objectContaining({ text: '' }),
        })
      )
      done()
    }, selectionDelay)
  })

  it('should collect selection info and send back', done => {
    window.dispatchEvent(new MouseEvent('mousedown', {
      button: 0,
      clientX: 20,
      clientY: 20,
    }))

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
          text: expect.stringMatching(/^test\d+/),
          context: expect.stringMatching(/^This is a test\d+/)
        }),
      })
      done()
    }, selectionDelay)
  })

  it('should send empty message if the selection is made inside a input box', done => {
    const config = mockAppConfigFactory()
    config.noTypeField = true
    dispatchAppConfigEvent(config)

    const $input = document.createElement('input')
    document.body.appendChild($input)

    $input.dispatchEvent(new MouseEvent('mousedown', {
      button: 0,
      clientX: 20,
      clientY: 20,
    }))

    // mouse can bu moved to other elements when mouseup
    window.dispatchEvent(new MouseEvent('mouseup', {
      button: 0,
      clientX: 10,
      clientY: 10,
    }))

    setTimeout(() => {
      expect(message.self.send).toHaveBeenCalledTimes(1)
      expect(message.self.send).toBeCalledWith(
        expect.objectContaining({
          type: MsgType.Selection,
          selectionInfo: expect.objectContaining({ text: '' }),
        })
      )
      done()
    }, selectionDelay)
  })

  // FIX ME: Can't mock window.parent
  // it('should send message to upper frame if in iframe')
  // it('should pass message from lower frame to upper frame')

  it('should do nothing if clicking the dict panel frame', done => {
    window.name = 'saladict-frame'

    window.dispatchEvent(new MouseEvent('mousedown', {
      button: 0,
      clientX: 20,
      clientY: 20,
    }))

    window.dispatchEvent(new MouseEvent('mouseup', {
      button: 0,
      clientX: 10,
      clientY: 10,
    }))

    setTimeout(() => {
      expect(message.self.send).toHaveBeenCalledTimes(0)
      done()
    }, selectionDelay)
  })

  it('should do nothing if conifg.active is off', done => {
    const config = mockAppConfigFactory()
    config.active = false
    dispatchAppConfigEvent(config)

    window.dispatchEvent(new MouseEvent('mousedown', {
      button: 0,
      clientX: 20,
      clientY: 20,
    }))

    window.dispatchEvent(new MouseEvent('mouseup', {
      button: 0,
      clientX: 10,
      clientY: 10,
    }))

    setTimeout(() => {
      expect(message.self.send).toHaveBeenCalledTimes(0)
      done()
    }, selectionDelay)
  })

  it('should detect esc key being pressed', done => {
    window.dispatchEvent(new KeyboardEvent('keydown', {
      key: 'Escape',
    }))

    setTimeout(() => {
      expect(message.self.send).toHaveBeenCalledTimes(1)
      expect(message.self.send).toBeCalledWith({ type: MsgType.EscapeKey })
      done()
    }, selectionDelay)
  })

  it('ctrlKey should be true if ctrl key is pressed while clicking', done => {
    window.dispatchEvent(new MouseEvent('mouseup', {
      button: 0,
      clientX: 10,
      clientY: 10,
      ctrlKey: true,
    }))

    setTimeout(() => {
      expect(message.self.send).toHaveBeenCalledTimes(1)
      expect(message.self.send).toBeCalledWith(
        expect.objectContaining({
          ctrlKey: true,
        }),
      )
      done()
    }, selectionDelay)
  })

  it('ctrlKey should be false if not released while clicking', done => {
    window.dispatchEvent(new MouseEvent('mousedown', {
      button: 0,
      clientX: 20,
      clientY: 20,
    }))

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
    }, selectionDelay)
  })

  it('ctrlKey should be false if ctrl key is released while clicking', done => {
    window.dispatchEvent(new MouseEvent('mousedown', {
      button: 0,
      clientX: 20,
      clientY: 20,
    }))

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
    }, selectionDelay)
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
    }, 500 + selectionDelay)
  })

  it('should not trigger double click if the interval is too long', done => {
    const config = mockAppConfigFactory()
    config.doubleClickDelay = 100
    dispatchAppConfigEvent(config)

    window.dispatchEvent(new MouseEvent('mousedown', {
      button: 0,
      clientX: 20,
      clientY: 20,
    }))

    window.dispatchEvent(new MouseEvent('mouseup', {
      button: 0,
      clientX: 10,
      clientY: 10,
    }))

    window.dispatchEvent(new MouseEvent('mousedown', {
      button: 0,
      clientX: 20,
      clientY: 20,
    }))

    setTimeout(() => {
      window.dispatchEvent(new MouseEvent('mouseup', {
        button: 0,
        clientX: 20,
        clientY: 20,
      }))

      setTimeout(() => {
        // only called one time because it's the same selection
        // and not a double click selection
        expect(message.self.send).toHaveBeenCalledTimes(1)
        expect(message.self.send).toBeCalledWith(
          expect.objectContaining({
            dbClick: false,
          }),
        )
        done()
      }, selectionDelay)
    }, 200)
  })

  it('should trigger double click if the interval is within delay', done => {
    const config = mockAppConfigFactory()
    config.doubleClickDelay = 100
    dispatchAppConfigEvent(config)

    window.dispatchEvent(new MouseEvent('mousedown', {
      button: 0,
      clientX: 20,
      clientY: 20,
    }))

    window.dispatchEvent(new MouseEvent('mouseup', {
      button: 0,
      clientX: 10,
      clientY: 10,
    }))

    window.dispatchEvent(new MouseEvent('mousedown', {
      button: 0,
      clientX: 20,
      clientY: 20,
    }))

    setTimeout(() => {
      window.dispatchEvent(new MouseEvent('mouseup', {
        button: 0,
        clientX: 20,
        clientY: 20,
      }))

      setTimeout(() => {
        expect(message.self.send).toHaveBeenCalled()
        expect(message.self.send).toBeCalledWith(
          expect.objectContaining({
            dbClick: true,
          }),
        )
        done()
      }, selectionDelay)
    }, 50)
  })
})
