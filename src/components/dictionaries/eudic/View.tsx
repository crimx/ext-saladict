import React from 'react'
import { EudicResult } from './engine'
import Speaker from '@/components/Speaker'
import { ViewPorps } from '@/components/dictionaries/helpers'

export default class DictEudic extends React.PureComponent<ViewPorps<EudicResult>> {
  render () {
    return (
      <ul className='dictEudic-List'>
        {this.props.result.map(item => (
          <li key={item.chs} className='dictEudic-Item'>
            <p>{item.eng} <Speaker src={item.mp3} /></p>
            <p>{item.chs}</p>
            <footer>
            {item.channel &&
              <p className='dictEudic-Channel'>{item.channel}</p>
            }
            </footer>
          </li>
        ))}
      </ul>
    )
  }
}
