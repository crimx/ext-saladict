import {
  HTMLString,
  handleNoResult,
  getInnerHTML,
  removeChild,
  removeChildren,
  handleNetWorkError,
  SearchFunction,
  GetSrcPageFunction,
  DictSearchResult,
  getFullLink
} from '../helpers'
import { getStaticSpeaker } from '@/components/Speaker'
import { fetchPlainText } from '@/_helpers/fetch-dom'

export const getSrcPage: GetSrcPageFunction = text => {
  return `https://www.google.com.hk/search?hl=en&safe=off&q=define:${text}`
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
    `https://www.google.com/search?hl=en&safe=off&${isen}q=define:` +
      encodeURIComponent(text.replace(/\s+/g, '+'))
  ).catch(handleNetWorkError)

  return handleDOM(bodyText)
}

function handleDOM(
  bodyText: string
): GoogleDictSearchResult | Promise<GoogleDictSearchResult> {
  const doc = new DOMParser().parseFromString(bodyText, 'text/html')

  const $obcontainer = doc.querySelector('.lr_container')
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
    removeChildren($obcontainer, '.S5TwIf') // Learn to pronounce
    removeChildren($obcontainer, '.VZVCid') // From Oxford
    removeChildren($obcontainer, '.u7XA4b') // footer

    // tts
    $obcontainer.querySelectorAll('.r3WG9c').forEach($div => {
      const $source = $div.querySelector('audio source')
      if ($source) {
        const src = getFullLink('https://ssl.gstatic.com', $source, 'src')
        if (src) {
          $div.replaceWith(getStaticSpeaker(src))
          return
        }
      }
      $div.remove()
    })

    $obcontainer.querySelectorAll('g-img').forEach($gimg => {
      const $img = $gimg.querySelector('img')
      if ($img && $img.id) {
        const srcMatch = bodyText.match(new RegExp(`"${$img.id}":"([^"]+)"`))
        if (srcMatch) {
          $img.setAttribute('src', decodeURI(srcMatch[1]))
          $gimg.replaceWith($img)
          return
        }
      }
      $gimg.remove()
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
