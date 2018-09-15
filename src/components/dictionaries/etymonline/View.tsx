import React from 'react'
import { EtymonlineResult } from './engine'
import { ViewPorps } from '@/components/dictionaries/helpers'

export default class DictEtymonline extends React.PureComponent<ViewPorps<EtymonlineResult>> {
  render () {
    return (
      <ul className='dictEtymonline-List'>
        {this.props.result.map(item => (
          <li key={item.title} className='dictEtymonline-Item'>
            <h2 className='dictEtymonline-Title'>
              {item.href
                ? <a href={item.href} target='_blank' rel='nofollow'>{item.title}</a>
                : item.title
              }
            </h2>
            <p className='dictEtymonline-Def' dangerouslySetInnerHTML={{ __html: item.def }} />
            {item.chart
              ? <img src={item.chart} alt={'Origin of ' + item.title} />
              : null
            }
          </li>
        ))}
      </ul>
    )
  }
}
