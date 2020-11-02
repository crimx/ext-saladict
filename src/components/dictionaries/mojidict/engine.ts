import {
  SearchFunction,
  GetSrcPageFunction,
  handleNoResult,
  handleNetWorkError
} from '../helpers'
import axios, { AxiosResponse } from 'axios'

export const getSrcPage: GetSrcPageFunction = async text => {
  const suggests = await getSuggests(text).catch(() => null)
  if (suggests) {
    const tarId =
      suggests.searchResults &&
      suggests.searchResults[0] &&
      suggests.searchResults[0].tarId
    if (tarId) {
      return `https://www.mojidict.com/details/${tarId}`
    }
  }
  return 'https://www.mojidict.com'
}

interface FetchWordResult {
  details?: Array<{
    objectId: string
    title: string
    wordId: string
  }>
  examples?: Array<{
    objectId: string
    subdetailsId: string
    title: string
    trans: string
    wordId: string
  }>
  subdetails?: Array<{
    detailsId: string
    objectId: string
    title: string
    wordId: string
  }>
  word?: {
    accent: string
    objectId: string
    pron: string
    spell: string
    tts: string
  }
}

interface SuggestsResult {
  originalSearchText: string
  searchResults?: Array<{
    objectId: string
    searchText: string
    tarId: string
  }>
  words?: Array<{
    accent: string
    excerpt: string
    objectId: string
    pron: string
    romaji: string
    spell: string
  }>
}

interface FetchTtsResult {
  result: {
    code: number
    result?: {
      text: string
      url: string
      identity: string
      existed: boolean
      msg: string
    }
  }
}

export interface MojidictResult {
  word?: {
    tarId: string
    spell: string
    pron: string
    tts?: string
  }
  details?: Array<{
    objectId: string
    title: string
    subdetails?: Array<{
      objectId: string
      title: string
      examples?: Array<{
        objectId: string
        title: string
        trans: string
      }>
    }>
  }>
  releated?: Array<{
    title: string
    excerpt: string
  }>
}

export const search: SearchFunction<MojidictResult> = async (
  text,
  config,
  profile,
  payload
) => {
  const suggests = await getSuggests(text)

  const tarId = suggests.searchResults?.[0]?.tarId
  if (!tarId) {
    return handleNoResult()
  }

  const {
    data: { result: wordResult }
  }: AxiosResponse<{ result: FetchWordResult }> = await axios({
    method: 'post',
    url: 'https://api.mojidict.com/parse/functions/fetchWord_v2',
    headers: {
      'content-type': 'text/plain'
    },
    data: requestPayload({ wordId: tarId })
  })

  const result: MojidictResult = {}

  if (wordResult && (wordResult.details || wordResult.word)) {
    if (wordResult.word) {
      result.word = {
        tarId,
        spell: wordResult.word.spell,
        pron: `${wordResult.word.pron || ''} ${wordResult.word.accent || ''}`
      }
    }

    if (wordResult.details) {
      result.details = wordResult.details.map(detail => ({
        objectId: detail.objectId,
        title: detail.title,
        subdetails: wordResult?.subdetails
          ?.filter(subdetail => subdetail.detailsId === detail.objectId)
          .map(subdetail => ({
            objectId: subdetail.objectId,
            title: subdetail.title,
            examples: wordResult?.examples?.filter(
              example => example.subdetailsId === subdetail.objectId
            )
          }))
      }))
    }

    if (suggests.words && suggests?.words.length > 1) {
      result.releated = suggests.words
        .map(word => ({
          title: `${word.spell} | ${word.pron || ''} ${word.accent || ''}`,
          excerpt: word.excerpt
        }))
        .slice(1)
    }

    if (result.word && config.autopron.cn.dict === 'mojidict') {
      result.word.tts = await getTTS(tarId, 102)
      return { result, audio: { py: result.word.tts } }
    }

    return { result }
  }

  return handleNoResult()
}

async function getSuggests(text: string): Promise<SuggestsResult> {
  try {
    const {
      data: { result }
    }: AxiosResponse<{ result?: SuggestsResult }> = await axios({
      method: 'post',
      url: 'https://api.mojidict.com/parse/functions/search_v3',
      headers: {
        'content-type': 'text/plain'
      },
      data: requestPayload({
        langEnv: 'zh-CN_ja',
        needWords: true,
        searchText: text
      })
    })

    return result || handleNoResult()
  } catch (e) {
    return handleNetWorkError()
  }
}

/**
 * @param tarId word id
 * @param tarType 102 word, 103 sentence
 */
export async function getTTS(
  tarId: string,
  tarType: 102 | 103
): Promise<string> {
  try {
    const { data }: AxiosResponse<FetchTtsResult> = await axios({
      method: 'post',
      url: 'https://api.mojidict.com/parse/functions/fetchTts_v2',
      headers: {
        'content-type': 'text/plain'
      },
      data: requestPayload({ tarId, tarType })
    })

    return data.result?.result?.url || ''
  } catch (e) {
    if (process.env.DEBUG) {
      console.error(e)
    }
  }
  return ''
}

export type GetTTS = typeof getTTS

function requestPayload(data: object) {
  return JSON.stringify({
    _ApplicationId: process.env.MOJI_ID,
    _ClientVersion: 'js2.12.0',
    _InstallationId: getInstallationId(),
    ...data
  })
}

function getInstallationId() {
  return s() + s() + '-' + s() + '-' + s() + '-' + s() + '-' + s() + s() + s()
}

function s() {
  return Math.floor(65536 * (1 + Math.random()))
    .toString(16)
    .substring(1)
}
