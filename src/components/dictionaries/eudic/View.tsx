import React from 'react'
import { EudicResult } from './engine'
import Speaker from '@/components/Speaker'

export default class DictEudic extends React.PureComponent<{ result: EudicResult }> {
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
