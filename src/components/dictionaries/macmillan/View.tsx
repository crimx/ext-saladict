import React from 'react'
import Speaker from '@/components/Speaker'
import StarRates from '@/components/StarRates'
import { MacmillanResult, MacmillanResultLex, MacmillanResultRelated } from './engine'
import { ViewPorps } from '@/components/dictionaries/helpers'

export default class DictMacmillan extends React.PureComponent<ViewPorps<MacmillanResult>> {
  renderLex (result: MacmillanResultLex) {
    return result.items.map(def => (
      <section key={def.senses}>
        <h1 className='dictMacmillan-Title'>{def.title}</h1>
        <header className='dictMacmillan-Header'>
          {def.ratting && <StarRates rate={def.ratting} />}
          <span className='dictMacmillan-Header_Info'>
            {def.phsym} <Speaker src={def.pron} /> {def.pos} {def.sc}
          </span>
        </header>
        <ol className='dictMacmillan-Sences' dangerouslySetInnerHTML={{ __html: def.senses }} />
      </section>
    ))
  }

  renderRelated (result: MacmillanResultRelated) {
    return (
      <>
        <p>Did you mean:</p>
        <ul className='dictMacmillan-Related' dangerouslySetInnerHTML={{ __html: result.list }} />
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
