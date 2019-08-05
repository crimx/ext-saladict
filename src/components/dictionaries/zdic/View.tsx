import React, { FC } from 'react'
import { ZdicResult } from './engine'
import { ViewPorps } from '@/components/dictionaries/helpers'
import EntryBox from '@/components/EntryBox'
import { StaticSpeakerContainer } from '@/components/Speaker'

export const DictZdic: FC<ViewPorps<ZdicResult>> = ({ result }) => (
  <StaticSpeakerContainer>
    {result.map(entry => (
      <EntryBox title={entry.title} key={entry.title}>
        <div dangerouslySetInnerHTML={{ __html: entry.content }} />
      </EntryBox>
    ))}
  </StaticSpeakerContainer>
)

export default DictZdic
