import React from 'react'
import { SogouResult } from './engine'
import Speaker from '@/components/Speaker'
import { ViewPorps } from '@/components/dictionaries/helpers'

export default class DictSogou extends React.PureComponent<ViewPorps<SogouResult>> {
  render () {
    const {
      trans,
      searchText,
    } = this.props.result
    return (
      <>
        <p>{trans.text} <Speaker src={trans.audio} /></p>
        <p>{searchText.text} <Speaker src={searchText.audio} /></p>
      </>
    )
  }
}
