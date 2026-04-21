import { message } from '@/_helpers/browser-api'
import {
  isNoReceivingEndError,
  trySendMessageToTab
} from '@/_helpers/message-tab'
import { browser } from '../../helper'

describe('Tab Message Helper', () => {
  beforeEach(() => {
    browser.flush()
    browser.runtime.sendMessage.callsFake(() => Promise.resolve({}))
    browser.tabs.sendMessage.callsFake(() => Promise.resolve({}))
  })

  it('returns undefined when tab receiver is missing', async () => {
    const runtimeError = new Error(
      'Could not establish connection. Receiving end does not exist.'
    )
    browser.tabs.sendMessage.callsFake(() => Promise.reject(runtimeError))

    const result = await trySendMessageToTab(1, {
      type: 'QUERY_PIN_STATE'
    })

    expect(result).toBeUndefined()
  })

  it('recognizes wrapped no receiver errors', async () => {
    const runtimeError = new Error(
      'Could not establish connection. Receiving end does not exist.'
    )
    browser.tabs.sendMessage.callsFake(() => Promise.reject(runtimeError))

    let wrappedError: unknown
    try {
      await message.send(1, {
        type: 'QUERY_PIN_STATE'
      })
    } catch (error) {
      wrappedError = error
    }

    expect(isNoReceivingEndError(wrappedError)).toBeTruthy()
  })

  it('rethrows other tab messaging errors', async () => {
    const runtimeError = new Error('Unexpected failure')
    browser.tabs.sendMessage.callsFake(() => Promise.reject(runtimeError))

    await expect(
      trySendMessageToTab(1, {
        type: 'QUERY_PIN_STATE'
      })
    ).rejects.toMatchObject({
      name: 'MessageRuntimeError',
      runtimeLastError: runtimeError
    })
  })
})
