import {
  SearchFunction,
  GetSrcPageFunction,
  handleNoResult,
  handleNetWorkError
} from '../helpers'
import axios, { AxiosResponse } from 'axios'

const APPLICATION_ID = 'E62VyFVLMiW7kvbtVq3p'

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

export interface MojidictResult {
  word?: {
    spell: string
    pron: string
    tts: string
  }
  details?: Array<{
    title: string
    subdetails?: Array<{
      title: string
      examples?: Array<{
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

  const wordId =
    suggests.searchResults &&
    suggests.searchResults[0] &&
    suggests.searchResults[0].tarId
  if (!wordId) {
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
    data: JSON.stringify({
      wordId,
      _ApplicationId: APPLICATION_ID,
      _ClientVersion: 'js2.7.1',
      _InstallationId: getInstallationId()
    })
  })

  const result: MojidictResult = {}

  if (wordResult && (wordResult.details || wordResult.word)) {
    if (wordResult.word) {
      result.word = {
        spell: wordResult.word.spell,
        pron: `${wordResult.word.pron || ''} ${wordResult.word.accent || ''}`,
        tts: await getTTS(wordResult.word.spell, wordResult.word.objectId)
      }
    }

    if (wordResult.details) {
      result.details = wordResult.details.map(detail => ({
        title: detail.title,
        subdetails:
          wordResult.subdetails &&
          wordResult.subdetails
            .filter(subdetail => subdetail.detailsId === detail.objectId)
            .map(subdetail => ({
              title: subdetail.title,
              examples:
                wordResult.examples &&
                wordResult.examples.filter(
                  example => example.subdetailsId === subdetail.objectId
                )
            }))
      }))
    }

    if (suggests.words && suggests.words.length > 1) {
      result.releated = suggests.words
        .map(word => ({
          title: `${word.spell} | ${word.pron || ''} ${word.accent || ''}`,
          excerpt: word.excerpt
        }))
        .slice(1)
    }

    return result.word && result.word.tts
      ? { result, audio: { py: result.word.tts } }
      : { result }
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
      data: JSON.stringify({
        langEnv: 'zh-CN_ja',
        needWords: true,
        searchText: text,
        _ApplicationId: APPLICATION_ID,
        _ClientVersion: 'js2.7.1',
        _InstallationId: getInstallationId()
      })
    })

    return result || handleNoResult()
  } catch (e) {
    return handleNetWorkError()
  }
}

async function getTTS(text: string, wordId: string): Promise<string> {
  try {
    const { data } = await axios({
      method: 'post',
      url: 'https://api.mojidict.com/parse/functions/fetchTts',
      headers: {
        'content-type': 'text/plain'
      },
      data: JSON.stringify({
        identity: wordId,
        text,
        _ApplicationId: APPLICATION_ID,
        _ClientVersion: 'js2.7.1',
        _InstallationId: getInstallationId()
      })
    })

    if (data.result && data.result.url) {
      return data.result.url
    }
  } catch (e) {}
  return ''
}

function getInstallationId() {
  return s() + s() + '-' + s() + '-' + s() + '-' + s() + '-' + s() + s() + s()
}

function s() {
  return Math.floor(65536 * (1 + Math.random()))
    .toString(16)
    .substring(1)
}
