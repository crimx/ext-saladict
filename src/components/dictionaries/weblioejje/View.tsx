import React, { FC } from 'react'
import { WeblioejjeResult } from './engine'
import EntryBox from '@/components/EntryBox'
import { ViewPorps } from '@/components/dictionaries/helpers'

export const DictWeblioejje: FC<ViewPorps<WeblioejjeResult>> = ({ result }) => (
  <div>
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
  </div>
)

export default DictWeblioejje
