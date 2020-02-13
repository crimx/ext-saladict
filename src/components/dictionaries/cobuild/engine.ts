import { fetchDirtyDOM } from '@/_helpers/fetch-dom'
import {
  HTMLString,
  getText,
  getInnerHTML,
  handleNoResult,
  handleNetWorkError,
  SearchFunction,
  GetSrcPageFunction,
  externalLink,
  DictSearchResult
} from '../helpers'
import { getStaticSpeaker } from '@/components/Speaker'

export const getSrcPage: GetSrcPageFunction = text => {
  return (
    `https://www.collinsdictionary.com/dictionary/english/` +
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

export const search: SearchFunction<COBUILDResult> = (
  text,
  config,
  profile,
  payload
) => {
  text = encodeURIComponent(text.replace(/\s+/g, '-'))
  const isChz = config.langCode === 'zh-TW'
  const { options } = profile.dicts.all.cobuild
  const sources:
    | [[string, typeof handleCibaDOM], [string, typeof handleColDOM]]
    | [[string, typeof handleColDOM], [string, typeof handleCibaDOM]] = [
    ['https://www.collinsdictionary.com/dictionary/english/', handleColDOM],
    ['http://www.iciba.com/', handleCibaDOM]
  ]

  if (options.cibaFirst) {
    sources.reverse()
  }

  return fetchDirtyDOM(sources[0][0] + text)
    .then(doc => sources[0][1](doc, isChz))
    .catch(() => {
      return fetchDirtyDOM(sources[1][0] + text)
        .catch(handleNetWorkError)
        .then(doc => sources[1][1](doc, isChz))
    })
}

async function handleCibaDOM(
  doc: Document,
  isChz: boolean
): Promise<DictSearchResult<COBUILDCibaResult>> {
  const result: COBUILDCibaResult = {
    type: 'ciba',
    title: '',
    defs: []
  }
  const audio: { uk?: string; us?: string } = {}

  result.title = getText(doc, '.keyword', isChz)
  if (!result.title) {
    return handleNoResult()
  }

  result.level = getText(doc, '.base-level')

  let $star = doc.querySelector('.word-rate [class^="star"]')
  if ($star) {
    let star = Number($star.className[$star.className.length - 1])
    if (!isNaN(star)) {
      result.star = star
    }
  }

  let $pron = doc.querySelector('.base-speak')
  if ($pron) {
    result.prons = Array.from($pron.children).map(el => {
      const phsym = (el.textContent || '').trim()
      const mp3 = (/http\S+.mp3/.exec(el.innerHTML) || [''])[0]

      if (phsym.indexOf('英') !== -1) {
        audio.uk = mp3
      } else if (phsym.indexOf('美') !== -1) {
        audio.us = mp3
      }

      return {
        phsym,
        audio: mp3
      }
    })
  }

  let $article = Array.from(doc.querySelectorAll('.info-article')).find(x =>
    /柯林斯高阶英汉双解学习词典/.test(x.textContent || '')
  )
  if ($article) {
    result.defs = Array.from($article.querySelectorAll('.prep-order')).map(d =>
      getInnerHTML('http://www.iciba.com', d, { toChz: isChz })
    )
  }

  if (result.defs.length > 0) {
    return { result, audio }
  }

  return handleNoResult()
}

async function handleColDOM(
  doc: Document,
  toChz: boolean
): Promise<DictSearchResult<COBUILDColResult>> {
  const result: COBUILDColResult = {
    type: 'collins',
    sections: []
  }
  const audio: { uk?: string; us?: string } = {}

  result.sections = [
    ...doc.querySelectorAll<HTMLDivElement>(`[data-type-block]`)
  ]
    .filter($section => {
      const type = $section.dataset.typeBlock || ''
      return type && type !== 'Video' && type !== 'Trends'
    })
    .map($section => {
      const type = $section.dataset.typeBlock || ''
      const title = $section.dataset.titleBlock || ''
      const num = $section.dataset.numBlock || ''

      if (type === 'Learner') {
        //   const $frequency = $section.querySelector<HTMLSpanElement>('.word-frequency-img')
        //   if ($frequency) {
        //     const star = Number($frequency.dataset.band)
        //     if (star) {
        //       result.star = star
        //     }
        //   }
        if (!audio.uk) {
          const mp3 = getAudio($section)
          if (mp3) {
            audio.uk = mp3
          }
        }
      } else if (type === 'English') {
        audio.uk = getAudio($section)
      } else if (type === 'American') {
        audio.us = getAudio($section)
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
        id: type + title + num,
        className: $section.className || '',
        type,
        title,
        num,
        content: getInnerHTML('https://www.collinsdictionary.com', $section, {
          toChz
        })
      }
    })

  if (result.sections.length > 0) {
    return { result, audio }
  }

  return handleNoResult()
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
