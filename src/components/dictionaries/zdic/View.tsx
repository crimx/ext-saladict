import React, { FC } from 'react'
import { ZdicResult } from './engine'
import { ViewPorps } from '@/components/dictionaries/helpers'
import EntryBox from '@/components/EntryBox'

export const DictZdic: FC<ViewPorps<ZdicResult>> = ({ result }) => (
  <div>
    {result.map(entry => (
      <EntryBox title={entry.title} key={entry.title}>
        <div dangerouslySetInnerHTML={{ __html: entry.content }} />
      </EntryBox>
    ))}
  </div>
)

export default DictZdic
