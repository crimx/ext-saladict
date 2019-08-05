import React, { FC } from 'react'
import { WeblioejjeResult } from './engine'
import EntryBox from '@/components/EntryBox'
import { ViewPorps } from '@/components/dictionaries/helpers'
import { StaticSpeakerContainer } from '@/components/Speaker'

export const DictWeblioejje: FC<ViewPorps<WeblioejjeResult>> = ({ result }) => (
  <StaticSpeakerContainer>
    {result.map((entry, i) =>
      entry.title ? (
        <EntryBox key={entry.title + i} title={entry.title}>
          <div dangerouslySetInnerHTML={{ __html: entry.content }} />
        </EntryBox>
      ) : (
        <div
          key={i}
          className="dictWeblioejje-Box"
          dangerouslySetInnerHTML={{ __html: entry.content }}
        />
      )
    )}
  </StaticSpeakerContainer>
)

export default DictWeblioejje
