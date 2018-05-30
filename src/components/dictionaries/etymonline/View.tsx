import React from 'react'
import { EtymonlineResult } from './engine'

export default class DictEtymonline extends React.PureComponent<{ result: EtymonlineResult }> {
  render () {
    return (
      <ul className='dictEtymonline-List'>
        {this.props.result.map(item => (
          <li key={item.title} className='dictEtymonline-Item'>
            <h2 className='dictEtymonline-Title'>
              <a href={item.href} target='_blank'>{item.title}</a>
            </h2>
            <p className='dictEtymonline-Def' dangerouslySetInnerHTML={{ __html: item.def }} />
          </li>
        ))}
      </ul>
    )
  }
}
