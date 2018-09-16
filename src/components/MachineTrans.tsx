import React from 'react'
import Speaker from '@/components/Speaker'
import { ViewPorps, MachineTranslateResult } from '@/components/dictionaries/helpers'

export default class MachineTrans extends React.PureComponent<ViewPorps<MachineTranslateResult>> {
  state = {
    sl: this.props.result.sl,
    tl: this.props.result.tl,
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

  render () {
    const { t } = this.props
    const {
      langcodes,
      trans,
      searchText,
    } = this.props.result
    return (
      <>
        <p>{trans.text} <Speaker src={trans.audio} /></p>
        <p>{searchText.text} <Speaker src={searchText.audio} /></p>
        <br/>
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
      </>
    )
  }
}
