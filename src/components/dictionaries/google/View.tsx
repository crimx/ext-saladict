import React from 'react'
import { GoogleResult } from './engine'

export default class DictGoogle extends React.PureComponent<{ result: GoogleResult }> {
  render () {
    return this.props.result
      ? <p>{this.props.result}</p>
      : null
  }
}
