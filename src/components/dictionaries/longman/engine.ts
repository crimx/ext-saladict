import { fetchDirtyDOM } from '@/_helpers/fetch-dom'
import { HTMLString, getText, getInnerHTMLThunk, handleNoResult, handleNetWorkError, SearchFunction } from '../helpers'
import { DictConfigs } from '@/app-config'
import { DictSearchResult } from '@/typings/server'

const getInnerHTML = getInnerHTMLThunk('https://www.ldoceonline.com/')

export interface LongmanResultEntry {
  title: {
    HWD: string
    HYPHENATION: string
    HOMNUM: string
  }
  senses: HTMLString[]
  prons: Array<{
    lang: string
    pron: string
  }>
  topic?: {
    title: string
    href: string
  }
  phsym?: string
  level?: {
    rate: number,
    title: string
  }
  freq?: Array<{
    title: string
    rank: string
  }>
  pos?: string
  collocations?: HTMLString
  grammar?: HTMLString
  thesaurus?: HTMLString
  examples?: HTMLString[]
}

export interface LongmanResultLex {
  type: 'lex'
  bussinessFirst: boolean
  contemporary: LongmanResultEntry[]
  bussiness: LongmanResultEntry[]
  wordfams?: HTMLString
}

export interface LongmanResultRelated {
  type: 'related'
  list: HTMLString
}

export type LongmanResult = LongmanResultLex | LongmanResultRelated

type LongmanSearchResult = DictSearchResult<LongmanResult>
type LongmanSearchResultLex = DictSearchResult<LongmanResultLex>
type LongmanSearchResultRelated = DictSearchResult<LongmanResultRelated>

export const search: SearchFunction<LongmanSearchResult> = (
  text, config, payload
) => {
  const options = config.dicts.all.longman.options
  return fetchDirtyDOM('http://www.ldoceonline.com/dictionary/' + text.toLocaleLowerCase().replace(/[^A-Za-z0-9]+/g, '-'))
    .catch(handleNetWorkError)
    .then(doc => handleDOM(doc, options))
}

function handleDOM (
  doc: Document,
  options: DictConfigs['longman']['options'],
): LongmanSearchResult | Promise<LongmanSearchResult> {
  if (doc.querySelector('.dictentry')) {
    return handleDOMLex(doc, options)
  } else if (options.related) {
    return handleDOMRelated(doc)
  }
  return handleNoResult()
}

