import {
  SearchFunction,
  GetSrcPageFunction,
  handleNoResult,
  handleNetWorkError
} from '../helpers'
import axios from 'axios'

const APPLICATION_ID = 'E62VyFVLMiW7kvbtVq3p'

export const getSrcPage: GetSrcPageFunction = async text => {
  return `https://www.mojidict.com/details/${await getTarId(text)}`
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
}

export const search: SearchFunction<MojidictResult> = async (
  text,
  config,
  profile,
  payload
) => {
  const response = await axios({
    method: 'post',
    url: 'https://api.mojidict.com/parse/functions/fetchWord_v2',
    data: {
      wordId: await getTarId(text),
      _ApplicationId: APPLICATION_ID,
      _ClientVersion: 'js2.7.1',
      _InstallationId: getInstallationId()
    }
  })

  const result: FetchWordResult = response.data.result

  if (result && (result.details || result.word)) {
    let word: MojidictResult['word']
    if (result.word) {
      word = {
        spell: result.word.spell,
        pron: `${result.word.pron || ''} ${result.word.accent || ''}`,
        tts: await getTTS(result.word.spell, result.word.objectId)
      }
    }

    let details: MojidictResult['details']
    if (result.details) {
      details = result.details.map(detail => ({
        title: detail.title,
        subdetails:
          result.subdetails &&
          result.subdetails
            .filter(subdetail => subdetail.detailsId === detail.objectId)
            .map(subdetail => ({
              title: subdetail.title,
              examples:
                result.examples &&
                result.examples.filter(
                  example => example.subdetailsId === subdetail.objectId
                )
            }))
      }))
    }

    return word && word.tts
      ? { result: { word, details }, audio: { py: word.tts } }
      : { result: { word, details } }
  }

  return handleNoResult()
}

async function getTarId(text: string): Promise<string> {
  try {
    const { data } = await axios({
      method: 'post',
      url: 'https://api.mojidict.com/parse/functions/search_v2',
      data: {
        needWords: true,
        searchText: text,
        _ApplicationId: APPLICATION_ID,
        _ClientVersion: 'js2.7.1',
        _InstallationId: getInstallationId()
      }
    })

    if (
      data.result &&
      data.result.searchResults &&
      data.result.searchResults[0] &&
      data.result.searchResults[0].tarId
    ) {
      return String(data.result.searchResults[0].tarId)
    }

    return handleNoResult()
  } catch (e) {
    return handleNetWorkError()
  }
}

async function getTTS(text: string, wordId: string): Promise<string> {
  try {
    const { data } = await axios({
      method: 'post',
      url: 'https://api.mojidict.com/parse/functions/fetchTts',
      data: {
        identity: wordId,
        text,
        _ApplicationId: APPLICATION_ID,
        _ClientVersion: 'js2.7.1',
        _InstallationId: getInstallationId()
      }
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
