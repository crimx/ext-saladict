import React, { FC } from 'react'
import { WeblioejjeResult } from './engine'
import EntryBox from '@/components/EntryBox'
import { ViewPorps } from '@/components/dictionaries/helpers'
import { StrElm } from '@/components/StrElm'

export const DictWeblioejje: FC<ViewPorps<WeblioejjeResult>> = ({ result }) => (
  <div>
    {result.map((entry, i) =>
      entry.title ? (
        <EntryBox key={entry.title + i} title={entry.title}>
          <StrElm html={entry.content} />
        </EntryBox>
      ) : (
        <StrElm key={i} className="dictWeblioejje-Box" html={entry.content} />
      )
    )}
  </div>
)

export default DictWeblioejje
