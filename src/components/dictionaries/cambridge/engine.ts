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
  externalLink,
  getChsToChz
} from '../helpers'

export const getSrcPage: GetSrcPageFunction = async (text, config) => {
  switch (config.langCode) {
    case 'en':
      return `https://dictionary.cambridge.org/search/english/direct/?q=${text
        .trim()
        .split(/\s+/)
        .join('-')}`
    case 'zh-CN':
      return `https://dictionary.cambridge.org/zhs/搜索/英语-汉语-简体/direct/?q=${text}`
    case 'zh-TW': {
      const chsToChz = await getChsToChz()
      return `https://dictionary.cambridge.org/zht/搜索/英語-漢語-繁體/direct/?q=${chsToChz(
        text
      )}`
    }
  }
}

const HOST = 'https://dictionary.cambridge.org'

type CambridgeResultItem = {
  id: string
  html: HTMLString
}

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
  const catalog: NonNullable<CambridgeSearchResult['catalog']> = []
  const audio: { us?: string; uk?: string } = {}

  doc.querySelectorAll('.entry-body__el').forEach(($entry, i) => {
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

        const src = getFullLink(HOST, $source, 'src')

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

    // replace amp-img
    $entry.querySelectorAll('amp-img').forEach($ampImg => {
      const $img = doc.createElement('img')

      $img.setAttribute('src', getFullLink(HOST, $ampImg, 'src'))

      const attrs = ['width', 'height', 'title']
      for (const attr of attrs) {
        const val = $ampImg.getAttribute(attr)
        if (val) {
          $img.setAttribute(attr, val)
        }
      }

      $ampImg.replaceWith($img)
    })

    // See more results
    $entry.querySelectorAll<HTMLAnchorElement>('a.had').forEach(externalLink)

    const entryId = `d-cambridge-entry${i}`

    result.push({
      id: entryId,
      html: getInnerHTML(HOST, $entry)
    })

    catalog.push({
      key: `#${i}`,
      value: entryId,
      label:
        '#' + getText($entry, '.di-title') + ' ' + getText($entry, '.posgram')
    })
  })

  if (result.length <= 0) {
    // check idiom
    const $idiom = doc.querySelector('.idiom-block')
    if ($idiom) {
      removeChild($idiom, '.bb.hax')

      // expand button
      $idiom.querySelectorAll('.daccord_h').forEach($btn => {
        $btn.parentElement!.classList.add('amp-accordion')
      })

      // See more results
      $idiom.querySelectorAll<HTMLAnchorElement>('a.had').forEach(externalLink)

      result.push({
        id: '`d-cambridge-entry-idiom',
        html: getInnerHTML(HOST, $idiom)
      })
    }
  }

  if (result.length > 0) {
    return { result, audio, catalog }
  }

  return handleNoResult()
}
