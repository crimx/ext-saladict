import React from 'react'
import Speaker from '@/components/Speaker'
import StarRates from '@/components/StarRates'
import { COBUILDResult, COBUILDCibaResult, COBUILDColResult } from './engine'
import { ViewPorps } from '@/components/dictionaries/helpers'

interface COBUILDState {
  curTab: string
}

export default class DictCOBUILD extends React.PureComponent<ViewPorps<COBUILDResult>, COBUILDState> {
  state: COBUILDState = {
    curTab: ''
  }

  tabWheelDebounce: any

  handleTabClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault()
    this.setState({ curTab: e.currentTarget.dataset.id || '' })
  }

  handleTabWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    e.stopPropagation()
    e.preventDefault()
    const { currentTarget, deltaY } = e

    clearTimeout(this.tabWheelDebounce)
    this.tabWheelDebounce = setTimeout(() => {
      currentTarget.scrollBy({
        left: deltaY > 0 ? 250 : -250,
        behavior: 'smooth'
      })
    }, 50)
  }

  renderCiba (result: COBUILDCibaResult) {
    return (
      <>
        <h1 className='dictCOBUILD-Title'>{result.title}</h1>
        {result.prons &&
          <ul className='dictCOBUILD-Pron'>
            {result.prons.map(p => (
              <li key={p.phsym} className='dictCOBUILD-PronItem'>
                {p.phsym}
                <Speaker src={p.audio} />
              </li>
            ))}
          </ul>
        }
        <div className='dictCOBUILD-Rate'>
          {result.star as number >= 0 &&
            <StarRates rate={result.star} />
          }
          {result.level &&
            <span className='dictCOBUILD-Level'>{result.level}</span>
          }
        </div>
        {result.defs &&
          <ol className='dictCOBUILD-Defs'>
            {result.defs.map((def, i) => (
              <li className='dictCOBUILD-Def'
                key={i}
                dangerouslySetInnerHTML={{ __html: def }}
              />
            ))}
          </ol>
        }
      </>
    )
  }

  renderCollins (result: COBUILDColResult) {
    const curSec = this.state.curTab
      ? result.sections.find(({ id }) => id === this.state.curTab) || result.sections[0]
      : result.sections[0]

    return (
      <main className='dictCOBUILD-ColEntry'>
        <div className='dictionary'>
          <div className='res_cell_center'>
            <div className='dc res_cell_center_content'>
              <div className='navigation'>
                <div className='tabsNavigation' onWheel={this.handleTabWheel}>
                  {result.sections.map((section, i) => (
                    <a
                      key={section.id}
                      className={`tab${
                        (i === 0 && !this.state.curTab) || section.id === this.state.curTab
                          ? ' current'
                          : ''
                        }`
                      }
                      href='#'
                      data-id={section.id}
                      onClick={this.handleTabClick}
                    >
                      {section.type}
                      {section.title ? ` :${section.title}` : ''}
                      {section.num ? <span className='expo'>{section.num}</span> : ''}
                    </a>
                  ))}
                </div>
              </div>
              <div className='he'>
                <div className='page'>
                  <div className='dictionary'>
                    <div className='dictentry'>
                      <div className='dictlink'>
                        <div
                          key={curSec.id}
                          className={curSec.className}
                          dangerouslySetInnerHTML={{ __html: curSec.content }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    )
  }

  render () {
    const { result } = this.props
    switch (result.type) {
      case 'ciba': return this.renderCiba(result as COBUILDCibaResult)
      case 'collins': return this.renderCollins(result as COBUILDColResult)
      default: return ''
    }
  }
}
