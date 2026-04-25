import {
  SearchFunction,
  GetSrcPageFunction,
  handleNoResult,
  handleNetWorkError,
  HTMLString
} from '../helpers'
import axios, { AxiosResponse } from 'axios'
import DOMPurify from 'dompurify'

const API_ROOT = 'https://api.mojidict.com/app/mojidict/api/v1'
const PARSE_ROOT = 'https://api.mojidict.com/parse/functions'
const WEB_ROOT = 'https://www.mojidict.com'
const MOJI_APP_VERSION = '4.15.13'
const MOJI_PARSE_APP_ID = 'E62VyFVLMiW7kvbtVq3p'
const MOJI_PARSE_CLIENT_VERSION = 'js4.3.1'
const WORD_TYPE = 102

export const getSrcPage: GetSrcPageFunction = async text => {
  const result = await getAllSearch(text).catch(() => null)
  const tarId = result?.word?.list?.[0]?.targetId
  return tarId ? `${WEB_ROOT}/details/${tarId}` : WEB_ROOT
}

interface SearchAllResult {
  word?: {
    list?: SearchListItem[]
  }
  grammar?: {
    list?: SearchListItem[]
  }
}

interface SearchListItem {
  notationTitle?: string
  srcTargetTitle?: string
  targetId: string
  targetType: number
  title: string
  excerpt: string
}

interface DetailInfoResult {
  word?: {
    accent?: string
    excerpt?: string
    hasRelated?: boolean
    imgUrl?: string
    objectId: string
    pron?: string
    romaji?: string
    spell: string
  }
  details?: DetailInfoDetail[]
  examples?: DetailInfoExample[]
  subdetails?: DetailInfoSubdetail[]
}

interface DetailInfoDetail {
  objectId: string
  partOfSpeech?: number[]
}

interface DetailInfoSubdetail {
  detailsId: string
  lang: string
  objectId: string
  relaId?: string
  title: string
}

interface DetailInfoExample {
  lang: string
  objectId: string
  notationTitle?: string
  relaId?: string
  subdetailsId: string
  title: string
}

interface SearchListResult {
  list?: SearchListItem[]
}

interface RelatedResult {
  list?: RelatedInfo[]
}

interface RelatedInfo {
  synonyms?: RelatedWord[]
  antonyms?: RelatedWord[]
  paronyms?: RelatedWord[]
  polyphonics?: RelatedWord[]
  subject?: Array<{
    title: string
    trans?: string
    relatedId?: string
  }>
}

interface RelatedWord {
  objectId?: string
  id?: string
  spell: string
  pron?: string
}

interface FetchTtsResult {
  result: {
    code: number
    result?: {
      text: string
      url: string
    }
    tarId: string
    tarType: number
  }
}

export interface MojidictResult {
  word?: {
    tarId: string
    spell: string
    pron: string
    excerpt?: string
    imgUrl?: string
    tts?: string
  }
  details?: Array<{
    objectId: string
    title: string
    subdetails?: Array<{
      objectId: string
      title: string
      titleJa?: string
      examples?: Array<{
        objectId: string
        title: string
        trans?: string
        notationTitle?: HTMLString
      }>
    }>
  }>
  examples?: Array<{
    objectId: string
    title: string
    trans?: string
    notationTitle?: HTMLString
    source?: string
  }>
  examQuestions?: Array<{
    objectId: string
    title: string
    excerpt: string
  }>
  related?: Array<{
    title: string
    words: Array<{
      objectId?: string
      title: string
      excerpt?: string
    }>
  }>
}

type MojidictRelated = NonNullable<MojidictResult['related']>

export const search: SearchFunction<MojidictResult> = async (
  text,
  config,
  profile,
  payload
) => {
  const allResult = await getAllSearch(text)
  const wordEntry = allResult.word?.list?.find(
    item => item.targetType === WORD_TYPE
  )

  if (!wordEntry?.targetId) {
    return handleNoResult()
  }

  const wordId = wordEntry.targetId
  const [detailInfo, examples, examQuestions] = await Promise.all([
    getDetailInfo(wordId),
    getSearchList('example', {
      text,
      limit: '3',
      needNotation: 'true',
      onlyJP: 'true',
      onlyFull: 'true',
      targetTypes: '121',
      wordId
    }).catch(() => ({ list: [] })),
    getSearchList('examQuestion', {
      text,
      limit: '3',
      highlight: 'false',
      onlyFull: 'true',
      wordId
    }).catch(() => ({ list: [] }))
  ])

  const result = buildResult(wordId, detailInfo, examples, examQuestions)

  if (detailInfo.word?.hasRelated) {
    const related = await getRelated(wordId).catch<MojidictRelated>(() => [])
    if (related.length > 0) {
      result.related = related
    }
  }

  if (result.word && config.autopron.cn.dict === 'mojidict') {
    result.word.tts = await getTTS(wordId, 102)
    return { result, audio: { py: result.word.tts } }
  }

  return { result }
}

