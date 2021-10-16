import React, { FC } from 'react'
import { WeblioResult } from './engine'
import { ViewPorps } from '@/components/dictionaries/helpers'
import EntryBox from '@/components/EntryBox'
import { StrElm } from '@/components/StrElm'

export const DictWeblio: FC<ViewPorps<WeblioResult>> = ({ result }) => (
  <div className="dictWeblio-Container">
    {result.map(({ title, def }) => (
      <EntryBox
        key={title}
        className="dictWeblio-Entry"
        title={<StrElm tag="span" html={title} />}
      >
        <StrElm html={def} />
      </EntryBox>
    ))}
  </div>
)

export default DictWeblio
