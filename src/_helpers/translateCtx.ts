import { DictID } from '@/app-config'
import { MachineTranslateResult } from '@/components/dictionaries/helpers'
import { reflect } from './promise-more'
import { message } from './browser-api'
import { MsgFetchDictResult, MsgType, MsgFetchDictResultResponse } from '@/typings/message'
const isSaladictPDFPage = !!window.__SALADICT_PDF_PAGE__

/**
 * translate selection context with selected machine translatiors
 * @param text search text
 * @param ctxTrans machine translatiors
 */
export function translateCtx (text: string, ctxTrans: { [id in DictID]: boolean }): Promise<string> {
  const ids = Object.keys(ctxTrans).filter(id => ctxTrans[id]) as DictID[]
  if (ids.length > 0) {
    const payload = { isPDF: isSaladictPDFPage }
    return reflect<MsgFetchDictResultResponse<MachineTranslateResult<DictID>>>(
      ids.map(id => message.send<MsgFetchDictResult>({
        type: MsgType.FetchDictResult,
        id,
        text,
        payload,
      }))
    )
    .then(responses => responses
      .map((response, i) => response && response.result && [ids[i], response.result.trans.text])
      .filter((x): x is [string, string] => !!x)
      .map(([id, text], i, arr) => arr.length > 1 ? `${id}: ${text}` : text)
      .join('\n')
    )
    .catch(() => '')
  }
  return Promise.resolve('')
}