async function getAllSearch(text: string): Promise<SearchAllResult> {
  try {
    const { data }: AxiosResponse<SearchAllResult> = await axios({
      method: 'get',
      url: `${API_ROOT}/search/all${queryString({
        text,
        types: ['102', '106', '103', '671'],
        highlight: 'true'
      })}`,
      headers: requestHeaders()
    })

    return data
  } catch (e) {
    return handleNetWorkError(e)
  }
}

async function getDetailInfo(wordId: string): Promise<DetailInfoResult> {
  try {
    const { data }: AxiosResponse<DetailInfoResult> = await axios({
      method: 'get',
      url: `${API_ROOT}/word/detailInfo${queryString({ wordId })}`,
      headers: requestHeaders()
    })

    if (!data.word) {
      return handleNoResult()
    }

    return data
  } catch (e) {
    return handleNetWorkError(e)
  }
}

async function getSearchList(
  type: 'example' | 'examQuestion',
  params: Record<string, string>
): Promise<SearchListResult> {
  const { data }: AxiosResponse<SearchListResult> = await axios({
    method: 'get',
    url: `${API_ROOT}/search/${type}${queryString(params)}`,
    headers: requestHeaders()
  })

  return data
}

async function getRelated(wordId: string): Promise<MojidictRelated> {
  const { data }: AxiosResponse<RelatedResult> = await axios({
    method: 'post',
    url: `${API_ROOT}/word/related`,
    headers: {
      ...requestHeaders(),
      'content-type': 'application/json'
    },
    data: { wordIds: [wordId] }
  })

  const related = data.list?.[0]
  if (!related) {
    return []
  }

  return [
    relatedWordsGroup('同义词', related.synonyms),
    relatedWordsGroup('反义词', related.antonyms),
    relatedWordsGroup('近形词', related.paronyms),
    relatedWordsGroup('多音词', related.polyphonics),
    related.subject
      ? {
          title: '关联主题',
          words: related.subject.map(word => ({
            objectId: word.relatedId,
            title: word.title,
            excerpt: word.trans
          }))
        }
      : undefined
  ].filter((group): group is MojidictRelated[number] => {
    return !!group && group.words.length > 0
  })
}

function buildResult(
  wordId: string,
  detailInfo: DetailInfoResult,
  examples: SearchListResult,
  examQuestions: SearchListResult
): MojidictResult {
  const word = detailInfo.word
  const result: MojidictResult = {}

  if (word) {
    result.word = {
      tarId: wordId,
      spell: word.spell,
      pron: [word.pron, word.accent].filter(Boolean).join(' '),
      excerpt: word.excerpt,
      imgUrl: word.imgUrl
    }
  }

  result.details = detailInfo.details
    ?.map(detail => ({
      objectId: detail.objectId,
      title: formatPartOfSpeech(detail.partOfSpeech, word?.excerpt),
      subdetails: buildSubdetails(
        detail,
        detailInfo.subdetails,
        detailInfo.examples
      )
    }))
    .filter(detail => detail.subdetails && detail.subdetails.length > 0)

  result.examples = examples.list?.map(example => ({
    objectId: example.targetId,
    title: example.title,
    trans: example.excerpt,
    notationTitle: sanitizeNotation(example.notationTitle),
    source: example.srcTargetTitle
  }))

  result.examQuestions = examQuestions.list?.map(question => ({
    objectId: question.targetId,
    title: question.title,
    excerpt: question.excerpt
  }))

  return result
}

