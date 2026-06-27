import { AppConfig } from '@/app-config'
import { fetchDirtyDOM } from '@/_helpers/fetch-dom'
import {
  HTMLString,
  getInnerHTML,
  handleNoResult,
  handleNetWorkError,
  handleManualVerification,
  SearchFunction,
  GetSrcPageFunction,
  externalLink,
  DictSearchResult,
  getChsToChz
} from '../helpers'
import { getStaticSpeaker } from '@/components/Speaker'

const HOST = 'https://www.collinsdictionary.com'
const COLLINS_TYPE_PREFIX = 'definition.title.type.'

const SECTION_TYPE_LABELS: { [key: string]: string } = {
  cobuild: 'COBUILD',
  ced: 'Collins English Dictionary',
  english: 'Collins English Dictionary',
  american: 'American English Dictionary',
  aed: 'American English Dictionary',
  learner: 'COBUILD',
  penguin: 'Penguin Dictionary',
  esp_ret: 'Retail',
  examples: 'Examples',
  idioms: 'Idioms',
  collos: 'Collocations'
}

const SKIPPED_SECTION_KEYS = new Set([
  'video',
  'trends',
  'wordlists',
  'translation',
  'translations'
])

const SKIPPED_SECTION_LABELS = new Set([
  'video pronunciation',
  'word lists',
  'word usage trends',
  'translations',
  '英语词汇表',
  '趋势'
])

export const getSrcPage: GetSrcPageFunction = text => {
  return (
    `${HOST}/dictionary/english/` +
    encodeURIComponent(text.replace(/\s+/g, '-'))
  )
}

export interface COBUILDCibaResult {
  type: 'ciba'
  title: string
  defs: HTMLString[]
  level?: string
  star?: number
  prons?: Array<{
    phsym: string
    audio: string
  }>
}

export interface COBUILDColResult {
  type: 'collins'
  sections: Array<{
    id: string
    className: string
    type: string
    title: string
    num: string
    content: HTMLString
  }>
}

export type COBUILDResult = COBUILDCibaResult | COBUILDColResult

export const search: SearchFunction<COBUILDResult> = async (
  text,
  config,
  profile,
  payload
) => {
  const searchText = text
  const encodedText = encodeURIComponent(text.replace(/\s+/g, '-'))
  const { options } = profile.dicts.all.cobuild
  const sources: string[] = [
    'https://www.collinsdictionary.com/dictionary/english/',
    'https://www.collinsdictionary.com/zh/dictionary/english/'
  ]

  if (options.cibaFirst) {
    sources.reverse()
  }

  const primaryUrl = sources[0] + encodedText
  const secondaryUrl = sources[1] + encodedText

  try {
    return handleDOM(
      await fetchDirtyDOM(primaryUrl, { withCredentials: true }),
      config
    )
  } catch (firstError) {
    let doc: Document
    try {
      doc = await fetchDirtyDOM(secondaryUrl, {
        withCredentials: true
      })
    } catch (secondError) {
      const forbiddenUrl = isForbidden(firstError)
        ? primaryUrl
        : isForbidden(secondError)
        ? secondaryUrl
        : ''

      if (forbiddenUrl) {
        return handleManualVerification({
          text: searchText,
          url: forbiddenUrl
        })
      }
      return handleNetWorkError()
    }
    return handleDOM(doc, config)
  }
}

function isForbidden(e: any): boolean {
  return e && e.response && e.response.status === 403
}

async function handleDOM(
  doc: Document,
  config: AppConfig
): Promise<DictSearchResult<COBUILDColResult>> {
  const transform = await getChsToChz(config.langCode)

  const result: COBUILDColResult = {
    type: 'collins',
    sections: []
  }
  const audio: { uk?: string; us?: string } = {}

  result.sections = getSectionNodes(doc)
    .filter(({ meta }) => {
      const type = getCleanLabel(meta.dataset.typeBlock)
      return !!type && !shouldSkipSectionType(type)
    })
    .map(({ meta, content: $section }, i) => {
      const rawType = getCleanLabel(meta.dataset.typeBlock)
      const type = normalizeSectionType(rawType)
      const title = getSectionTitle(meta, $section, type)
      const num = getCleanLabel(
        meta.dataset.numBlock || $section.dataset.numBlock
      )
      const id = type + title + num
      const className = $section.className || ''
      const mp3 = getAudio($section)

      if (isCobuildSection(rawType)) {
        //   const $frequency = $section.querySelector<HTMLSpanElement>('.word-frequency-img')
        //   if ($frequency) {
        //     const star = Number($frequency.dataset.band)
        //     if (star) {
        //       result.star = star
        //     }
        //   }
        if (!audio.uk && mp3) {
          audio.uk = mp3
        }
      } else if (isAmericanSection(rawType) && mp3) {
        audio.us = mp3
      } else if (mp3 && (isEnglishSection(rawType) || !audio.uk)) {
        audio.uk = mp3
      }

      const $video = $section.querySelector<HTMLDivElement>('#videos .video')
      if ($video) {
        const $youtubeVideo = $video.querySelector<HTMLDivElement>(
          '.youtube-video'
        )
        if ($youtubeVideo && $youtubeVideo.dataset.embed) {
          const width = config.panelWidth - 25
          const height = (width / 560) * 315
          return {
            id,
            className,
            type,
            title,
            num,
            content: `<iframe width="${width}" height="${height}" src="https://www.youtube-nocookie.com/embed/${$youtubeVideo.dataset.embed}" frameborder="0" allow="accelerometer; encrypted-media"></iframe>`
          }
        }
      }

      $section
        .querySelectorAll<HTMLAnchorElement>('.audio_play_button')
        .forEach($speaker => {
          $speaker.replaceWith(getStaticSpeaker($speaker.dataset.srcMp3))
        })

      // so that clicking won't trigger in-panel search
      $section
        .querySelectorAll<HTMLAnchorElement>('a.type-thesaurus')
        .forEach(externalLink)

      return {
        id: id || String(i),
        className,
        type,
        title,
        num,
        content: getInnerHTML(HOST, $section, {
          transform
        })
      }
    })

  if (result.sections.length > 0) {
    return { result, audio }
  }

  return handleNoResult()
}

