import React, { FC } from 'react'
import { VocabularyResult } from './engine'
import { ViewPorps } from '@/components/dictionaries/helpers'

export const DictVocabulary: FC<ViewPorps<VocabularyResult>> = ({ result }) => (
  <>
    <p className="dictVocabulary-Short">{result.short}</p>
    <p className="dictVocabulary-Long">{result.long}</p>
  </>
)

export default DictVocabulary
