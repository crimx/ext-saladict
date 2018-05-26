import React from 'react'
import Speaker from '@/components/Speaker'
import { LearnersDictResult, LearnersDictResultLex, LearnersDictResultRelated } from './engine'

export default class DictLearnersDict extends React.PureComponent<{ result: LearnersDictResult }> {
  renderLex (result: LearnersDictResultLex) {
    return result.items.map(entry => (
      <section key={entry.title} className='dictLearnersDict-Entry'>
        <header className='dictLearnersDict-Header'>
          <span className='hw_d hw_0' dangerouslySetInnerHTML={{ __html: entry.title }} />
          <Speaker src={entry.pron} />
        </header>
        {entry.infs &&
          <div className='dictLearnersDict-Header'>
            <span className='hw_infs_d' dangerouslySetInnerHTML={{ __html: entry.infs }} />
            <Speaker src={entry.infsPron} />
          </div>
        }
        {entry.labels &&
          <div className='labels' dangerouslySetInnerHTML={{ __html: entry.labels }} />
        }
        {entry.senses &&
          <div className='sblocks' dangerouslySetInnerHTML={{ __html: entry.senses }} />
        }
        {entry.arts && entry.arts.length > 0 && entry.arts.map(src => (
          <img key={src} src={src} />
        ))}
        {entry.phrases &&
          <div className='dros' dangerouslySetInnerHTML={{ __html: entry.phrases }} />
        }
        {entry.derived &&
          <div className='uros' dangerouslySetInnerHTML={{ __html: entry.derived }} />
        }
      </section>
    ))
  }

  renderRelated (result: LearnersDictResultRelated) {
    return (
      <>
        <p>Did you mean:</p>
        <ul className='dictLearnersDict-Related' dangerouslySetInnerHTML={{ __html: result.list }} />
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
