import { fetchDirtyDOM } from '@/_helpers/fetch-dom'
import {
  HTMLString,
  getText,
  getInnerHTML,
  handleNoResult,
  handleNetWorkError,
  SearchFunction,
  GetSrcPageFunction,
  DictSearchResult
} from '../helpers'

export const getSrcPage: GetSrcPageFunction = text => {
  return `https://www.merriam-webster.com/dictionary/${text}`
}

const HOST = 'https://www.merriam-webster.com'

interface MerriamWebsterResultItem {
  /** keyword */
  title?: string
  pos?: string
  syllables?: string
  pr?: string
  /** pronunciation */
  pron?: string
  meaning?: HTMLString
  definition?: HTMLString
  headword?: HTMLString
}

export type MerriamWebsterResult = MerriamWebsterResultItem[]

type MerriamWebsterSearchResult = DictSearchResult<MerriamWebsterResult>

export const search: SearchFunction<MerriamWebsterResult> = (
  text,
  config,
  profile,
  payload
) => {
  const options = profile.dicts.all.merriamwebster.options

  return fetchDirtyDOM(
    'https://www.merriam-webster.com/dictionary/' +
      encodeURIComponent(text.replace(/\s+/g, ' '))
  )
    .catch(handleNetWorkError)
    .then(doc => handleDOM(doc, options))
}

/**
 * get link of pronunciation from href attribute
 */
function getPronLink(href: string | null): string {
  if (!href) {
    return ''
  }
  const params = href.split('?')[1].split('&')
  let lang
  let dir
  let file
  params.map(url => {
    if (url.includes('lang')) {
      lang = url.substr(5)
      const langs = lang.split('_')

      // eg: en_us
      if (langs.length > 1) {
        lang = langs.join('/')
      }
    }
    if (url.includes('dir')) {
      dir = url.substr(4)
    }
    if (url.includes('file')) {
      file = `${url.substr(5)}.mp3`
    }
  })
  return lang && dir && file
    ? `https://media.merriam-webster.com/audio/prons/${lang}/mp3/${dir}/${file}`
    : ''
}

function handleDOM(
  doc: Document,
  { resultnum }: { resultnum: number }
): MerriamWebsterSearchResult | Promise<MerriamWebsterSearchResult> {
  const result: MerriamWebsterResult = []

  const $content = doc.querySelector('#left-content') as HTMLElement

  if (!$content || !$content.querySelector('div[id^=dictionary-entry]')) {
    return handleNoResult()
  }

  const children: Element[] = Array.from($content.children)

  let resultItem

  for (let i = 0; i < children.length && result.length < resultnum; i++) {
    const $el = children[i]
    if ($el.className.includes('anchor-name')) {
      resultItem && result.push(resultItem)
      resultItem = {}
    }

    if ($el.className.includes('entry-header')) {
      resultItem.title = getText($el, '.hword')
      resultItem.pos = getText($el, '.important-blue-link')
    }

    if ($el.className.includes('entry-attr')) {
      resultItem.syllables = getText($el, '.word-syllables')
      resultItem.pr = getText($el, '.pr')

      const $pron = $el.querySelector('.play-pron') as HTMLElement
      resultItem.pron = $pron ? getPronLink($pron.getAttribute('href')) : ''
    }

    if ($el.className.includes('headword-row')) {
      resultItem.headword = getInnerHTML(HOST, $el).replace(
        /<\/?a.+[^>]*>/g,
        ''
      )

      if (!resultItem.pron) {
        const $pron = $el.querySelector('.play-pron') as HTMLElement
        resultItem.pron = $pron ? getPronLink($pron.getAttribute('href')) : ''
      }
    }

    if ($el.className.includes('learners-essential-meaning')) {
      resultItem.meaning = getInnerHTML(HOST, $el).replace(/<a.+<\/a>/g, '')
    }

    if ($el.id.includes('dictionary-entry')) {
      // ignore img tag
      resultItem.definition = getInnerHTML(HOST, $el).replace(
        /<\/?img.+[^>]*>/g,
        ''
      )
    }

    // the main content is before the anchor list
    if ($el.className.includes('wgt-incentive-anchors')) {
      result.push(resultItem)
      break
    }
  }

  if (result.length > 0) {
    return { result }
  } else {
    return handleNoResult()
  }
}
