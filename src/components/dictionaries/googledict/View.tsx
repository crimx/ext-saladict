import React, { FC } from 'react'
import { GoogleDictResult } from './engine'
import { ViewPorps } from '@/components/dictionaries/helpers'

export const DictGoogleDict: FC<ViewPorps<GoogleDictResult>> = ({ result }) => (
  <div dangerouslySetInnerHTML={{ __html: result.entry }} />
)

export default DictGoogleDict
