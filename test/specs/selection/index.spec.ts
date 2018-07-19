import { appConfigFactory, AppConfigMutable } from '@/app-config'
import * as BrowserApiMock from '@/_helpers/__mocks__/browser-api'
import { SelectionMock } from '@/_helpers/__mocks__/selection'
import * as ConfigManagerMock from '@/_helpers/__mocks__/config-manager'
import '@/selection'
import { MsgType, MsgIsPinned } from '@/typings/message'
import { timer } from '@/_helpers/promise-more'

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
    selection.getSelectionInfo.mockReturnValue('mocked selection info')
    selection.getDefaultSelectionInfo.mockReturnValue('mocked default selection info')
    dispatchAppConfigEvent(mockAppConfigFactory())
  })

  it('should send empty message when mouseup and no selection', async () => {
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

    await timer(selectionDelay)
    expect(message.self.send).toHaveBeenCalledTimes(1)
    expect(message.self.send).toBeCalledWith(
      expect.objectContaining({
        type: MsgType.Selection,
        selectionInfo: 'mocked default selection info',
      })
    )
  })

  it('should send empty message if the selection language does not match (Chinese)', async () => {
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

    await timer(selectionDelay)
    expect(message.self.send).toHaveBeenCalledTimes(1)
    expect(message.self.send).toBeCalledWith(
      expect.objectContaining({
        type: MsgType.Selection,
        selectionInfo: 'mocked default selection info',
      })
    )
  })

  it('should send empty message if the selection language does not match (English)', async () => {
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

    await timer(selectionDelay)
    expect(message.self.send).toHaveBeenCalledTimes(1)
    expect(message.self.send).toBeCalledWith(
      expect.objectContaining({
        type: MsgType.Selection,
        selectionInfo: 'mocked default selection info',
      })
    )
  })

  it('should collect selection info and send back', async () => {
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

    await timer(selectionDelay)
    expect(message.self.send).toHaveBeenCalledTimes(1)
    expect(message.self.send).toBeCalledWith({
      type: MsgType.Selection,
      mouseX: 10,
      mouseY: 10,
      dbClick: false,
      ctrlKey: false,
      self: false,
      selectionInfo: expect.objectContaining({
        text: expect.stringMatching(/^test\d+/),
        context: expect.stringMatching(/^This is a test\d+/)
      }),
    })
  })

  it('should send empty message if the selection is made inside a input box', async () => {
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

    await timer(selectionDelay)
    expect(message.self.send).toHaveBeenCalledTimes(1)
    expect(message.self.send).toBeCalledWith(
      expect.objectContaining({
        type: MsgType.Selection,
        selectionInfo: 'mocked default selection info',
      })
    )
  })

  // FIX ME: Can't mock window.parent
  // it('should send message to upper frame if in iframe')
  // it('should pass message from lower frame to upper frame')

  it('should fire events even if conifg.active is off', async () => {
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

    await timer(selectionDelay)
    expect(message.self.send).toHaveBeenCalledTimes(1)
  })

  it('should detect esc key being pressed', async () => {
    window.dispatchEvent(new KeyboardEvent('keydown', {
      key: 'Escape',
    }))

    await timer(selectionDelay)
    expect(message.self.send).toHaveBeenCalledTimes(1)
    expect(message.self.send).toBeCalledWith({ type: MsgType.EscapeKey })
  })

  it('ctrlKey should be true if ctrl key is pressed while clicking', async () => {
    window.dispatchEvent(new MouseEvent('mouseup', {
      button: 0,
      clientX: 10,
      clientY: 10,
      ctrlKey: true,
    }))

    await timer(selectionDelay)
    expect(message.self.send).toHaveBeenCalledTimes(1)
    expect(message.self.send).toBeCalledWith(
      expect.objectContaining({
        ctrlKey: true,
      }),
    )
  })

  it('ctrlKey should be false if not released while clicking', async () => {
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

    await timer(selectionDelay)
    expect(message.self.send).toHaveBeenCalledTimes(1)
    expect(message.self.send).toBeCalledWith(
      expect.objectContaining({
        ctrlKey: false,
      }),
    )
  })

  it('ctrlKey should be false if ctrl key is released while clicking', async () => {
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

    await timer(selectionDelay)
    expect(message.self.send).toHaveBeenCalledTimes(1)
    expect(message.self.send).toBeCalledWith(
      expect.objectContaining({
        ctrlKey: false,
      }),
    )
  })

  it('should send message when ctrl is pressed more that three times within 500ms', async () => {
    for (let i = 1; i <= 3; i++) {
      window.dispatchEvent(new KeyboardEvent('keydown', {
        key: 'Control',
      }))
      window.dispatchEvent(new KeyboardEvent('keyup', {
        key: 'Control',
      }))
    }

    await timer(500 + selectionDelay)
    expect(message.self.send).toHaveBeenCalledTimes(1)
    expect(message.self.send).toBeCalledWith({ type: MsgType.TripleCtrl })
  })

  it('should not trigger double click if the interval is too long', async () => {
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

    await timer(200)
    window.dispatchEvent(new MouseEvent('mouseup', {
      button: 0,
      clientX: 20,
      clientY: 20,
    }))

    await timer(selectionDelay)
    // only called one time because it's the same selection
    // and not a double click selection
    expect(message.self.send).toHaveBeenCalledTimes(1)
    expect(message.self.send).toBeCalledWith(
      expect.objectContaining({
        dbClick: false,
      }),
    )
  })

  it('should trigger double click if the interval is within delay', async () => {
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

    await timer(50)
    window.dispatchEvent(new MouseEvent('mouseup', {
      button: 0,
      clientX: 20,
      clientY: 20,
    }))

    await timer(selectionDelay)
    expect(message.self.send).toHaveBeenCalled()
    expect(message.self.send).toBeCalledWith(
      expect.objectContaining({
        dbClick: true,
      })
    )
  })

  it('should update mousemove tracking when instant capture config has changed', async () => {
    const addMock = jest.fn(window.addEventListener)
    const removeMock = jest.fn(window.removeEventListener)
    window.addEventListener = addMock
    window.removeEventListener = removeMock

    addMock.mockClear()
    removeMock.mockClear()
    let config = mockAppConfigFactory()
    config.mode.instant.enable = true
    config.pinMode.instant.enable = true
    dispatchAppConfigEvent(config)
    await timer(0)
    expect(addMock).toHaveBeenCalledTimes(2)
    expect(removeMock).toHaveBeenCalledTimes(0)

    addMock.mockClear()
    removeMock.mockClear()
    config = mockAppConfigFactory()
    config.mode.instant.enable = false
    config.pinMode.instant.enable = true
    dispatchAppConfigEvent(config)
    await timer(0)
    expect(addMock).toHaveBeenCalledTimes(0)
    expect(removeMock).toHaveBeenCalledTimes(2)

    addMock.mockClear()
    removeMock.mockClear()
    BrowserApiMock.dispatchMessageEvent({
      self: true,
      message: {
        type: MsgType.IsPinned,
        isPinned: true,
      } as MsgIsPinned,
    })
    await timer(0)
    expect(addMock).toHaveBeenCalledTimes(2)
    expect(removeMock).toHaveBeenCalledTimes(0)
  })
})
