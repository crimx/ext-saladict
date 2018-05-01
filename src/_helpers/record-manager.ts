/**
 * Abstracted layer for storing large amount of word records.
 */

import { message } from '@/_helpers/browser-api'
import { SelectionInfo } from '@/_helpers/selection'
import { Word as DBWord, Area } from '@/background/database'
import {
  MsgType,
  MsgIsInNotebook,
  MsgSaveWord,
  MsgDeleteWord,
  MsgGetWordsByText,
  MsgGetAllWords,
} from '@/typings/message'

export type Word = DBWord

export function isInNotebook (info: SelectionInfo): Promise<boolean> {
  return message.send<MsgIsInNotebook>({ type: MsgType.IsInNotebook, info })
    .catch(logError(false))
}

export function saveWord (area: Area, info: SelectionInfo): Promise<void> {
  return message.send<MsgSaveWord>({ type: MsgType.SaveWord, area, info })
}

export function deleteWord (area: Area, word: Word): Promise<void> {
  return message.send<MsgDeleteWord>({ type: MsgType.DeleteWord, area, word })
}

export function getWordsByText (area: Area, text: string): Promise<Word[]> {
  return message.send<MsgGetWordsByText>({ type: MsgType.GetWordsByText, area, text })
}

export function getAllWords (area: Area, itemsPerPage: number, pageNum: number): Promise<Word[]> {
  return message.send<MsgGetAllWords>({ type: MsgType.GetAllWords, area, itemsPerPage, pageNum })
}

function logError<T = any> (valPassThrough: T): (x: any) => T {
  return err => {
    if (process.env.NODE_ENV !== 'production') {
      console.error(err)
    }
    return valPassThrough
  }
}