function buildSubdetails(
  detail: DetailInfoDetail,
  subdetails: DetailInfoSubdetail[] = [],
  examples: DetailInfoExample[] = []
): NonNullable<NonNullable<MojidictResult['details']>[number]['subdetails']> {
  const pairs = subdetails
    .filter(subdetail => subdetail.detailsId === detail.objectId)
    .reduce<
      Record<string, { zh?: DetailInfoSubdetail; ja?: DetailInfoSubdetail }>
    >((groups, subdetail) => {
      const relaId = subdetail.relaId || subdetail.objectId
      const group = groups[relaId] || {}
      if (/^ja/i.test(subdetail.lang)) {
        group.ja = subdetail
      } else {
        group.zh = subdetail
      }
      groups[relaId] = group
      return groups
    }, {})

  return Object.keys(pairs).map(relaId => {
    const pair = pairs[relaId]
    const base = pair.zh || pair.ja

    return {
      objectId: base?.objectId || relaId,
      title: pair.zh?.title || pair.ja?.title || '',
      titleJa: pair.ja?.title,
      examples: buildDetailExamples(relaId, examples)
    }
  })
}

function buildDetailExamples(
  subdetailsId: string,
  examples: DetailInfoExample[]
): NonNullable<
  NonNullable<
    NonNullable<MojidictResult['details']>[number]['subdetails']
  >[number]['examples']
> {
  const pairs = examples
    .filter(example => example.subdetailsId === subdetailsId)
    .reduce<Record<string, { zh?: DetailInfoExample; ja?: DetailInfoExample }>>(
      (groups, example) => {
        const relaId = example.relaId || example.objectId
        const group = groups[relaId] || {}
        if (/^ja/i.test(example.lang)) {
          group.ja = example
        } else {
          group.zh = example
        }
        groups[relaId] = group
        return groups
      },
      {}
    )

  return Object.keys(pairs).map(relaId => {
    const pair = pairs[relaId]
    const base = pair.ja || pair.zh

    return {
      objectId: base?.objectId || relaId,
      title: pair.ja?.title || pair.zh?.title || '',
      trans: pair.zh?.title,
      notationTitle: sanitizeNotation(pair.ja?.notationTitle)
    }
  })
}

function relatedWordsGroup(
  title: string,
  words?: RelatedWord[]
): MojidictRelated[number] | undefined {
  return words && words.length > 0
    ? {
        title,
        words: words.map(word => ({
          objectId: word.objectId || word.id,
          title: word.spell,
          excerpt: word.pron
        }))
      }
    : undefined
}

function formatPartOfSpeech(parts: number[] = [], excerpt = '') {
  const partNames = parts
    .map(part => PART_OF_SPEECH[part])
    .filter((part): part is string => !!part)

  if (partNames.length > 0) {
    return partNames.join('・')
  }

  return excerpt.match(/^\[[^\]]+\]/)?.[0] || '释义'
}

function sanitizeNotation(html?: string): HTMLString | undefined {
  if (!html) {
    return undefined
  }

  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: ['ruby', 'rb', 'rp', 'rt', 'span'],
    ALLOWED_ATTR: ['class', 'hiragana', 'lemma', 'lemma-t', 'roma']
  })
}

function requestHeaders() {
  return {
    accept: 'application/json, text/plain, */*',
    origin: WEB_ROOT,
    referer: `${WEB_ROOT}/`,
    'x-moji-app-id': 'com.mojitec.mojidict',
    'x-moji-app-version': MOJI_APP_VERSION,
    'x-moji-device-id': getInstallationId(),
    'x-moji-os': 'PCWeb'
  }
}

function queryString(params: Record<string, string | string[]>) {
  const query = new URLSearchParams()
  Object.keys(params).forEach(key => {
    const value = params[key]
    if (Array.isArray(value)) {
      value.forEach(item => query.append(key, item))
    } else {
      query.append(key, value)
    }
  })

  return `?${query.toString()}`
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
      url: `${PARSE_ROOT}/tts-fetch`,
      headers: {
        accept: '*/*',
        origin: WEB_ROOT,
        referer: `${WEB_ROOT}/`,
        'content-type': 'text/plain'
      },
      data: requestPayload({ tarId, tarType, voiceId: 'f002' })
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
    _ApplicationId: MOJI_PARSE_APP_ID,
    _ClientVersion: MOJI_PARSE_CLIENT_VERSION,
    _InstallationId: getInstallationId(),
    g_os: 'PCWeb',
    g_ver: MOJI_APP_VERSION,
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

const PART_OF_SPEECH: Record<number, string> = {
  1: '名',
  2: '代',
  3: '动',
  4: '形',
  5: '形动',
  6: '副',
  7: '连体',
  8: '接续',
  9: '感',
  10: '助',
  11: '助动',
  12: '接头',
  13: '接尾',
  14: '惯用',
  15: '词组'
}
