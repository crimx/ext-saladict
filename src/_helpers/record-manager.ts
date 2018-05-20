/**
 * Abstracted layer for storing large amount of word records.
 */

import { message } from '@/_helpers/browser-api'
import { SelectionInfo } from '@/_helpers/selection'
import { Word as DBWord, Area as DBArea } from '@/background/database'
import {
  MsgType,
  MsgIsInNotebook,
  MsgSaveWord,
  MsgDeleteWords,
  MsgGetWordsByText,
  MsgGetWords,
  MsgGetWordsResponse,
} from '@/typings/message'

export type Word = DBWord

export type Area = DBArea

export function isInNotebook (info: SelectionInfo): Promise<boolean> {
  return message.send<MsgIsInNotebook>({ type: MsgType.IsInNotebook, info })
    .catch(logError(false))
}

export function saveWord (area: Area, info: SelectionInfo): Promise<void> {
  return message.send<MsgSaveWord>({ type: MsgType.SaveWord, area, info })
}

export function deleteWords (area: Area, dates?: number[]): Promise<void> {
  return message.send<MsgDeleteWords>({ type: MsgType.DeleteWords, area, dates })
}

export function getWordsByText (area: Area, text: string): Promise<Word[]> {
  return message.send<MsgGetWordsByText>({ type: MsgType.GetWordsByText, area, text })
}

export function getWords (
  area: Area,
  config: {
    itemsPerPage?: number,
    pageNum?: number,
    filters: { [field: string]: string[] | undefined },
    sortField?: string,
    sortOrder?: 'ascend' | 'descend' | false,
    searchText?: string,
  }
): Promise<MsgGetWordsResponse> {
  return message.send<MsgGetWords, MsgGetWordsResponse>({
    type: MsgType.GetWords,
    area,
    ...config,
  })
}

function logError<T = any> (valPassThrough: T): (x: any) => T {
  return err => {
    if (process.env.NODE_ENV !== 'production') {
      console.error(err)
    }
    return valPassThrough
  }
}
