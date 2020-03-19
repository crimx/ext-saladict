import { DictID, AppConfig } from '@/app-config'
import { MachineTranslateResult } from '@/components/dictionaries/helpers'
import { message } from './browser-api'
import { isPDFPage } from './saladict'

export type CtxTranslatorId = keyof AppConfig['ctxTrans']

export type CtxTranslateResults = {
  [id in CtxTranslatorId]: string
}

export interface FetchDictResultResponse {
  id: DictID
  result: MachineTranslateResult<DictID>
}

/**
 * translate selection context with selected machine translatior
 * @param text search text
 * @param id machine translatior id
 */
export async function translateCtx(
  text: string,
  id: CtxTranslatorId
): Promise<string> {
  try {
    const response = await message.send<
      'FETCH_DICT_RESULT',
      FetchDictResultResponse
    >({
      type: 'FETCH_DICT_RESULT',
      payload: {
        id,
        text,
        payload: { isPDF: isPDFPage() }
      }
    })

    return (
      (response &&
        response.result &&
        response.result.trans &&
        response.result.trans.paragraphs.join('\n')) ||
      ''
    )
  } catch (e) {
    return ''
  }
}

/**
 * translate selection context with selected machine translatiors
 * @param text search text
 * @param ctxTrans machine translatiors
 */
export async function translateCtxs(
  text: string,
  ctxTrans: AppConfig['ctxTrans']
): Promise<CtxTranslateResults> {
  return (await Promise.all(
    Object.keys(ctxTrans).map(async id => ({
      id,
      content: ctxTrans[id]
        ? await translateCtx(text, id as CtxTranslatorId)
        : ''
    }))
  )).reduce(
    (result, { id, content }) => {
      result[id] = content
      return result
    },
    {} as CtxTranslateResults
  )
}

/**
 * get translator result from text
 */
export function parseCtxText(text: string): CtxTranslateResults {
  const matcher = /\[:: (\w+) ::\]\n([\s\S]+?)(?=(?:\[:: \w+ ::\])|(?:-{15}))/g
  let matchResult: RegExpExecArray | null
  const result = {} as CtxTranslateResults
  while ((matchResult = matcher.exec(text)) !== null) {
    result[matchResult[1] as CtxTranslatorId] = matchResult[2].replace(
      /\n+$/g,
      ''
    )
  }
  return result
}

/**
 * Add Context translate result to text
 * @param text original text
 */
export function genCtxText(
  text: string,
  ctxTransResult: CtxTranslateResults
): string {
  const enginesWithResult = Object.keys(ctxTransResult).filter(
    id => ctxTransResult[id]
  )

  if (enginesWithResult.length <= 0) {
    return text
  }

  const ctxResults =
    enginesWithResult
      .map(id => `[:: ${id} ::]\n` + ctxTransResult[id])
      .join('\n\n') + `\n${''.padEnd(15, '-')}\n`

  if (!text) {
    return ctxResults
  }

  const matcher = /\[:: (\w+) ::\]\n([\s\S]+?)-{15}/

  if (matcher.test(text)) {
    return text.replace(matcher, ctxResults)
  }

  return text + '\n\n' + ctxResults
}
