import { AppConfig } from '@/app-config'
import { fetchDirtyDOM } from '@/_helpers/fetch-dom'
import {
  HTMLString,
  getInnerHTML,
  handleNoResult,
  handleNetWorkError,
  SearchFunction,
  GetSrcPageFunction,
  externalLink,
  DictSearchResult,
  getChsToChz
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

export const search: SearchFunction<COBUILDResult> = async (
  text,
  config,
  profile,
  payload
) => {
  text = encodeURIComponent(text.replace(/\s+/g, '-'))
  const { options } = profile.dicts.all.cobuild
  const sources: string[] = [
    'https://www.collinsdictionary.com/dictionary/english/',
    'https://www.collinsdictionary.com/zh/dictionary/english/'
  ]

  if (options.cibaFirst) {
    sources.reverse()
  }

  try {
    return handleDOM(await fetchDirtyDOM(sources[0] + text), config)
  } catch (e) {
    let doc: Document
    try {
      doc = await fetchDirtyDOM(sources[1] + text)
    } catch (e) {
      return handleNetWorkError()
    }
    return handleDOM(doc, config)
  }
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

  result.sections = [
    ...doc.querySelectorAll<HTMLDivElement>(`[data-type-block]`)
  ]
    .filter($section => {
      const type = $section.dataset.typeBlock || ''
      return (
        type &&
        type !== 'Video' &&
        type !== 'Trends' &&
        type !== '英语词汇表' &&
        type !== '趋势'
      )
    })
    .map($section => {
      const type = $section.dataset.typeBlock || ''
      const title = $section.dataset.titleBlock || ''
      const num = $section.dataset.numBlock || ''
      const id = type + title + num
      const className = $section.className || ''

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
        id,
        className,
        type,
        title,
        num,
        content: getInnerHTML('https://www.collinsdictionary.com', $section, {
          transform
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
