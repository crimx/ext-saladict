import { fetchDirtyDOM } from '@/_helpers/fetch-dom'
import {
  HTMLString,
  getInnerHTMLThunk,
  handleNoResult,
  getText,
  removeChild,
} from '../helpers'
import { AppConfig } from '@/app-config'
import { DictSearchResult } from '@/typings/server'

const getInnerHTML = getInnerHTMLThunk('https://dictionary.cambridge.org/')

interface CambridgeResultItem {
  title: HTMLString
  pos: HTMLString
  prons: Array<{
    phsym: string
    pron: string
  }>
  defs: HTMLString
}

export type CambridgeResult = CambridgeResultItem[]

type CambridgeSearchResult = DictSearchResult<CambridgeResult>

export default function search (
  text: string,
  config: AppConfig,
): Promise<CambridgeSearchResult> {
  const url = config.langCode === 'zh-CN'
    ? 'https://dictionary.cambridge.org/zhs/搜索/英语-汉语-简体/direct/?q='
    : config.langCode === 'zh-TW'
      ? 'https://dictionary.cambridge.org/zht/搜索/英語-漢語-繁體/direct/?q='
      : 'https://dictionary.cambridge.org/search/english/direct/?q='

  return fetchDirtyDOM(url + text.toLocaleLowerCase().replace(/[^A-Za-z0-9]+/g, '-'))
    .then(handleDOM)
}

function handleDOM (
  doc: Document,
): CambridgeSearchResult | Promise<CambridgeSearchResult> {
  const result: CambridgeResult = []
  const audio: { us?: string, uk?: string } = {}

  doc.querySelectorAll('.entry-body__el').forEach($entry => {
    const entry: CambridgeResultItem = {
      title: getText($entry, '.headword'),
      pos: '',
      prons: [],
      defs: '',
    }

    if (!entry.title) { return }

    const $posHeader = $entry.querySelector('.pos-header')
    if ($posHeader) {
      $posHeader.querySelectorAll('.pron-info').forEach($pron => {
        const $btn = $pron.querySelector<HTMLSpanElement>('.audio_play_button')
        if ($btn) {
          const mp3 = $btn.dataset.srcMp3
          if (mp3) {
            entry.prons.push({
              phsym: getText($pron),
              pron: mp3,
            })

            if (!audio.uk && $btn.classList.contains('uk')) {
              audio.uk = mp3
            }

            if (!audio.us && $btn.classList.contains('us')) {
              audio.us = mp3
            }
          }
        }
        $pron.remove()
      })
      removeChild($posHeader, '.headword')
      removeChild($posHeader, '.share')
      entry.pos = getInnerHTML($posHeader)
      $posHeader.remove()
    }

    entry.defs = getInnerHTML($entry)
    if (!entry.defs) { return }

    result.push(entry)
  })

  if (result.length > 0) {
    return { result, audio }
  }

  return handleNoResult()
}
