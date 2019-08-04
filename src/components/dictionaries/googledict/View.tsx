import React, { FC } from 'react'
import { GoogleDictResult } from './engine'
import { ViewPorps } from '@/components/dictionaries/helpers'
import { StaticSpeakerContainer } from '@/components/Speaker'

export const DictGoogleDict: FC<ViewPorps<GoogleDictResult>> = ({ result }) => (
  <StaticSpeakerContainer dangerouslySetInnerHTML={{ __html: result.entry }} />
)

export default DictGoogleDict
