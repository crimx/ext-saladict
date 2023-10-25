import { fetchDirtyDOM, fetchDirtyDOMViaFetch } from '@/_helpers/fetch-dom'
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
  pos?: string // part of speech
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

export interface Meaning {
  explaining?: string
  examples?: string[]
}

export type MeaningGroup = Meaning[]

export interface Section {
  // could be transitive or intranstive if pos was verb
  title?: string
  meaningGroups: MeaningGroup[]
}

export interface Phonetic {
  symbol?: string
  audio?: string
}

export interface Pronunciation {
  syllable?: string
  phonetics: Phonetic[]
}

export interface Group {
  title?: string
  pos?: string
  pr?: Pronunciation
  conjugation?: string
  sections: Section[]
  forms?: string[]
}

export interface MerriamWebsterResultV2 {
  groups: Group[]
  synonyms?: string[]
  etymology?: string
}

export const search: SearchFunction<MerriamWebsterResult> = (
  text,
  config,
  profile,
  payload
) => {
  const options = profile.dicts.all.merriamwebster.options

  return fetchDirtyDOMViaFetch(
    'https://www.merriam-webster.com/dictionary/' +
      // eslint-disable-next-line prettier/prettier
    encodeURIComponent(text.replace(/\s+/g, ' ')))
    .catch(handleNetWorkError)
    .then(doc => {
      console.log('============doc', doc)
      return handleDOM(doc, options)
    })
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

export function handleDOM(
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

  $content.querySelector('.row .entry-header')

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

export function _getContentEle(doc: Document): Element {
  const content = doc.querySelector('#left-content') as HTMLElement

  if (!content || !content.querySelector('div[id^=dictionary-entry]')) {
    throw new Error('NO_RESULT')
  }
  return content
}

export function _getGroupsEles(content: Element): Element[] {
  return new Array(
    ...content
      .querySelectorAll(
        'div.entry-word-section-container[id^=dictionary-entry]'
      )
      .values()
  )
}

export function _getSynonyms(context: Element): string[] {
  return []
}

export function _getEtymology(context: Element): string {
  return ''
}

export function _getTitle(group: Element): string | undefined {
  return (
    group.querySelector('div.entry-header-content')?.querySelector('.hword')
      ?.textContent || undefined
  )
}

export function _getPartOfSpeech(group: Element): string | undefined {
  return (
    group
      .querySelector('h2.parts-of-speech')
      ?.querySelector('a.important-blue-link')?.textContent || undefined
  )
}

export function _getPrEle(group: Element): Element | undefined {
  return (
    group.querySelector('div.word-syllables-prons-header-content') || undefined
  )
}

export function _getSyllable(pr: Element): string | undefined {
  return pr.querySelector('span.word-syllables-entry')?.textContent || undefined
}

export function _getPhoneticEles(pr: Element): Element[] | undefined {
  const pEles = pr
    .querySelector('span.prons-entries-list-inline')
    ?.querySelectorAll('.prons-entry-list-item')
    ?.values()

  return pEles ? [...pEles] : undefined
}

export function _getPhoneticSymbol(pt: Element): string | undefined {
  if (pt.tagName === 'a') {
    return pt.textContent?.trim() || undefined
  }
  return pt.childNodes.item(0).textContent?.trim() || undefined
}

export function _getPhoneticAudio(pt: Element): string | undefined {
  return pt.getAttribute('data-url') || undefined
}

export function _getConjugation(group: Element): string | undefined {
  const conjEles = group
    .querySelector('.row.headword-row.header-ins')
    ?.querySelectorAll('span.vg-ins')
    ?.values()

  return conjEles
    ? new Array(...conjEles)
        .map(e => e.textContent)
        .join()
        .trim()
    : undefined
}

export function _getSectionsEles(group: Element): Element[] | undefined {
  const sEles = group.querySelectorAll('div.vg').values()
  return sEles ? [...sEles] : undefined
}

export function _getForms(group: Element): string[] {
  return ['']
}

export function _getSectionTitle(section: Element): string | undefined {
  return (
    section.querySelector('p.vd')?.querySelector('a.important-blue-link')
      ?.textContent || undefined
  )
}

export function _getMeaningGroupEles(section: Element): Element[] | undefined {
  const mgEles = section.querySelectorAll('div.vg-sseq-entry-item').values()
  return mgEles ? [...mgEles] : undefined
}

export function _getMeaningEles(mg: Element): Element[] | undefined {
  const meanEles = mg.querySelectorAll('div.sb-entry').values()
  return meanEles ? [...meanEles] : undefined
}

export function _getExpaining(meaning: Element): string | undefined {
  const result = meaning.querySelector('span.dtText')?.textContent
  return result ? result.trim() : undefined
}

export function _getExamples(meaning: Element): string[] | undefined {
  const result = [] as string[]
  const eles = meaning.querySelectorAll('span.ex-sent.sents').values()
  if (!eles) return undefined
  for (const e of eles) {
    if (e.textContent) result.push(e.textContent)
  }
  return result.length > 0 ? result : undefined
}

export function getResult(dom: Document): MerriamWebsterResultV2 {
  const eleContent = _getContentEle(dom)

  const groups: Group[] = []
  const synonyms = _getSynonyms(eleContent)
  const etymology = _getEtymology(eleContent)

  for (const g of _getGroupsEles(eleContent)) {
    const title = _getTitle(g)
    const pos = _getPartOfSpeech(g)
    const conjugations = _getConjugation(g)
    const pr = {} as Pronunciation
    const sections: Section[] = []
    const forms = _getForms(g)

    const prEle = _getPrEle(g)
    if (prEle) {
      pr.syllable = _getSyllable(prEle)
      pr.phonetics = []
      const ptEles = _getPhoneticEles(prEle)
      if (ptEles)
        for (const p of ptEles) {
          if (p) {
            const symbol = _getPhoneticSymbol(p)
            const audio = _getPhoneticAudio(p)
            pr.phonetics.push({ symbol, audio })
          }
        }
    }

    const sEles = _getSectionsEles(g)
    if (sEles)
      for (const s of sEles) {
        const title = _getSectionTitle(s)
        const meaningGroups: MeaningGroup[] = []
        const mgEles = _getMeaningGroupEles(s)

        if (mgEles)
          for (const mg of mgEles) {
            const meanings: Meaning[] = []
            const mEles = _getMeaningEles(mg)

            if (mEles)
              for (const m of mEles) {
                const explaining = _getExpaining(m)
                const examples = _getExamples(m)
                meanings.push({ explaining, examples })
              }

            meaningGroups.push(meanings)
          }

        sections.push({ title, meaningGroups })
      }

    groups.push({ title, pos, pr, conjugation: conjugations, sections, forms })
  }

  return { groups, synonyms, etymology }
}
