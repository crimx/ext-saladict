import { message } from '@/_helpers/browser-api'
import { Message, MessageResponse, MsgType } from '@/typings/message'

export function isNoReceivingEndError(error: unknown): boolean {
  const runtimeError =
    error &&
    typeof error === 'object' &&
    error['runtimeLastError'] instanceof Error
      ? error['runtimeLastError']
      : error instanceof Error
      ? error
      : null

  return !!(
    runtimeError &&
    /Could not establish connection|Receiving end does not exist/.test(
      runtimeError.message
    )
  )
}

export async function trySendMessageToTab<
  T extends MsgType,
  R = MessageResponse<T>
>(tabId: number, msg: Message<T>): Promise<R | undefined> {
  try {
    return await message.send<T, R>(tabId, msg)
  } catch (error) {
    if (isNoReceivingEndError(error)) {
      return undefined
    }
    throw error
  }
}
