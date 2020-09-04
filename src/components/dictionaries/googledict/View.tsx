import React, { FC } from 'react'
import { GoogleDictResult } from './engine'
import { ViewPorps } from '@/components/dictionaries/helpers'

export const DictGoogleDict: FC<ViewPorps<GoogleDictResult>> = ({ result }) => (
  <div>
    {result.styles.map((style, i) => (
      <style key={i}>{style}</style>
    ))}
    <div
      onClick={onEntryClick}
      className="xpdopen"
      dangerouslySetInnerHTML={{ __html: result.entry }}
    />
  </div>
)

function onEntryClick(e: React.MouseEvent) {
  for (
    let isMoreBtn: boolean | null = null, node = e.target as Element | null;
    node;
    node = node.parentElement
  ) {
    if (node.getAttribute('jsname') === 'Stv3Z') {
      isMoreBtn = true
    } else if (node.getAttribute('jsname') === 'hj0qK') {
      isMoreBtn = false
    }
    if (node.classList) {
      if (node.classList.contains('P2Dfkf')) {
        if (isMoreBtn === null) {
          continue
        }
        if (isMoreBtn) {
          node.classList.replace('SkSOXb', 'KAwqid')
        } else {
          node.classList.replace('KAwqid', 'SkSOXb')
        }
        break
      }
    }
  }
}

export default DictGoogleDict
