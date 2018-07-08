import { HTMLString, handleNoResult, getInnerHTMLThunk, removeChild, decodeHEX } from '../helpers'
import { AppConfig } from '@/app-config'
import { DictSearchResult } from '@/typings/server'

export interface GoogleDictResult {
  entry: HTMLString
}

type GoogleDictSearchResult = DictSearchResult<GoogleDictResult>

const getInnerHTML = getInnerHTMLThunk('https://www.google.com/')

export default function search (
  text: string,
  config: AppConfig
): Promise<GoogleDictSearchResult> {
  const isen = config.dicts.all.googledict.options.enresult ? 'hl=en&gl=en&' : ''
  return fetch(`https://www.google.com/search?${isen}q=define+` + text.replace(/\s+/g, '+'))
    .then(r => r.text())
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

    $obcontainer.querySelectorAll('g-img').forEach($gimg => {
      const $img = $gimg.querySelector('img')
      const $parent = $gimg.parentElement
      if (!$parent || !$img) { return }

      $parent.replaceChild($img, $gimg)
      const id = $img.id
      if (!id) { return }

      const src = (bodyText.match(new RegExp(`_image_src='([^']+)'[^']+?'${id}'`)) || ['',''])[1]
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
