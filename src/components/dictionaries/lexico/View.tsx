import React, { FC } from 'react'
import { LexicoResult, LexicoResultLex, LexicoResultRelated } from './engine'
import { ViewPorps } from '@/components/dictionaries/helpers'

export const DictLexico: FC<ViewPorps<LexicoResult>> = ({ result }) => {
  switch (result.type) {
    case 'lex':
      return renderLex(result)
    case 'related':
      return renderRelated(result)
    default:
      return null
  }
}

function renderLex(result: LexicoResultLex) {
  return (
    <div
      className="dictLexico-Lex"
      dangerouslySetInnerHTML={{ __html: result.entry }}
      onClick={onLexClick}
    />
  )
}

function renderRelated(result: LexicoResultRelated) {
  return (
    <>
      <p>Did you mean:</p>
      <ul className="dictLexico-Related">
        {result.list.map((item, i) => (
          <li key={i}>
            <a
              rel="nofollow noopener noreferrer"
              target="_blank"
              href={item.href}
            >
              {item.text}
            </a>
          </li>
        ))}
      </ul>
    </>
  )
}

export default DictLexico

function onLexClick(e: React.MouseEvent): void {
  const $target = e.target as Element
  const $info = $target.classList?.contains('moreInfo')
    ? $target
    : $target.parentElement?.classList?.contains('moreInfo')
    ? $target.parentElement
    : null
  if ($info) {
    $info.classList.toggle('active')
  }
}
