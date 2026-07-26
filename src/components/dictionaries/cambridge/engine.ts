import axios from 'axios'
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
  handleManualVerification,
  SearchFunction,
  GetSrcPageFunction,
  DictSearchResult,
  getFullLink,
  externalLink,
  getChsToChz
} from '../helpers'

export const getSrcPage: GetSrcPageFunction = async (text, config, profile) => {
  let { lang } = profile.dicts.all.cambridge.options
  const wordPath = encodeWordPath(text)

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
      return `https://dictionary.cambridge.org/dictionary/english/${wordPath}`
    case 'en-chs':
      return `https://dictionary.cambridge.org/dictionary/english-chinese-simplified/${wordPath}`
    case 'en-chz': {
      const chsToChz = await getChsToChz()
      return `https://dictionary.cambridge.org/dictionary/english-chinese-traditional/${encodeWordPath(
        chsToChz(text)
      )}`
    }
  }
}

function encodeWordPath(text: string): string {
  return encodeURIComponent(
    text
      .trim()
      .split(/\s+/)
      .join('-')
  )
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
  const srcPage = await getSrcPage(text, config, profile)

  try {
    const doc = await fetchDirtyDOM(srcPage, { withCredentials: true })
    return handleDOM(doc, profile.dicts.all.cambridge.options)
  } catch (e) {
    if (isForbidden(e)) {
      return handleManualVerification({ text, url: srcPage })
    }
    return handleNetWorkError(e)
  }
}

function isForbidden(e: any): boolean {
  return e && e.response && e.response.status === 403
}

async function handleDOM(
  doc: Document,
  options: DictConfigs['cambridge']['options']
): Promise<CambridgeSearchResult> {
  const entries: Array<{
    id: string
    element: Element
  }> = []
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

    entries.push({
      id: entryId,
      element: $entry
    })

    catalog.push({
      key: `#${i}`,
      value: entryId,
      label:
        '#' + getText($entry, '.di-title') + ' ' + getText($entry, '.posgram')
    })
  })

  if (entries.length <= 0) {
    // check idiom
    const $idiom = doc.querySelector('.idiom-block')
    if ($idiom) {
      removeChild($idiom, '.bb.hax')

      sanitizeEntry($idiom)

      entries.push({
        id: 'd-cambridge-entry-idiom',
        element: $idiom
      })
    }
  }

  if (entries.length <= 0 && options.related) {
    const $link = doc.querySelector('link[rel=canonical]')
    if (
      $link &&
      /dictionary\.cambridge\.org\/([^/]+\/)?spellcheck\//.test(
        $link.getAttribute('href') || ''
      )
    ) {
      const $related = doc.querySelector('.hfl-s.lt2b.lmt-10.lmb-25.lp-s_r-20')
      if ($related) {
        entries.push({
          id: 'd-cambridge-entry-related',
          element: $related
        })
      }
    }
  }

  if (entries.length > 0) {
    await inlineEntryImages(entries.map(entry => entry.element))
    const result = entries.map(entry => ({
      id: entry.id,
      html: getInnerHTML(HOST, entry.element)
    }))

    return { result, audio, catalog }
  }

  return handleNoResult()
}

export async function inlineEntryImages(entries: Element[]): Promise<void> {
  const imagesByUrl = new Map<string, HTMLImageElement[]>()

  entries.forEach(entry => {
    entry.querySelectorAll<HTMLImageElement>('.dimg img[src]').forEach($img => {
      const url = getFullLink(HOST, $img, 'src')
      if (!url) return

      const images = imagesByUrl.get(url) || []
      images.push($img)
      imagesByUrl.set(url, images)
    })
  })

  await Promise.all(
    Array.from(imagesByUrl).map(async ([url, images]) => {
      try {
        const dataUrl = await downloadImage(url)
        images.forEach($img => {
          $img.setAttribute('src', dataUrl)
          $img.removeAttribute('srcset')
        })
      } catch (error) {
        images.forEach(removeImageBlock)
      }
    })
  )
}

async function downloadImage(url: string): Promise<string> {
  const response = await axios.get<ArrayBuffer>(url, {
    headers: {
      Accept: 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8'
    },
    responseType: 'arraybuffer',
    timeout: 5000,
    withCredentials: true
  })
  const contentType = response.headers['content-type'] || ''
  const mimeType = contentType
    .split(';')[0]
    .trim()
    .toLowerCase()

  if (!mimeType.startsWith('image/')) {
    throw new Error(`Unexpected Cambridge image content type: ${contentType}`)
  }

  return `data:${mimeType};base64,${arrayBufferToBase64(response.data)}`
}

function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer)
  let binary = ''

  for (let offset = 0; offset < bytes.length; offset += 0x8000) {
    const end = Math.min(offset + 0x8000, bytes.length)
    let chunk = ''
    for (let i = offset; i < end; i++) {
      chunk += String.fromCharCode(bytes[i])
    }
    binary += chunk
  }

  return btoa(binary)
}

function removeImageBlock($img: HTMLImageElement): void {
  let parent = $img.parentElement
  while (parent && !parent.classList.contains('dimg')) {
    parent = parent.parentElement
  }

  if (parent) {
    parent.remove()
  } else {
    $img.remove()
  }
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
