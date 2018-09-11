import React from 'react'
import { WeblioResult } from './engine'

export default class DictWeblio extends React.PureComponent<{ result: WeblioResult }> {
  render () {
    return (
      <div className='dictWeblio-Container'>{
        this.props.result.map(({ title, def }) => (
          <div className='dictWeblio-Entry'>
            <h2 className='dictWeblio-Title' dangerouslySetInnerHTML={{ __html: title }} />
            <div dangerouslySetInnerHTML={{ __html: def }} />
          </div>
        ))
      }</div>
    )
  }
}
