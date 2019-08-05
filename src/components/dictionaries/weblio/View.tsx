import React, { FC } from 'react'
import { WeblioResult } from './engine'
import { ViewPorps } from '@/components/dictionaries/helpers'
import EntryBox from '@/components/EntryBox'

export const DictWeblio: FC<ViewPorps<WeblioResult>> = ({ result }) => (
  <div className="dictWeblio-Container">
    {result.map(({ title, def }) => (
      <EntryBox
        key={title}
        className="dictWeblio-Entry"
        title={<span dangerouslySetInnerHTML={{ __html: title }} />}
      >
        <div dangerouslySetInnerHTML={{ __html: def }} />
      </EntryBox>
    ))}
  </div>
)

export default DictWeblio
