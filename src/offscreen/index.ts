import { DictID, AppConfig } from '@/app-config'
import { Profile } from '@/app-config/profiles'
import {
  DictSearchResult,
  GetSrcPageFunction,
  SearchFunction,
  createManualVerificationResult,
  isManualVerificationError
} from '@/components/dictionaries/helpers'
import { Message } from '@/typings/message'

let audio: HTMLAudioElement | undefined

function resetAudio() {
  if (audio) {
    audio.pause()
    audio.currentTime = 0
    audio.src = ''
    audio.onended = null
    audio = undefined
  }
}

async function playAudio(src?: string) {
  if (!src) {
    resetAudio()
    return
  }

  if (audio && audio.src === src) {
    resetAudio()
    return
  }

  resetAudio()
  const nextAudio = new Audio(src)
  audio = nextAudio

  try {
    await nextAudio.play()
  } catch (error) {
    if (process.env.DEBUG) {
      console.warn('Failed to play audio in offscreen document:', error)
    }
    if (audio === nextAudio) {
      resetAudio()
    }
  }
}

function copyText(text: string) {
  const copyFrom = document.createElement('textarea')
  copyFrom.textContent = text
  document.body.appendChild(copyFrom)
  copyFrom.select()
  document.execCommand('copy')
  copyFrom.blur()
  document.body.removeChild(copyFrom)
}

function readText(): string {
  let el = document.getElementById(
    'saladict-paste'
  ) as HTMLTextAreaElement | null
  if (!el) {
    el = document.createElement('textarea')
    el.id = 'saladict-paste'
    document.body.appendChild(el)
  }
  el.value = ''
  el.focus()
  document.execCommand('paste')
  return el.value || ''
}

function getDictEngine(
  id: DictID
): Promise<{
  search: SearchFunction<DictSearchResult<any>, any>
  getSrcPage: GetSrcPageFunction
  [key: string]: any
}> {
  return import(
    /* webpackInclude: /engine\.ts$/ */
    /* webpackMode: "eager" */
    `@/components/dictionaries/${id}/engine.ts`
  )
}

async function searchDict({
  id,
  text,
  payload,
  appConfig,
  activeProfile
}: Message<'FETCH_DICT_RESULT'>['payload'] & {
  appConfig: AppConfig
  activeProfile: Profile
}) {
  const { search } = await getDictEngine(id)
  try {
    return await search(text, appConfig, activeProfile, payload || {
      isPDF: false
    })
  } catch (e) {
    if (isManualVerificationError(e)) {
      return createManualVerificationResult(e.manualVerification)
    }
    throw e
  }
}

async function getDictSrcPage({
  id,
  text,
  appConfig,
  activeProfile
}: Message<'OPEN_DICT_SRC_PAGE'>['payload'] & {
  appConfig: AppConfig
  activeProfile: Profile
}) {
  const { getSrcPage } = await getDictEngine(id)
  return getSrcPage(text, appConfig, activeProfile)
}

async function callDictMethod(data: Message<'DICT_ENGINE_METHOD'>['payload']) {
  const engine = await getDictEngine(data.id)
  return engine[data.method](...(data.args || []))
}

browser.runtime.onMessage.addListener(message => {
  if (!message) {
    return
  }

  switch (message.type) {
    case 'SALADICT_OFFSCREEN_PING':
      return Promise.resolve(true)
    case 'SALADICT_OFFSCREEN_TASK':
      switch (message.task) {
        case 'PLAY_AUDIO':
          return playAudio(message.src)
        case 'STOP_AUDIO':
          resetAudio()
          return Promise.resolve()
        case 'WRITE_CLIPBOARD':
          copyText(message.text || '')
          return Promise.resolve()
        case 'READ_CLIPBOARD':
          return Promise.resolve(readText())
      }
      break
    case 'SALADICT_OFFSCREEN_DICT_TASK':
      switch (message.task) {
        case 'FETCH_DICT_RESULT':
          return searchDict(message.payload)
        case 'GET_DICT_SRC_PAGE':
          return getDictSrcPage(message.payload)
        case 'DICT_ENGINE_METHOD':
          return callDictMethod(message.payload)
      }
      break
  }
})
