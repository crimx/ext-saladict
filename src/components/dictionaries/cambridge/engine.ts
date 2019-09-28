import { chsToChz } from '@/_helpers/chs-to-chz'
import { fetchDirtyDOM } from '@/_helpers/fetch-dom'
import { getStaticSpeaker } from '@/components/Speaker'
import {
  HTMLString,
  getInnerHTML,
  handleNoResult,
  getText,
  removeChild,
  handleNetWorkError,
  SearchFunction,
  GetSrcPageFunction,
  DictSearchResult,
  getFullLink,
  externalLink
} from '../helpers'

export const getSrcPage: GetSrcPageFunction = (text, config) => {
  switch (config.langCode) {
    case 'en':
      return `https://dictionary.cambridge.org/search/english/direct/?q=${text
        .trim()
        .split(/\s+/)
        .join('-')}`
    case 'zh-CN':
      return `https://dictionary.cambridge.org/zhs/搜索/英语-汉语-简体/direct/?q=${text}`
    case 'zh-TW':
      return `https://dictionary.cambridge.org/zht/搜索/英語-漢語-繁體/direct/?q=${chsToChz(
        text
      )}`
  }
}

const HOST = 'https://dictionary.cambridge.org'

type CambridgeResultItem = HTMLString

export type CambridgeResult = CambridgeResultItem[]

type CambridgeSearchResult = DictSearchResult<CambridgeResult>

export const search: SearchFunction<CambridgeResult> = (
  text,
  config,
  profile,
  payload
) => {
  const url =
    config.langCode === 'zh-CN'
      ? 'https://dictionary.cambridge.org/zhs/搜索/英语-汉语-简体/direct/?q='
      : config.langCode === 'zh-TW'
      ? 'https://dictionary.cambridge.org/zht/搜索/英語-漢語-繁體/direct/?q='
      : 'https://dictionary.cambridge.org/search/english/direct/?q='

  return fetchDirtyDOM(
    encodeURI(url) + text.toLocaleLowerCase().replace(/[^A-Za-z0-9]+/g, '-')
  )
    .catch(handleNetWorkError)
    .then(handleDOM)
}

function handleDOM(
  doc: Document
): CambridgeSearchResult | Promise<CambridgeSearchResult> {
  const result: CambridgeResult = []
  const audio: { us?: string; uk?: string } = {}

  doc.querySelectorAll('.entry-body__el').forEach($entry => {
    if (!getText($entry, '.headword')) {
      return
    }

    const $posHeader = $entry.querySelector('.pos-header')
    if ($posHeader) {
      $posHeader.querySelectorAll('.dpron-i').forEach($pron => {
        const $daud = $pron.querySelector<HTMLSpanElement>('.daud')
        if (!$daud) return
        const $source = $daud.querySelector<HTMLSourceElement>(
          'source[type="audio/mpeg"]'
        )
        if (!$source) return

        const src = getFullLink(
          'https://dictionary.cambridge.org',
          $source,
          'src'
        )

        if (src) {
          $daud.replaceWith(getStaticSpeaker(src))

          if (!audio.uk && $pron.classList.contains('uk')) {
            audio.uk = src
          }

          if (!audio.us && $pron.classList.contains('us')) {
            audio.us = src
          }
        }
      })
      removeChild($posHeader, '.share')
    }

    // expand button
    $entry.querySelectorAll('.daccord_h').forEach($btn => {
      $btn.parentElement!.classList.add('amp-accordion')
    })

    // See more results
    $entry.querySelectorAll<HTMLAnchorElement>('a.had').forEach(externalLink)

    result.push(getInnerHTML(HOST, $entry))
  })

  if (result.length > 0) {
    return { result, audio }
  }

  return handleNoResult()
}
