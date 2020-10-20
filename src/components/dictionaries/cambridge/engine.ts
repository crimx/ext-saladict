import { fetchDirtyDOM } from '@/_helpers/fetch-dom'
import { getStaticSpeaker } from '@/components/Speaker'
import { DictConfigs } from '@/app-config'
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

export const getSrcPage: GetSrcPageFunction = async (text, config, profile) => {
  let { lang } = profile.dicts.all.cambridge.options

  if (lang === 'default') {
    switch (config.langCode) {
      case 'zh-CN':
        lang = 'en-chs'
        break
      case 'zh-TW':
        lang = 'en-chz'
        break
      default:
        lang = 'en'
        break
    }
  }

  switch (lang) {
    case 'en':
      return (
        'https://dictionary.cambridge.org/search/direct/?datasetsearch=english&q=' +
        encodeURIComponent(
          text
            .trim()
            .split(/\s+/)
            .join('-')
        )
      )
    case 'en-chs':
      return (
        'https://dictionary.cambridge.org/zhs/%E6%90%9C%E7%B4%A2/direct/?datasetsearch=english-chinese-simplified&q=' +
        encodeURIComponent(text)
      )
    case 'en-chz': {
      const chsToChz = await getChsToChz()
      return (
        'https://dictionary.cambridge.org/zht/%E6%90%9C%E7%B4%A2/direct/?datasetsearch=english-chinese-traditional&q=' +
        encodeURIComponent(chsToChz(text))
      )
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

export const search: SearchFunction<CambridgeResult> = async (
  text,
  config,
  profile,
  payload
) => {
  return fetchDirtyDOM(await getSrcPage(text, config, profile))
    .catch(handleNetWorkError)
    .then(doc => handleDOM(doc, profile.dicts.all.cambridge.options))
}

function handleDOM(
  doc: Document,
  options: DictConfigs['cambridge']['options']
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

    sanitizeEntry($entry)

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

      sanitizeEntry($idiom)

      result.push({
        id: 'd-cambridge-entry-idiom',
        html: getInnerHTML(HOST, $idiom)
      })
    }
  }

  if (result.length <= 0 && options.related) {
    const $link = doc.querySelector('link[rel=canonical]')
    if (
      $link &&
      /dictionary\.cambridge\.org\/([^/]+\/)?spellcheck\//.test(
        $link.getAttribute('href') || ''
      )
    ) {
      const $related = doc.querySelector('.hfl-s.lt2b.lmt-10.lmb-25.lp-s_r-20')
      if ($related) {
        result.push({
          id: 'd-cambridge-entry-related',
          html: getInnerHTML(HOST, $related)
        })
      }
    }
  }

  if (result.length > 0) {
    return { result, audio, catalog }
  }

  return handleNoResult()
}

function sanitizeEntry<E extends Element>($entry: E): E {
  // expand button
  $entry.querySelectorAll('.daccord_h').forEach($btn => {
    $btn.parentElement!.classList.add('amp-accordion')
  })

  // replace amp-img
  $entry.querySelectorAll('amp-img').forEach($ampImg => {
    const $img = document.createElement('img')

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

  // replace amp-audio
  $entry.querySelectorAll('amp-audio').forEach($ampAudio => {
    const $source = $ampAudio.querySelector('source')
    if ($source) {
      const src = getFullLink(HOST, $source, 'src')
      if (src) {
        $ampAudio.replaceWith(getStaticSpeaker(src))
        return
      }
    }
    $ampAudio.remove()
  })

  // See more results
  $entry.querySelectorAll<HTMLAnchorElement>('a.had').forEach(externalLink)

  return $entry
}
