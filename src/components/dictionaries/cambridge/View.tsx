import React from 'react'
import Speaker from '@/components/Speaker'
import { CambridgeResult } from './engine'

export interface DictCambridgeProps {
  result: CambridgeResult
  recalcBodyHeight: () => any
}

export default class DictCambridge extends React.PureComponent<DictCambridgeProps> {
  handleEntryClick = (e: React.MouseEvent<HTMLElement>) => {
    const target = e.nativeEvent.target as HTMLDivElement
    if (target.classList && target.classList.contains('js-accord')) {
      target.classList.toggle('open')
      this.props.recalcBodyHeight()
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
          <div className='dictCambridge-Prons'>
            {entry.prons.map((p, i) => (
              <React.Fragment key={p.pron}>
                {p.phsym} <Speaker src={p.pron} /> {p.phsym.trim().startsWith('us') ? <br/> : null}
              </React.Fragment>
            ))}
          </div>
        }
        <div dangerouslySetInnerHTML={{ __html: entry.defs }} />
      </section>
    ))
  }
}
