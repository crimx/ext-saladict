import React from 'react'
import { GoogleDictResult } from './engine'
import { withStaticSpeaker } from '@/components/withStaticSpeaker'
import { ViewPorps } from '@/components/dictionaries/helpers'

export default withStaticSpeaker((props: ViewPorps<GoogleDictResult>) => (
  <div
    className='dictGoogleDict-Entry'
    dangerouslySetInnerHTML={{ __html: props.result.entry }}
  />
))
