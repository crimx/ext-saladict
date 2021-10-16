import React, { FC, ReactNode } from 'react'
import Speaker from '@/components/Speaker'
import StarRates from '@/components/StarRates'
import {
  MacmillanResult,
  MacmillanResultLex,
  MacmillanResultRelated
} from './engine'
import { ViewPorps } from '@/components/dictionaries/helpers'
import { StrElm } from '@/components/StrElm'

export const DictMacmillan: FC<ViewPorps<MacmillanResult>> = ({
  result,
  searchText
}) => {
  switch (result.type) {
    case 'lex':
      return renderLex(result, renderSelect(result, searchText))
    case 'related':
      return renderRelated(result)
    default:
      return null
  }
}

export default DictMacmillan

function renderSelect(
  result: MacmillanResultLex,
  searchText: ViewPorps<MacmillanResultLex>['searchText']
) {
  return result.relatedEntries.length > 0 ? (
    <select
      value={''}
      onChange={e => {
        if (e.currentTarget.value) {
          searchText({
            id: 'macmillan',
            payload: { href: e.currentTarget.value }
          })
        }
      }}
    >
      <option value="">
        {result.title + (result.pos ? ` ${result.pos.toUpperCase()}` : '')}
      </option>
      {result.relatedEntries.map(({ title, href }) => (
        <option key={href} value={href}>
          {title}
        </option>
      ))}
    </select>
  ) : null
}

function renderLex(result: MacmillanResultLex, select: ReactNode) {
  return (
    <section onClick={onEntryClick}>
      {select}
      <header className="dictMacmillan-Header">
        {result.ratting! > 0 && <StarRates rate={result.ratting} />}
        <span className="dictMacmillan-Header_Info">
          {result.phsym} <Speaker src={result.pron} /> {result.pos} {result.sc}
        </span>
      </header>
      <StrElm tag="ol" className="dictMacmillan-Sences" html={result.senses} />
      {result.toggleables.map((toggleable, i) => (
        <StrElm key={i} html={toggleable} />
      ))}
    </section>
  )
}

function renderRelated(result: MacmillanResultRelated) {
  return (
    <>
      <p>Did you mean:</p>
      <ul className="dictMacmillan-Related">
        {result.list.map(({ title, href }) => (
          <li key={href}>
            <a href={href}>{title}</a>
          </li>
        ))}
      </ul>
    </>
  )
}

function onEntryClick(event: React.MouseEvent<HTMLElement>) {
  if (!event.target['classList']) {
    return
  }
  const target = event.target as Element

  let isToggleHead =
    target.classList.contains('toggle-open') ||
    target.classList.contains('toggle-close')

  if (!isToggleHead) {
    for (let el: Element | null = target; el; el = el.parentElement) {
      if (el.classList.contains('toggle-toggle')) {
        isToggleHead = true
        break
      }
    }
  }

  if (!isToggleHead) {
    return
  }

  for (let el: Element | null = target; el; el = el.parentElement) {
    if (el.classList.contains('toggleable')) {
      el.classList.toggle('closed')
      event.preventDefault()
      event.stopPropagation()
      break
    }
  }
}
