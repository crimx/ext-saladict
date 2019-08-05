import {
  HTMLString,
  handleNoResult,
  getInnerHTML,
  removeChild,
  decodeHEX,
  removeChildren,
  handleNetWorkError,
  SearchFunction,
  GetSrcPageFunction,
  DictSearchResult,
  getFullLink
} from '../helpers'
import axios from 'axios'
import { getStaticSpeaker } from '@/components/Speaker'
import { fetchPlainText } from '@/_helpers/fetch-dom'

export const getSrcPage: GetSrcPageFunction = text => {
  return `https://www.google.com.hk/search?q=define+${text}`
}

export interface GoogleDictResult {
  entry: HTMLString
}

type GoogleDictSearchResult = DictSearchResult<GoogleDictResult>

export const search: SearchFunction<GoogleDictResult> = async (
  text,
  config,
  profile,
  payload
) => {
  const isen = profile.dicts.all.googledict.options.enresult
    ? 'hl=en&gl=en&'
    : ''
  const bodyText = await fetchPlainText(
    `https://www.google.com/search?${isen}q=define+` +
      encodeURIComponent(text.replace(/\s+/g, '+'))
  ).catch(handleNetWorkError)

  return handleDOM(bodyText)
}

function handleDOM(
  bodyText: string
): GoogleDictSearchResult | Promise<GoogleDictSearchResult> {
  const doc = new DOMParser().parseFromString(bodyText, 'text/html')

  const $obcontainer = doc.querySelector('.obcontainer')
  if ($obcontainer) {
    $obcontainer.querySelectorAll<HTMLDivElement>('.vkc_np').forEach($block => {
      if (
        $block.querySelector('.zbA8Me') || // Dictionary title
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
      if (!$parent || !$img) {
        return
      }

      $parent.replaceChild($img, $gimg)
      const id = $img.id
      if (!id) {
        return
      }

      const src = (bodyText.match(
        new RegExp(`'(data:image[^']+)';[^']+?'${id}'`)
      ) || ['', ''])[1]
      if (!src) {
        return
      }

      $img.setAttribute('src', decodeHEX(src))
    })

    $obcontainer.querySelectorAll('.lr_dct_spkr').forEach($speaker => {
      const $audio = $speaker.querySelector('audio')
      if ($audio) {
        const src = getFullLink('https://www.google.com', $audio, 'src')
        $speaker.replaceWith(getStaticSpeaker(src))
      }
    })

    removeChild($obcontainer, '.jFHKNd')

    const cleanText = getInnerHTML('https://www.google.com', $obcontainer, {
      config: {}
    })
      .replace(/synonyms:/g, 'syn:')
      .replace(/antonyms:/g, 'ant:')

    return { result: { entry: cleanText } }
  }

  return handleNoResult<GoogleDictSearchResult>()
}