function handleDOMLex (
  doc: Document,
  options: DictConfigs['longman']['options'],
): LongmanSearchResultLex | Promise<LongmanSearchResultLex> {
  const result: LongmanResultLex = {
    type: 'lex',
    bussinessFirst: options.bussinessFirst,
    contemporary: [],
    bussiness: [],
  }

  const audio: { uk?: string, us?: string } = {}

  doc.querySelectorAll<HTMLSpanElement>('.speaker.exafile').forEach(
    $speaker => {
      const mp3 = $speaker.dataset.srcMp3
      if (mp3) {
        $speaker.outerHTML =
          `<button data-src-mp3="${mp3}" title="${$speaker.title}" class="dictLongman-Speaker">
            <svg width="1.2em" height="1.2em" viewBox="0 0 58 58" xmlns="http://www.w3.org/2000/svg">
              <path d="M14.35 20.237H5.77c-1.2 0-2.17.97-2.17 2.17v13.188c0 1.196.97 2.168 2.17 2.168h8.58c.387 0 .766.103 1.1.3l13.748 12.8c1.445.85 3.268-.192 3.268-1.87V9.006c0-1.677-1.823-2.72-3.268-1.87l-13.747 12.8c-.334.196-.713.3-1.1.3z"/>
              <path d="M36.772 39.98c-.31 0-.62-.118-.856-.355-.476-.475-.476-1.243 0-1.716 5.212-5.216 5.212-13.702 0-18.916-.476-.473-.476-1.24 0-1.716.473-.474 1.24-.474 1.715 0 6.162 6.16 6.162 16.185 0 22.347-.234.237-.546.356-.858.356z"/>
              <path d="M41.07 44.886c-.312 0-.62-.118-.86-.356-.473-.475-.473-1.24 0-1.715 7.573-7.57 7.573-19.89 0-27.462-.473-.474-.473-1.24 0-1.716.478-.473 1.243-.473 1.717 0 8.517 8.52 8.517 22.377 0 30.893-.238.238-.547.356-.857.356z"/>
              <path d="M44.632 50.903c-.312 0-.622-.118-.858-.356-.475-.474-.475-1.24 0-1.716 5.287-5.283 8.198-12.307 8.198-19.77 0-7.466-2.91-14.49-8.198-19.775-.475-.474-.475-1.24 0-1.715.475-.474 1.24-.474 1.717 0 5.745 5.744 8.91 13.375 8.91 21.49 0 8.112-3.165 15.744-8.91 21.487-.237.238-.547.356-.858.356z"/>
            </svg>
          </button>`
      }
    }
  )

  if (options.wordfams) {
    result.wordfams = getInnerHTML(doc, '.wordfams')
  }

  const $dictentries = doc.querySelectorAll('.dictentry')
  let currentDict: 'contemporary' | 'bussiness' | '' = ''
  for (let i = 0; i < $dictentries.length; i++) {
    const $entry = $dictentries[i]
    const $intro = $entry.querySelector('.dictionary_intro')
    if ($intro) {
      const dict = $intro.textContent || ''
      if (dict.includes('Contemporary')) {
        currentDict = 'contemporary'
      } else if (dict.includes('Business')) {
        currentDict = 'bussiness'
      } else {
        currentDict = ''
      }
    }

    if (!currentDict) { continue }

    const entry: LongmanResultEntry = {
      title: {
        HWD: '',
        HYPHENATION: '',
        HOMNUM: '',
      },
      prons: [],
      senses: [],
    }

    const $topic = $entry.querySelector<HTMLAnchorElement>('a.topic')
    if ($topic) {
      entry.topic = {
        title: $topic.textContent || '',
        href: ($topic.getAttribute('href') || '').replace(/^\//, 'https://www.ldoceonline.com/'),
      }
    }

    const $head = $entry.querySelector('.Head')
    if (!$head) { continue }

    entry.title.HWD = getText($head, '.HWD')
    entry.title.HYPHENATION = getText($head, '.HYPHENATION')
    entry.title.HOMNUM = getText($head, '.HOMNUM')

    entry.phsym = getText($head, '.PronCodes')

    const $level = $head.querySelector('.LEVEL') as HTMLSpanElement
    if ($level) {
      const level = {
        rate: 0,
        title: ''
      }

      level.rate = (($level.textContent || '').match(/●/g) || []).length
      level.title = $level.title

      entry.level = level
    }

    entry.freq = Array.from($head.querySelectorAll<HTMLSpanElement>('.FREQ'))
      .map($el => ({
        title: $el.title,
        rank: $el.textContent || ''
      }))

    entry.pos = getText($head, '.POS')

    $head.querySelectorAll<HTMLSpanElement>('.speaker').forEach($pron => {
      let lang = 'us'
      const title = $pron.title
      if (title.includes('British')) {
        lang = 'uk'
      }
      const pron = $pron.getAttribute('data-src-mp3') || ''

      audio[lang] = pron
      entry.prons.push({ lang, pron })
    })

    entry.senses = Array.from($entry.querySelectorAll('.Sense'))
      .map($sen => getInnerHTML($sen))

    if (options.collocations) {
      entry.collocations = getInnerHTML($entry, '.ColloBox')
    }

    if (options.grammar) {
      entry.grammar = getInnerHTML($entry, '.GramBox')
    }

    if (options.thesaurus) {
      entry.thesaurus = getInnerHTML($entry, '.ThesBox')
    }

    if (options.examples) {
      entry.examples = Array.from($entry.querySelectorAll('.exaGroup'))
        .map($exa => getInnerHTML($exa))
    }

    result[currentDict].push(entry)
  }

  if (result.contemporary.length <= 0 && result.bussiness.length <= 0) {
    return handleNoResult()
  }

  return { result, audio }
}

function handleDOMRelated (
  doc: Document,
): LongmanSearchResultRelated | Promise<LongmanSearchResultRelated> {
  const $didyoumean = doc.querySelector('.didyoumean')
  if ($didyoumean) {
    return {
      result: {
        type: 'related',
        list: getInnerHTML($didyoumean)
      }
    }
  }
  return handleNoResult()
}
