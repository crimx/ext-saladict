import { AppConfig } from '@/app-config'
import { Profile } from '@/app-config/profiles'
import { DictSearchResult } from '@/components/dictionaries/helpers'
import { Message } from '@/typings/message'
import {
  canUseOffscreenDocument,
  ensureOffscreenDocument,
  sendOffscreenMessage
} from './offscreen-document'

export async function searchDictInOffscreen(
  data: Message<'FETCH_DICT_RESULT'>['payload'],
  appConfig: AppConfig,
  activeProfile: Profile
): Promise<DictSearchResult<any>> {
  if (!canUseOffscreenDocument()) {
    throw new Error('Offscreen document is unavailable.')
  }

  await ensureOffscreenDocument()

  return sendOffscreenMessage({
    type: 'SALADICT_OFFSCREEN_DICT_TASK',
    task: 'FETCH_DICT_RESULT',
    payload: {
      ...data,
      appConfig,
      activeProfile
    }
  })
}

export async function getDictSrcPageInOffscreen(
  data: Message<'OPEN_DICT_SRC_PAGE'>['payload'],
  appConfig: AppConfig,
  activeProfile: Profile
): Promise<string> {
  if (!canUseOffscreenDocument()) {
    throw new Error('Offscreen document is unavailable.')
  }

  await ensureOffscreenDocument()

  return sendOffscreenMessage({
    type: 'SALADICT_OFFSCREEN_DICT_TASK',
    task: 'GET_DICT_SRC_PAGE',
    payload: {
      ...data,
      appConfig,
      activeProfile
    }
  })
}

export async function callDictEngineMethodInOffscreen(
  data: Message<'DICT_ENGINE_METHOD'>['payload']
) {
  if (!canUseOffscreenDocument()) {
    throw new Error('Offscreen document is unavailable.')
  }

  await ensureOffscreenDocument()

  return sendOffscreenMessage({
    type: 'SALADICT_OFFSCREEN_DICT_TASK',
    task: 'DICT_ENGINE_METHOD',
    payload: data
  })
}
