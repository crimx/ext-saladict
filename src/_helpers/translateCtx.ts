import { DictID, AppConfig } from '@/app-config'
import { MachineTranslateResult } from '@/components/dictionaries/helpers'
import { reflect } from './promise-more'
import { message } from './browser-api'
import { isPDFPage } from './saladict'

/**
 * translate selection context with selected machine translatiors
 * @param text search text
 * @param ctxTrans machine translatiors
 */
export async function translateCtx(
  text: string,
  ctxTrans: AppConfig['ctxTrans']
): Promise<string> {
  const ids = Object.keys(ctxTrans).filter(id => ctxTrans[id]) as DictID[]
  if (ids.length <= 0) {
    return ''
  }

  type FetchDictResultResponse = {
    id: DictID
    result: MachineTranslateResult<DictID>
  }

  const responses = await reflect(
    ids.map(id =>
      message.send<'FETCH_DICT_RESULT', FetchDictResultResponse>({
        type: 'FETCH_DICT_RESULT',
        payload: {
          id,
          text,
          payload: { isPDF: isPDFPage() }
        }
      })
    )
  )

  return responses
    .map(
      response =>
        response &&
        response.result &&
        response.result.trans &&
        response.result.trans.paragraphs.join('\n')
    )
    .filter(Boolean)
    .map((text, i, arr) => (arr.length > 1 ? `${ids[i]}: ${text}` : text))
    .join('\n')
}
