import { DictID, AppConfig } from '@/app-config'
import { MachineTranslateResult } from '@/components/dictionaries/helpers'
import { reflect } from './promise-more'
import { message } from './browser-api'

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
          payload: { isPDF: !!window.__SALADICT_PDF_PAGE__ }
        }
      })
    )
  )

  return responses
    .filter(
      response =>
        response &&
        response.result &&
        response.result.trans &&
        response.result.trans.text
    )
    .map((response, i, arr) =>
      arr.length > 1
        ? `${ids[i]}: ${response!.result.trans}`
        : response!.result.trans
    )
    .join('\n')
}
