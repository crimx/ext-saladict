import { DictID, AppConfig } from '@/app-config'
import { MachineTranslateResult } from '@/components/dictionaries/helpers'
import { message } from './browser-api'
import { isPDFPage } from './saladict'

type CtxTranslatorId = keyof AppConfig['ctxTrans']

type CtxTranslateResults = Array<{ name: string; content: string }>

interface FetchDictResultResponse {
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
  const ids = Object.keys(ctxTrans) as Array<CtxTranslatorId>

  if (ids.length <= 0) {
    return []
  }

  return Promise.all(
    ids.map(async id => ({
      name: id,
      content: ctxTrans[id] ? await translateCtx(text, id) : ''
    }))
  )
}

/**
 * get translator result from text
 */
export function parseCtxText(text: string): CtxTranslateResults {
  const matcher = />>>>>:: (\w+) ::<+\n([\s\S]+?)(?=(?:>>>>>:: \w+ ::<+)|(?:-{40}))/g
  let matchResult: RegExpExecArray | null
  const result: CtxTranslateResults = []
  while ((matchResult = matcher.exec(text)) !== null) {
    result.push({
      name: matchResult[1],
      content: matchResult[2].replace(/\n+$/g, '')
    })
  }
  return result
}

/**
 * Add Context translate result to text
 * @param text original text
 */
export function genCtxText(text: string, arr: CtxTranslateResults): string {
  const ctxResults =
    arr
      .filter(({ content }) => content)
      .map(
        ({ name, content }) =>
          `>>>>>:: ${name} ::${''.padEnd(40 - 5 - 6 - name.length, '<')}\n` +
          content
      )
      .join('\n\n') + `\n${''.padEnd(40, '-')}\n`

  if (!text) {
    return ctxResults
  }

  const matcher = />>>>>:: (\w+) ::<+\n([\s\S]+?)-{40}/

  if (matcher.test(text)) {
    return text.replace(matcher, ctxResults)
  }

  return text + '\n\n' + ctxResults
}
