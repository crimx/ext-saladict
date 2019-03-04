import {
  HTMLString,
  handleNoResult,
  getInnerHTMLBuilder,
  removeChild,
  decodeHEX,
  removeChildren,
  handleNetWorkError,
  SearchFunction,
  GetSrcPageFunction,
} from '../helpers'
import { DictSearchResult } from '@/typings/server'

export const getSrcPage: GetSrcPageFunction = (text) => {
  return `https://www.google.com.hk/search?q=define+${text}`
}

export interface GoogleDictResult {
  entry: HTMLString
}

type GoogleDictSearchResult = DictSearchResult<GoogleDictResult>

const getInnerHTML = getInnerHTMLBuilder('https://www.google.com/', {})

export const search: SearchFunction<GoogleDictSearchResult> = (
  text, config, profile, payload
) => {
  const isen = profile.dicts.all.googledict.options.enresult ? 'hl=en&gl=en&' : ''
  return fetch(
    `https://www.google.com/search?${isen}q=define+` + encodeURIComponent(text.replace(/\s+/g, '+')),
    { credentials: 'omit' }
  )
    .then(r => r.ok ? r.text() : handleNetWorkError())
    .then(handleDOM)
}

function handleDOM (
  bodyText: string,
): GoogleDictSearchResult | Promise<GoogleDictSearchResult> {
  const doc = new DOMParser().parseFromString(bodyText, 'text/html')

  const $obcontainer = doc.querySelector('.obcontainer')
  if ($obcontainer) {
    $obcontainer.querySelectorAll<HTMLDivElement>('.vkc_np').forEach($block => {
      if ($block.querySelector('.zbA8Me') || // Dictionary title
          $block.querySelector('#dw-siw') || // Search box
          $block.querySelector('#tl_select') // Translate to
      ) {
        $block.remove()
      }
    })

    removeChildren($obcontainer, '.lr_dct_trns_h') // other Translate to blocks

    $obcontainer.querySelectorAll('g-img').forEach($gimg => {
      const $img = $gimg.querySelector('img')
      const $parent = $gimg.parentElement
      if (!$parent || !$img) { return }

      $parent.replaceChild($img, $gimg)
      const id = $img.id
      if (!id) { return }

      const src = (bodyText.match(new RegExp(`'(data:image[^']+)';[^']+?'${id}'`)) || ['',''])[1]
      if (!src) { return }

      $img.setAttribute('src', decodeHEX(src))
    })

    $obcontainer.querySelectorAll('.lr_dct_spkr').forEach($speaker => {
      const $audio = $speaker.querySelector('audio')
      if ($audio) {
        const src = ($audio.getAttribute('src') || '').replace(/^\/\//, 'https://')
        $speaker.outerHTML = `<button data-src-mp3="${src}" class="dictGoogleDict-Speaker">🔊</button>`
      }
    })

    removeChild($obcontainer, '.jFHKNd')

    const cleanText = getInnerHTML($obcontainer)
      .replace(/synonyms:/g, 'syn:')
      .replace(/antonyms:/g, 'ant:')

    return { result: { entry: cleanText } }
  }

  return handleNoResult<GoogleDictSearchResult>()
}
