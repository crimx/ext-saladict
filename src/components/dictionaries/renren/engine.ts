import { fetchDirtyDOM } from '@/_helpers/fetch-dom'
import {
  HTMLString,
  getText,
  getInnerHTML,
  handleNoResult,
  handleNetWorkError,
  SearchFunction,
  GetSrcPageFunction,
  DictSearchResult,
  getFullLink
} from '../helpers'

export const getSrcPage: GetSrcPageFunction = text => {
  return `https://www.91dict.com/words?w=${encodeURIComponent(
    text.replace(/\s+/g, '+')
  )}`
}

const HOST = 'https://www.91dict.com'

export interface RenrenSlide {
  cover: string
  mp3: string
  en: HTMLString
  chs: string
}

interface RenrenResultItem {
  key: string
  title: string
  detail: string
  slide: RenrenSlide
  context: Array<{
    title: string
    content: string[]
  }>
}

export type RenrenResult = RenrenResultItem[]

type RenrenSearchResult = DictSearchResult<RenrenResult>

export const search: SearchFunction<RenrenResult> = (
  text,
  config,
  profile,
  payload
) => {
  return fetchDirtyDOM(
    `https://www.91dict.com/words?w=${encodeURIComponent(
      text.replace(/\s+/g, '+')
    )}`
  )
    .catch(handleNetWorkError)
    .then(handleDOM)
}

function handleDOM(
  doc: Document
): RenrenSearchResult | Promise<RenrenSearchResult> {
  const result: RenrenResult = []

  const $slides = doc.querySelectorAll('.tmInfo .slides > li')

  if ($slides.length <= 0) {
    return handleNoResult()
  }

  $slides.forEach($li => {
    const title = getText($li.querySelector('.mTop')).trim()
    if (!title) return

    const slide = extractSlide($li)
    if (!slide) return

    const item: RenrenResultItem = {
      key: '',
      title,
      detail: '',
      slide,
      context: []
    }

    const $detail = $li.querySelector('.viewdetail')
    if ($detail) {
      item.detail = getFullLink(HOST, $detail, 'href')
    }

    $li.querySelectorAll('.mTextend .box').forEach($box => {
      const title = getText($box, '.sty1')
      if (!title) return

      item.context.push({
        title,
        content: [...$box.querySelectorAll('.sty2 > *')].map($p => getText($p))
      })
    })

    item.key = title + slide.cover

    result.push(item)
  })

  if (result.length > 0) {
    return { result }
  } else {
    return handleNoResult()
  }
}

export async function getDetail(src: string): Promise<RenrenSlide[]> {
  const result: RenrenSlide[] = []

  try {
    const doc = await fetchDirtyDOM(src)
    doc.querySelectorAll('.item li').forEach($li => {
      const slide = extractSlide($li)
      if (slide) {
        result.push(slide)
      }
    })
  } catch (e) {
    console.warn(e)
  }

  return result
}

function extractSlide($li: Element): RenrenSlide | null {
  const slide: RenrenSlide = {
    cover: '',
    mp3: '',
    en: '',
    chs: ''
  }

  const $cover = $li.querySelector('img')
  if (!$cover) return null
  const cover = getFullLink(HOST, $cover, 'src')
  if (!cover) return null
  slide.cover = cover

  const $audio = $li.querySelector('.mTop audio')
  if ($audio) {
    slide.mp3 = getFullLink(HOST, $audio, 'src')
  }

  slide.en = getInnerHTML(HOST, $li, '.mBottom')
  slide.chs = getText($li, '.mFoot').trim()

  return slide
}
