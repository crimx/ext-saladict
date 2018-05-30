import React from 'react'
import { VocabularyResult } from './engine'

export default class DictVocabulary extends React.PureComponent<{ result: VocabularyResult }> {
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