function getSectionNodes(
  doc: Document
): Array<{ meta: HTMLElement; content: HTMLElement }> {
  const sections: Array<{ meta: HTMLElement; content: HTMLElement }> = []
  const seen = new Set<HTMLElement>()

  doc.querySelectorAll<HTMLElement>('[data-type-block]').forEach(meta => {
    const content = getSectionContentNode(meta)
    if (!seen.has(content)) {
      seen.add(content)
      sections.push({ meta, content })
    }
  })

  return sections
}

function getSectionContentNode($node: HTMLElement): HTMLElement {
  if (!$node.classList.contains('cB-h')) {
    return $node
  }

  return (
    $node.closest<HTMLElement>(
      '.entry.dictionary.cB, .entry.cB, .asset, .cB'
    ) || $node
  )
}

function getAudio($section: HTMLElement): string | undefined {
  const $audio = $section.querySelector<HTMLAnchorElement>(
    '.pron .audio_play_button'
  )
  if ($audio) {
    const src = $audio.dataset.srcMp3
    if (src) {
      return src
    }
  }
}

function shouldSkipSectionType(type: string): boolean {
  const key = getSectionTypeKey(type)
  const label = getCleanLabel(type).toLowerCase()

  return (
    SKIPPED_SECTION_KEYS.has(key) ||
    SKIPPED_SECTION_LABELS.has(label) ||
    /^translations?(?:\s+of\b)?/.test(label)
  )
}

function normalizeSectionType(type: string): string {
  const key = getSectionTypeKey(type)
  if (SECTION_TYPE_LABELS[key]) {
    return SECTION_TYPE_LABELS[key]
  }

  if (key !== type.toLowerCase()) {
    return key
      .split(/[_\s-]+/)
      .filter(Boolean)
      .map(word => word[0].toUpperCase() + word.slice(1))
      .join(' ')
  }

  return type
}

function getSectionTypeKey(type: string): string {
  const lowerType = type.toLowerCase()
  return lowerType.startsWith(COLLINS_TYPE_PREFIX)
    ? lowerType.slice(COLLINS_TYPE_PREFIX.length)
    : lowerType
}

function getSectionTitle(
  $meta: HTMLElement,
  $section: HTMLElement,
  type: string
): string {
  const title = normalizeSectionTitle(
    getCleanLabel($meta.dataset.titleBlock) ||
      getCleanLabel(getTitleElement($meta)) ||
      getCleanLabel(getTitleElement($section))
  )

  return title && !title.toLowerCase().startsWith(type.toLowerCase())
    ? title
    : ''
}

function getTitleElement($section: HTMLElement): Element | null {
  return $section.querySelector(
    [
      '.cB-h .entry_title',
      '.cB-h .h2_entry',
      '.entry_title',
      '.h2_entry',
      '.content-box-header .h2_entry',
      '.content-box-header h2'
    ].join(',')
  )
}

function normalizeSectionTitle(title: string): string {
  return getSectionTypeKey(title) !== title.toLowerCase()
    ? normalizeSectionType(title)
    : title
}

function getCleanLabel(input?: string | Element | null): string {
  const text =
    typeof input === 'string' ? input : input ? input.textContent || '' : ''

  return text
    .replace(/<[^>]*>/g, '')
    .replace(/\{\d+\}/g, '')
    .replace(/\s+/g, ' ')
    .trim()
}

function isCobuildSection(type: string): boolean {
  const key = getSectionTypeKey(type)
  return key === 'cobuild' || key === 'learner' || type === 'Learner'
}

function isEnglishSection(type: string): boolean {
  const key = getSectionTypeKey(type)
  return key === 'ced' || key === 'english' || type === 'English'
}

function isAmericanSection(type: string): boolean {
  const key = getSectionTypeKey(type)
  return key === 'american' || key === 'aed' || type === 'American'
}
