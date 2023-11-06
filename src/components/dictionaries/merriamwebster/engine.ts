import { fetchDirtyDOM } from '@/_helpers/fetch-dom'
import {
  handleNetWorkError,
  SearchFunction,
  GetSrcPageFunction
} from '../helpers'

export const getSrcPage: GetSrcPageFunction = text => {
  return `https://www.merriam-webster.com/dictionary/${text}`
}

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
  synonyms?: Array<[string, string[]]>
  etymology?: Array<[string, string]>
}

export const search: SearchFunction<MerriamWebsterResultV2> = (
  text,
  config,
  profile,
  payload
) => {
  // const options = profile.dicts.all.merriamwebster.options

  return fetchDirtyDOM(
    'https://www.merriam-webster.com/dictionary/' +
      encodeURIComponent(text.replace(/\s+/g, ' '))
  )
    .catch(handleNetWorkError)
    .then(doc => {
      return { result: getResult(doc) }
      // return handleDOM(doc, options)
    })
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

export function _getSynonyms(
  content: Element
): Array<[string, string[]]> | undefined {
  const synonymsEle = content
    .querySelector('#synonyms')
    ?.querySelector('.content-section-body')

  if (!synonymsEle) return undefined

  const functions = [
    ...synonymsEle?.querySelectorAll('.function-label').values()
  ]
  const lists = [
    ...synonymsEle?.querySelectorAll('ul.synonyms-antonyms-grid-list')?.values()
  ]

  if (!lists) return undefined

  const words = [...lists].map(l =>
    [...l.querySelectorAll('a[lang]').values()].map(v => v.textContent)
  )

  if (functions.length === 0 || words.length === 0) return undefined

  return functions.map((v, i) => [v.textContent, [...words[i]]]) as any
}

export function _getEtymology(
  content: Element
): Array<[string, string]> | undefined {
  const eles = content
    .querySelector('#word-history')
    ?.querySelector('.etymology-content-section')

  if (!eles) return undefined

  const functions = [...eles.querySelectorAll('p.function-label').values()].map(
    v => v.textContent
  )
  const paragraphs = [...eles.querySelectorAll('p.et')].map(v =>
    v.textContent?.trim()
  )
  if (paragraphs.length === 0) return undefined

  return (functions.length > 0
    ? functions.map((v, i) => [v, paragraphs[i]])
    : paragraphs.map(v => ['', v])) as any
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
  const dir = pt.getAttribute('data-dir')
  const fileName = pt.getAttribute('data-file')
  const lang = pt.getAttribute('data-lang')
  return dir && fileName && lang
    ? `https://media.merriam-webster.com/audio/prons/${lang.replace(
        '_',
        '/'
      )}/mp3/${dir}/${fileName}.mp3`
    : undefined
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
  return (
    meaning.querySelector('span.dtText')?.textContent?.trim() ||
    meaning.querySelector('span.unText')?.textContent?.trim()
  )
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
