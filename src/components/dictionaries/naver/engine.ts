import { fetchDirtyDOM } from '@/_helpers/fetch-dom'
import {
  handleNoResult,
  handleNetWorkError,
  getText,
  getInnerHTMLBuilder,
  SearchFunction,
  GetSrcPageFunction,
  HTMLString,
  removeChildren,
} from '../helpers'
import { DictSearchResult } from '@/typings/server'
import { isContainJapanese, isContainKorean } from '@/_helpers/lang-check'

export const getSrcPage: GetSrcPageFunction = (text) => {
  return isContainJapanese(text)
    ? `https://ja.dict.naver.com/search.nhn?range=all&q=${encodeURIComponent(text)}`
    : `https://zh.dict.naver.com/#/search?query=${encodeURIComponent(text)}`
}

/** Alternate machine translation result */
export interface NaverResult {
  lang: 'zh' | 'ja'
  entry: HTMLString
}

interface NaverPayload {
  lang?: 'zh' | 'ja'
}

type NaverSearchResult = DictSearchResult<NaverResult>

export const search: SearchFunction<NaverSearchResult, NaverPayload> = (
  text, config, profile, payload
) => {
  const { options } = profile.dicts.all.naver

  if (payload.lang === 'ja' ||
      options.hanAsJa ||
      isContainJapanese(text) ||
      (options.korAsJa && isContainKorean(text))
  ) {
    return jaDict(text)
  }

  return zhDict(text)
}

async function zhDict (text: string): Promise<NaverSearchResult> {
  try {
    var doc = await fetchDirtyDOM(`http://m.cndic.naver.com/search/all?sLn=zh_CN&fromNewVer&q=${encodeURIComponent(text)}`)
  } catch (e) {
    return handleNetWorkError()
  }

  const getInnerHTML = getInnerHTMLBuilder('http://m.cndic.naver.com/', {})

  let $container = doc.querySelector('#ct')
  if (!$container) { return handleNoResult() }

  $container = $container.querySelector('#ct') || $container

  removeChildren($container, '.recent_searches')
  removeChildren($container, '.m_tab')
  removeChildren($container, '.con_clt')
  removeChildren($container, '.info_userent')
  removeChildren($container, '.go_register')
  removeChildren($container, '.section_banner')
  removeChildren($container, '.spi_area')

  return {
    result: {
      lang: 'zh',
      entry: getInnerHTML($container),
    }
  }
}

async function jaDict (text: string): Promise<NaverSearchResult> {
  try {
    var doc = await fetchDirtyDOM(`https://ja.dict.naver.com/search.nhn?range=all&q=${encodeURIComponent(text)}`)
  } catch (e) {
    return handleNetWorkError()
  }

  const getInnerHTML = getInnerHTMLBuilder('https://ja.dict.naver.com/')

  const $container = doc.querySelector('#content')
  if (!$container) { return handleNoResult() }

  removeChildren($container, '.sorting')
  removeChildren($container, '.info_userent')
  removeChildren($container, '.view_ctrl')
  removeChildren($container, '.go_register')
  removeChildren($container, '.section_banner')

  return {
    result: {
      lang: 'ja',
      entry: getInnerHTML($container),
    }
  }
}
