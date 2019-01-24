import { DictID } from '@/app-config'
import { MachineTranslateResult } from '@/components/dictionaries/helpers'
import { reflect } from './promise-more'
import { message } from './browser-api'
import { MsgFetchDictResult, MsgType } from '@/typings/message'
const isSaladictPDFPage = !!window.__SALADICT_PDF_PAGE__

export function translateCtx (text: string, ctxTrans: { [index: string]: boolean }): Promise<string> {
  const ids = Object.keys(ctxTrans).filter(id => ctxTrans[id]) as DictID[]
  if (ids.length > 0) {
    const payload = { isPDF: isSaladictPDFPage }
    return reflect<MachineTranslateResult>(
      ids.map(id => message.send<MsgFetchDictResult>({
        type: MsgType.FetchDictResult,
        id,
        text,
        payload,
      }))
    )
    .then(results => results
      .map((result, i) => result && [ids[i], result.trans.text])
      .filter((x): x is [string, string] => !!x)
      .map(([id, text], i, arr) => arr.length > 1 ? `${id}: ${text}` : text)
      .join('\n')
    )
    .catch(() => '')
  }
  return Promise.resolve('')
}
