import React from 'react'
import Speaker from '@/components/Speaker'
import { OALDResult, OALDResultLex, OALDResultRelated } from './engine'

export default class DictOALD extends React.PureComponent<{ result: OALDResult }> {
  handleEntryClick = (e: React.MouseEvent<HTMLElement>) => {
    const target = e.nativeEvent.target as HTMLSpanElement
    if (target.classList && target.classList.contains('heading')) {
      (target.parentElement as HTMLDivElement).classList.toggle('is-active')
    }
  }

  renderLex (result: OALDResultLex) {
    return result.items.map(entry => (
      <section key={entry.title} className='dictOALD-Entry' onClick={this.handleEntryClick}>
        <header className='dictOALD-Header'>
          <div className='webtop-g' dangerouslySetInnerHTML={{ __html: entry.title }} />
          {entry.prons.length > 0 &&
            <div className='pron-gs ei-g'>
              {entry.prons.map(p => (
                <React.Fragment key={p.phsym}>
                  <span className='pron-g' dangerouslySetInnerHTML={{ __html: p.phsym }} />
                  <Speaker src={p.pron} />
                </React.Fragment>
              ))}
            </div>
          }
        </header>
        <span className='h-g' dangerouslySetInnerHTML={{ __html: entry.defs }} />
      </section>
    ))
  }

  renderRelated (result: OALDResultRelated) {
    return (
      <>
        <p>Did you mean:</p>
        <ul className='dictOALD-Related' dangerouslySetInnerHTML={{ __html: result.list }} />
      </>
    )
  }

  render () {
    const { result } = this.props
    switch (result.type) {
      case 'lex':
        return this.renderLex(result)
      case 'related':
        return this.renderRelated(result)
      default:
        return null
    }
  }
}
