import React from 'react'
import { HjdictResult, HjdictResultLex, HjdictResultRelated } from './engine'
import withStaticSpeaker from '@/components/withStaticSpeaker'
import { ViewPorps } from '@/components/dictionaries/helpers'

export default withStaticSpeaker((props: ViewPorps<HjdictResult>) => {
  switch (props.result.type) {
    case 'lex':
      return renderLex(props)
    case 'related':
      return renderRelated(props)
  }
  return null
}, 'dictHjdict-Speaker')

function renderLex (props: ViewPorps<HjdictResult>) {
  const { header, entries } = props.result as HjdictResultLex
  return (
    <div className='dictHjdict-Entry' onClick={e => handleClick(e, props.recalcBodyHeight)}>
      {renderLangSelect(props)}
      {header && (
        <header className='word-details-header' dangerouslySetInnerHTML={{ __html: header }} />
      )}
      {entries.map((entry, i) => (
        <div dangerouslySetInnerHTML={{ __html: entry }} key={i} />
      ))}
    </div>
  )
}

function renderRelated (props: ViewPorps<HjdictResult>) {
  const { content } = props.result as HjdictResultRelated
  return (
    <div>
      {renderLangSelect(props)}
      <div
        className='dictHjdict-Entry' dangerouslySetInnerHTML={{ __html: content }} />
    </div>
  )
}

const langSelectList = ['w', 'jp/cj', 'jp/jc', 'kr', 'fr', 'de', 'es']

function renderLangSelect (props: ViewPorps<HjdictResult>) {
  const { langCode } = props.result

  return (
    <select
      style={{ width: '100%' }}
      onChange={e => props.searchText({
        id: 'hjdict',
        payload: { langCode: e.target.value },
      })}
    >
      {langSelectList.map(lang => (
        <option key={lang} value={lang} selected={lang === langCode}>{
          props.t(`dict:hjdict_chsas-${lang}`)
        }</option>
      ))}
    </select>
  )
}

function handleClick (e: React.MouseEvent<HTMLElement>, recalcBodyHeight: () => void): void {
  const $tab = getWordDetailsTab(e.target)
  if ($tab) {
    if ($tab.classList.contains('word-details-tab-active')) {
      return
    }
    const doc = $tab.ownerDocument
    if (doc) {
      const index = +($tab.dataset.categories || '0')

      const $panes = doc.querySelectorAll('.word-details-pane')

      doc.querySelectorAll('.word-details-tab')
        .forEach(($tab, i) => {
          if (i === index) {
            $tab.classList.add('word-details-tab-active')
            $panes[i].classList.add('word-details-pane-active')
          } else {
            $tab.classList.remove('word-details-tab-active')
            $panes[i].classList.remove('word-details-pane-active')
          }
        })

      recalcBodyHeight()
    }
  }
}

function getWordDetailsTab (target: any): HTMLElement | null {
  for (let el = target; el; el = el.parentElement) {
    if (el.classList && el.classList.contains('word-details-tab')) {
      return el
    }
  }
  return null
}
