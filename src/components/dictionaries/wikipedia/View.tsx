import React, { FC, useState, ReactNode, useEffect } from 'react'
import {
  WikipediaResult,
  WikipediaPayload,
  fetchLangList,
  LangList
} from './engine'
import { ViewPorps } from '@/components/dictionaries/helpers'
import { message } from '@/_helpers/browser-api'
import { useTranslate } from '@/_helpers/i18n'

export const DictWikipedia: FC<ViewPorps<WikipediaResult>> = ({
  result,
  searchText
}) => {
  const [langList, setLangList] = useState<LangList>()
  const { t } = useTranslate('content')

  useEffect(() => {
    setLangList([])
  }, [result.langSelector])

  const handleSelectChanged = (e: React.ChangeEvent<HTMLSelectElement>) => {
    if (e.target.value) {
      searchText<WikipediaPayload>({
        id: 'wikipedia',
        payload: {
          url: e.target.value
        }
      })
    }
  }

  let langSelector: ReactNode = null
  if (langList && langList.length > 0) {
    langSelector = (
      <select onChange={handleSelectChanged} defaultValue={''}>
        <option key="" value="">
          {t('chooseLang')}
        </option>
        {langList.map(item => (
          <option key={item.url} value={item.url}>
            {item.title}
          </option>
        ))}
      </select>
    )
  } else if (result.langSelector) {
    langSelector = (
      <button
        className="dictWikipedia-LangSelectorBtn"
        onClick={async () => {
          setLangList(
            await message.send<
              'DICT_ENGINE_METHOD',
              ReturnType<typeof fetchLangList>
            >({
              type: 'DICT_ENGINE_METHOD',
              payload: {
                id: 'wikipedia',
                method: 'fetchLangList',
                args: [result.langSelector]
              }
            })
          )
        }}
      >
        {t('fetchLangList')}
      </button>
    )
  }

  return (
    <>
      <h1 className="dictWikipedia-Title">{result.title}</h1>
      {langSelector}
      <div className="dictWikipedia-Content" onClick={handleEntryClick}>
        <div
          className="client-js"
          dangerouslySetInnerHTML={{ __html: result.content }}
        />
      </div>
    </>
  )
}

function handleEntryClick(e: React.MouseEvent<HTMLDivElement>) {
  if (!e.target['classList']) {
    return
  }

  let $header = e.target as HTMLElement
  if (!$header.classList.contains('section-heading')) {
    $header = $header.parentElement as HTMLElement
    if (!$header || !$header.classList.contains('section-heading')) {
      return
    }
  }

  e.stopPropagation()
  e.preventDefault()

  // Toggle titles

  $header.classList.toggle('open-block')

  const $content = $header.nextElementSibling
  if ($content) {
    const pressed = $header.classList.contains('open-block').toString()
    $content.classList.toggle('open-block')
    $content.setAttribute('aria-pressed', pressed)
    $content.setAttribute('aria-expanded', pressed)
  }

  const $arrow = $header.querySelector('.mw-ui-icon-mf-arrow')
  if ($arrow) {
    $arrow.classList.toggle('mf-mw-ui-icon-rotate-flip')
  }
}

export default DictWikipedia
