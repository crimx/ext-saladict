import {
  HTMLString,
  handleNoResult,
  getInnerHTML,
  removeChildren,
  handleNetWorkError,
  SearchFunction,
  GetSrcPageFunction,
  DictSearchResult,
  getFullLink,
  getText,
  removeChild
} from '../helpers'
import { getStaticSpeaker } from '@/components/Speaker'
import { fetchPlainText } from '@/_helpers/fetch-dom'

export const getSrcPage: GetSrcPageFunction = text => {
  return (
    'https://www.google.com.hk/search?hl=en&safe=off&q=meaning:' +
    encodeURIComponent(text.toLowerCase().replace(/\s+/g, '+'))
  )
}

export interface GoogleDictResult {
  entry: HTMLString
  styles: string[]
}

type GoogleDictSearchResult = DictSearchResult<GoogleDictResult>

export const search: SearchFunction<GoogleDictResult> = async (
  text,
  config,
  profile,
  payload
) => {
  const encodedText = encodeURIComponent(
    text.toLowerCase().replace(/\s+/g, '+')
  )

  try {
    return await fetchPlainText(
      `https://www.google.com/search?hl=en&safe=off&q=meaning:${encodedText}`
    )
      .catch(handleNetWorkError)
      .then(handleDOM)
  } catch (e) {
    return await fetchPlainText(
      `https://www.google.com/search?hl=en&safe=off&q=define:${encodedText}`
    )
      .catch(handleNetWorkError)
      .then(handleDOM)
  }

  function handleDOM(
    bodyText: string
  ): GoogleDictSearchResult | Promise<GoogleDictSearchResult> {
    const doc = new DOMParser().parseFromString(bodyText, 'text/html')

    // mend fragments
    extFragements(bodyText).forEach(({ id, innerHTML }) => {
      try {
        const el = doc.querySelector(`#${id}`)
        if (el) {
          el.innerHTML = innerHTML
        }
      } catch (e) {
        // ignore
      }
    })

    const $obcontainer = doc.querySelector('.lr_container')
    if ($obcontainer) {
      $obcontainer
        .querySelectorAll<HTMLDivElement>('.vkc_np')
        .forEach($block => {
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
      removeChild($obcontainer, '[jsname=L4Nn5e]') // remove translate to

      // tts
      $obcontainer.querySelectorAll('audio').forEach($audio => {
        const $source = $audio.querySelector('source')

        let src =
          $source && getFullLink('https://ssl.gstatic.com', $source, 'src')

        if (!src) {
          src =
            'https://www.google.com/speech-api/v1/synthesize?enc=mpeg&lang=zh-cn&speed=0.4&client=lr-language-tts&use_google_only_voices=1&text=' +
            encodeURIComponent(text)
        }

        const $audioButton = $audio.closest('.TzAKVc, .brWULd')
        if ($audioButton) {
          $audioButton.replaceWith(getStaticSpeaker(src))
        } else {
          $audio.replaceWith(getStaticSpeaker(src))
        }
      })

      $obcontainer
        .querySelectorAll('[role=listitem] > [jsname=F457ec]')
        .forEach($word => {
          // let saladict jump into the words
          const $a = document.createElement('a')
          $a.textContent = getText($word)
          Array.from($word.childNodes).forEach($child => {
            $child.remove()
          })
          $word.appendChild($a)
          // always appeared available
          $word.removeAttribute('style')
          $word.classList.add('MR2UAc')
          $word.classList.add('I6a0ee')
          $word.classList.remove('cO53qb')
        })

      $obcontainer.querySelectorAll('g-img > img').forEach($img => {
        const src = $img.getAttribute('title')
        if (src) {
          $img.setAttribute('src', src)
        }
      })

      extractImg(bodyText).forEach(({ id, src }) => {
        try {
          const el = $obcontainer.querySelector(
            `#${id}, img[data-iid="${id}"]`
          )
          if (el) {
            el.setAttribute('src', src)
            el.setAttribute('data-deferred', '2')
          }
        } catch (e) {
          // ignore
        }
      })

      const cleanText = getInnerHTML('https://www.google.com', $obcontainer, {
        config: {
          ADD_TAGS: ['g-img'],
          ADD_ATTR: ['jsname', 'jsaction']
        }
      })
        .replace(/synonyms:/g, 'syn:')
        .replace(/antonyms:/g, 'ant:')

      const styles: string[] = []
      doc.querySelectorAll('style').forEach($style => {
        const textContent = getText($style)
        if (textContent && /\.xpdxpnd|\.lr_container/.test(textContent)) {
          styles.push(textContent)
        }
      })

      return { result: { entry: cleanText, styles } }
    }

    return handleNoResult<GoogleDictSearchResult>()
  }
}

function extFragements(text: string): Array<{ id: string; innerHTML: string }> {
  const result = new Map<string, string>()
  const matchers = [
    /\(function\(\)\{window\.jsl\.dh\('([^']+)','((?:\\.|[^'\\])*)'\);\}\)\(\);/g,
    /\{id:'([^']+)'\},function\(\)\{jsl\.dh\(this\.id,"((?:\\.|[^"\\])*)"\);\}/g,
    /\{id:'[^']+'\},function\(\)\{window\.jsl\.dh\("([^"]+)","((?:\\.|[^"\\])*)"\);\}/g
  ]

  for (const matcher of matchers) {
    let match: RegExpExecArray | null | undefined
    while ((match = matcher.exec(text))) {
      result.set(match[1], decodeJSString(match[2]))
    }
  }

  return Array.from(result, ([id, innerHTML]) => ({ id, innerHTML }))
}

function extractImg(text: string): Array<{ id: string; src: string }> {
  const result = new Map<string, string>()

  const kvPairMatch = /google\.ldi=({[^}]+})/.exec(text)
  if (kvPairMatch) {
    try {
      const json = JSON.parse(kvPairMatch[1]) as Record<string, string>
      Object.keys(json).forEach(key => {
        result.set(key, normalizeImgSrc(json[key]))
      })
    } catch (e) {
      // ignore
    }
  }

  const setImageMatcher =
    /\(function\(\)\{var s='((?:\\.|[^'\\])*)';var ii=\[([^\]]*)\];_setImagesSrc\(ii,s\);\}\)\(\);/g
  let setImageMatch: RegExpExecArray | null | undefined
  while ((setImageMatch = setImageMatcher.exec(text))) {
    const src = normalizeImgSrc(decodeJSString(setImageMatch[1]))
    const ids = setImageMatch[2]
    let idMatch: RegExpExecArray | null | undefined
    const idMatcher = /['"]([^'"]+)['"]/g
    while ((idMatch = idMatcher.exec(ids))) {
      result.set(idMatch[1], src)
    }
  }

  return Array.from(result, ([id, src]) => ({ id, src }))
}

function decodeHex(m: string, code: string): string {
  return String.fromCharCode(parseInt(code, 16))
}

function decodeJSString(text: string): string {
  return text
    // escape \x
    .replace(/\\x([\da-f]{2})/gi, decodeHex)
    // escape \u
    .replace(/\\u([\da-f]{4})/gi, decodeHex)
    .replace(/\\([\\/"'])/g, '$1')
    .replace(/\\n/g, '\n')
    .replace(/\\r/g, '\r')
    .replace(/\\t/g, '\t')
}

function normalizeImgSrc(src: string): string {
  return src.startsWith('//') ? `https:${src}` : src
}
