import React from 'react'
import { VocabularyResult } from './engine'
import { ViewPorps } from '@/components/dictionaries/helpers'

export default class DictVocabulary extends React.PureComponent<ViewPorps<VocabularyResult>> {
  render () {
    const { long, short } = this.props.result
    return (
      <>
        <p className='dictVocabulary-Short'>{short}</p>
        <p className='dictVocabulary-Long'>{long}</p>
      </>
    )
  }
}
