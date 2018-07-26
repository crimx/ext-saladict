import React from 'react'
import { GoogleResult } from './engine'
import Speaker from '@/components/Speaker'

export default class DictGoogle extends React.PureComponent<{ result: GoogleResult }> {
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
