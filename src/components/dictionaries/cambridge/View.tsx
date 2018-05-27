import React from 'react'
import Speaker from '@/components/Speaker'
import { CambridgeResult } from './engine'

export default class DictCambridge extends React.PureComponent<{ result: CambridgeResult }> {
  handleEntryClick = (e: React.MouseEvent<HTMLElement>) => {
    const target = e.nativeEvent.target as HTMLDivElement
    if (target.classList && target.classList.contains('js-accord')) {
      target.classList.toggle('open')
    }
  }

  render () {
    const { result } = this.props
    return result.map(entry => (
      <section key={entry.defs} className='dictCambridge-Entry' onClick={this.handleEntryClick}>
        <header className='dictCambridge-Header'>
          <h1 className='dictCambridge-Title'>{entry.title}</h1>
          <span dangerouslySetInnerHTML={{ __html: entry.pos }} />
        </header>
        {entry.prons.length > 0 &&
          <div>
            {entry.prons.map(p => (
              <React.Fragment key={p.pron}>
                {p.phsym} <Speaker src={p.pron} />
              </React.Fragment>
            ))}
          </div>
        }
        <div dangerouslySetInnerHTML={{ __html: entry.defs }} />
      </section>
    ))
  }
}
