import React from 'react'
import Speaker from '@/components/Speaker'
import StarRates from '@/components/StarRates'
import { COBUILDResult, COBUILDCibaResult, COBUILDColResult } from './engine'
import { ViewPorps } from '@/components/dictionaries/helpers'
import { withStaticSpeaker } from '@/components/withStaticSpeaker'

interface COBUILDColState {
  curTab: string
}

export class DictCOBUILDCol extends React.Component<ViewPorps<COBUILDColResult>, COBUILDColState> {
  state: COBUILDColState = {
    curTab: ''
  }

  navRef = React.createRef<HTMLDivElement>()

  tabWheelDebounce: any

  handleTabWheel = (e: WheelEvent) => {
    e.stopPropagation()
    e.preventDefault()
    const { currentTarget, deltaY } = e

    clearTimeout(this.tabWheelDebounce)
    this.tabWheelDebounce = setTimeout(() => {
      (currentTarget as HTMLDivElement).scrollBy({
        left: deltaY > 0 ? 250 : -250,
        behavior: 'smooth'
      })
    }, 80)
  }

  updateWheelListener = () => {
    if (this.navRef.current) {
      this.navRef.current.removeEventListener('wheel', this.handleTabWheel)
      this.navRef.current.addEventListener('wheel', this.handleTabWheel, { passive: false })
    }
  }

  handleTabClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.stopPropagation()
    e.preventDefault()
    this.setState({ curTab: e.currentTarget.dataset.id || '' })
  }

  componentDidMount () {
    this.updateWheelListener()
  }

  componentDidUpdate () {
    this.updateWheelListener()
  }

  render () {
    const { result } = this.props

    const curSec = this.state.curTab
      ? result.sections.find(({ id }) => id === this.state.curTab) || result.sections[0]
      : result.sections[0]

    return (
      <main className='dictCOBUILD-ColEntry'>
        <div className='dictionary'>
          <div className='dc'>
            <div className='navigation'>
              <div className='tabsNavigation' ref={this.navRef}>
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
      </main>
    )
  }
}

export const DictCOBUILDColWithSpeaker = withStaticSpeaker(DictCOBUILDCol)

export function DictCOBUILDCiba (result: COBUILDCibaResult) {
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

export default class DictCOBUILD extends React.PureComponent<ViewPorps<COBUILDResult>> {
  render () {
    const { result } = this.props
    switch (result.type) {
      case 'ciba': return DictCOBUILDCiba(result as COBUILDCibaResult)
      case 'collins': return <DictCOBUILDColWithSpeaker {...this.props as ViewPorps<COBUILDColResult>} />
      default: return ''
    }
  }
}
