import React from 'react'
import { WeblioejjeResult } from './engine'
import EntryBox from '@/components/EntryBox'
import { ViewPorps } from '@/components/dictionaries/helpers'
import { withStaticSpeaker } from '@/components/withStaticSpeaker'

export class DictWeblioejje extends React.PureComponent<ViewPorps<WeblioejjeResult>> {
  render () {
    return (
      <div className='dictWeblioejje-Entry'>
        {this.props.result.map((entry, i) => entry.title
          ? (
            <EntryBox key={entry.title + i} title={entry.title}>
              <div dangerouslySetInnerHTML={{ __html: entry.content }} />
            </EntryBox>
          )
          : <div
              key={i}
              className='dictWeblioejje-Box'
              dangerouslySetInnerHTML={{ __html: entry.content }}
            />
        )}
      </div>
    )
  }
}

export default withStaticSpeaker(DictWeblioejje)
