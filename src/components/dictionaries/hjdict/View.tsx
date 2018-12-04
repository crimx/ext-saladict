import React from 'react'
import { HjdictResult, HjdictResultLex, HjdictResultRelated } from './engine'
import withStaticSpeaker from '@/components/withStaticSpeaker'
import { ViewPorps } from '@/components/dictionaries/helpers'

export default withStaticSpeaker((props: ViewPorps<HjdictResult>) => {
  switch (props.result.type) {
    case 'lex':
      return renderLex(props.result, props.recalcBodyHeight)
    case 'related':
      return renderRelated(props.result)
  }
  return null
}, 'dictHjdict-Speaker')

function renderLex (result: HjdictResultLex, recalcBodyHeight: () => void) {
  const { header, entries } = result
  return (
    <div className='dictHjdict-Entry' onClick={e => handleClick(e, recalcBodyHeight)}>
      {header && (
        <header className='word-details-header' dangerouslySetInnerHTML={{ __html: header }} />
      )}
      {entries.map((entry, i) => (
        <div dangerouslySetInnerHTML={{ __html: entry }} key={i} />
      ))}
    </div>
  )
}

function renderRelated (result: HjdictResultRelated) {
  return (
    <div className='dictHjdict-Entry' dangerouslySetInnerHTML={{ __html: result.content }} />
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
