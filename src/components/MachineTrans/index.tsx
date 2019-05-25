import React from 'react'
import Speaker from '@/components/Speaker'
import { ViewPorps, MachineTranslateResult } from '@/components/dictionaries/helpers'
import { DictID } from '@/app-config'

export default class MachineTrans extends React.PureComponent<ViewPorps<MachineTranslateResult<DictID>>> {
  state = {
    sl: this.props.result.sl,
    tl: this.props.result.tl,
    isShowLang: false,
  }

  handleShowLang = () => {
    this.setState({ isShowLang: true }, () => this.props.recalcBodyHeight())
  }

  handleLangChanged = (e: React.ChangeEvent<HTMLSelectElement>) => {
    this.setState(
      { [e.currentTarget.name]: e.currentTarget.value },
      () => {
        this.props.searchText({
          id: this.props.result.id,
          payload: {
            sl: this.state.sl,
            tl: this.state.tl
          },
        })
      }
    )
  }

  renderLangSwitch () {
    const { t } = this.props
    const { langcodes } = this.props.result

    return (
      <div className='MachineTrans-LangSwitch'>
        <div>
          <span>{t('machineTransTL')}</span>{': '}
          <select name='tl' value={this.state.tl} onChange={this.handleLangChanged}>
            {langcodes.map(code => (
              <option key={code} value={code}>{code} {t('langcode:' + code)}</option>
            ))}
          </select>
        </div>
        <div>
          <span>{t('machineTransSL')}</span>{': '}
          <select name='sl' value={this.state.sl} onChange={this.handleLangChanged}>
            <option key='auto' value='auto'>{t('machineTransAuto')}</option>
            {langcodes.map(code => (
              <option key={code} value={code}>{code} {t('langcode:' + code)}</option>
            ))}
          </select>
        </div>
      </div>
    )
  }

  render () {
    const { t } = this.props
    const {
      trans,
      searchText,
    } = this.props.result
    return (
      <>
        <div className='MachineTrans-Text'>
          <TText source={trans} />
          {searchText.text.length <= 100
            ? <TText source={searchText} />
            : (
              <p>
                <details>
                  <summary onClick={this.props.recalcBodyHeight}>{
                    t('machineTransStext')
                  }</summary>
                  <TText source={searchText} />
                </details>
              </p>
            )
          }
        </div>
        {this.state.isShowLang
          ? this.renderLangSwitch()
          : <button
              className='MachineTrans-LangSwitchBtn'
              onClick={this.handleShowLang}
            >{t('machineTransSwitch')}</button>
        }
      </>
    )
  }
}

type TTextSource = MachineTranslateResult<DictID>['searchText'] |
  MachineTranslateResult<DictID>['trans']

function TText ({ source }: { source: TTextSource }) {
  if (!source.text) {
    return null
  }
  return (
    <div className='MachineTrans-Lines'>
      <Speaker src={source.audio} />
      {source.text.split('\n').map(
        (line, i) => <p key={i}>{line}</p>
      )}
    </div>
  )
}
