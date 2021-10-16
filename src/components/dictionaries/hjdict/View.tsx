import React, { FC } from 'react'
import { HjdictResult, HjdictResultLex, HjdictResultRelated } from './engine'
import { ViewPorps } from '@/components/dictionaries/helpers'
import { useTranslate } from '@/_helpers/i18n'
import { StrElm } from '@/components/StrElm'

export const DictHjDict: FC<ViewPorps<HjdictResult>> = props =>
  props.result.type === 'lex' ? (
    <Lex {...props} />
  ) : props.result.type === 'related' ? (
    <Related {...props} />
  ) : null

export default DictHjDict

function Lex(props: ViewPorps<HjdictResult>) {
  const { header, entries } = props.result as HjdictResultLex
  return (
    <div className="dictHjdict-Entry" onClick={handleClick}>
      <LangSelect {...props} />
      {header && (
        <StrElm tag="header" className="word-details-header" html={header} />
      )}
      {entries.map((entry, i) => (
        <StrElm key={i} html={entry} />
      ))}
    </div>
  )
}

function Related(props: ViewPorps<HjdictResult>) {
  const { content } = props.result as HjdictResultRelated
  return (
    <div>
      <LangSelect {...props} />
      <StrElm className="dictHjdict-Entry" html={content} />
    </div>
  )
}

const langSelectList = ['w', 'jp/cj', 'jp/jc', 'kr', 'fr', 'de', 'es']

function LangSelect(props: ViewPorps<HjdictResult>) {
  const { langCode } = props.result
  const { t } = useTranslate('dicts')

  return (
    <select
      value={langCode}
      onChange={e =>
        props.searchText({
          id: 'hjdict',
          payload: { langCode: e.target.value }
        })
      }
    >
      {langSelectList.map(lang => (
        <option key={lang} value={lang}>
          {t(`hjdict.options.chsas-${lang}`)}
        </option>
      ))}
    </select>
  )
}

function handleClick(e: React.MouseEvent<HTMLElement>): void {
  const $tab = getWordDetailsTab(e.target)
  if ($tab) {
    if ($tab.classList.contains('word-details-tab-active')) {
      return
    }
    const container = e.currentTarget
    if (container) {
      const index = +($tab.dataset.categories || '0')

      const $panes = container.querySelectorAll('.word-details-pane')

      container.querySelectorAll('.word-details-tab').forEach(($tab, i) => {
        if (i === index) {
          $tab.classList.add('word-details-tab-active')
          $panes[i].classList.add('word-details-pane-active')
        } else {
          $tab.classList.remove('word-details-tab-active')
          $panes[i].classList.remove('word-details-pane-active')
        }
      })
    }
  }
}

function getWordDetailsTab(target: any): HTMLElement | null {
  for (let el = target; el; el = el.parentElement) {
    if (el.classList && el.classList.contains('word-details-tab')) {
      return el
    }
  }
  return null
}
