import React from 'react'
import CSSTransition from 'react-transition-group/CSSTransition'
import Speaker from '@/components/Speaker'
import { ViewPorps, MachineTranslateResult } from '@/components/dictionaries/helpers'
import { DictID } from '@/app-config'

export default class MachineTrans extends React.PureComponent<ViewPorps<MachineTranslateResult<DictID>>> {
  state = {
    sl: this.props.result.sl,
    tl: this.props.result.tl,
    isShowLang: false,
  }

  _showLangTimeout: any

  showLang = () => {
    this.setState({ isShowLang: true })
  }

  hideLang = () => {
    this.setState({ isShowLang: false })
  }

  showLangDelay = () => {
    clearTimeout(this._showLangTimeout)
    if (this.state.isShowLang) { return }
    setTimeout(this.showLang, 500)
  }

  hideLangDelay = () => {
    clearTimeout(this._showLangTimeout)
    if (!this.state.isShowLang) { return }
    setTimeout(this.hideLang, 800)
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

  renderLangSwitch = () => {
    const { t } = this.props
    const { langcodes } = this.props.result

    return (
      <div
        className='MachineTrans-LangSwitch'
        onMouseOver={this.showLangDelay}
        onMouseLeave={this.hideLangDelay}
      >
        <div className='MachineTrans-LangSwitch_Titles'>
          <span>{t('machineTransTL')}{': '}</span>
          <span>{t('machineTransSL')}{': '}</span>
        </div>
        <div className='MachineTrans-LangSwitch_Selects'>
          <select name='tl' value={this.state.tl} onChange={this.handleLangChanged}>
            {langcodes.map(code => (
              <option key={code} value={code}>{code} {t('langcode:' + code)}</option>
            ))}
          </select>
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
    const { isShowLang } = this.state

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
        <div className='MachineTrans-LangSwitchWrap'>
          <button
            className={`MachineTrans-LangSwitchBtn${isShowLang ? '' : ' isActive'}`}
            style={{ opacity: isShowLang ? 0 : 1 }}
            onClick={this.showLang}
            onMouseOver={this.showLangDelay}
          >{t('machineTransSwitch')}</button>
          <CSSTransition
            classNames='MachineTrans-LangSwitch'
            in={isShowLang}
            timeout={200}
            appear
            mountOnEnter
            unmountOnExit
            onEntered={this.props.recalcBodyHeight}
            onExited={this.props.recalcBodyHeight}
          >
            {this.renderLangSwitch}
          </CSSTransition>
        </div>
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
