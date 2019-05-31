import React from 'react'
import { ZdicResult } from './engine'
import { ViewPorps } from '@/components/dictionaries/helpers'
import { withStaticSpeaker } from '@/components/withStaticSpeaker'
import EntryBox from '@/components/EntryBox'

export class DictZdic extends React.PureComponent<ViewPorps<ZdicResult>> {
  render () {
    return (
      <div className='dictZidc-Entry'>
        {this.props.result.map(entry => (
          <EntryBox title={entry.title} key={entry.title}>
            <div dangerouslySetInnerHTML={{ __html: entry.content }} />
          </EntryBox>
        ))}
      </div>
    )
  }
}

export default withStaticSpeaker(DictZdic)
