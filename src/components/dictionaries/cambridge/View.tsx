import React, { FC } from 'react'
import { CambridgeResult } from './engine'
import { ViewPorps } from '@/components/dictionaries/helpers'

export const DictCambridge: FC<ViewPorps<CambridgeResult>> = props => (
  <>
    {props.result.map((entry, i) => (
      <section
        key={i}
        className="dictCambridge-Entry"
        onClick={handleEntryClick}
      >
        <div dangerouslySetInnerHTML={{ __html: entry }} />
      </section>
    ))}
  </>
)

export default DictCambridge

function handleEntryClick(e: React.MouseEvent<HTMLElement>) {
  const target = e.nativeEvent.target as HTMLDivElement
  if (target && target.classList && target.classList.contains('js-accord')) {
    target.classList.toggle('open')
  }
}
