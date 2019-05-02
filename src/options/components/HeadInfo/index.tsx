import React from 'react'
import CSSTransition from 'react-transition-group/CSSTransition'
import { translate, TranslationFunction } from 'react-i18next'
import { Tooltip, Icon } from 'antd'
import SocialMedia from '../SocialMedia'
import acknowledgement from '@/options/acknowledgement'

import './_style.scss'

interface OptMenuState {
  isShowAcknowledgement: boolean
  isShowSocial: boolean
  isShowDonate: boolean
}

export class OptMenu extends React.PureComponent<{ t: TranslationFunction }, OptMenuState> {
  _showSocialMediaTimeout: any

  state = {
    isShowAcknowledgement: false,
    isShowSocial: false,
    isShowDonate: false,
  }

  showAcknowledgement = () => {
    this.setState({ isShowAcknowledgement: true })
  }

  hideAcknowledgement = () => {
    this.setState({ isShowAcknowledgement: false })
  }

  showSocialMedia = () => {
    clearTimeout(this._showSocialMediaTimeout)
    this.setState({ isShowSocial: true })
  }

  hideSocialMedia = () => {
    clearTimeout(this._showSocialMediaTimeout)
    this._showSocialMediaTimeout = setTimeout(() => {
      this.setState({ isShowSocial: false })
    }, 400)
  }

  showDonate = () => {
    this.setState({ isShowDonate: true })
  }

  hideDonate = () => {
    this.setState({ isShowDonate: false })
  }

  preventDefault = (e: React.MouseEvent<HTMLElement>) => e.preventDefault()

  render () {
    const { t } = this.props

    return (
      <ul className='head-info'>
        {process.env.DEV_BUILD || process.env.SDAPP_VETTED
          ? null
          : <li className='head-info-bubble-wrap'>
            <Tooltip
              placement='bottom'
              title={decodeURI('%E6%AD%A4%E6%89%A9%E5%B1%95%E5%B7%B2%E8%A2%AB%E5%86%8D%E6%AC%A1%E6%89%93%E5%8C%85%EF%BC%8C%E5%8F%AF%E8%83%BD%E5%B7%B2%E8%A2%AB%E5%8A%A0%E5%85%A5%E6%81%B6%E6%84%8F%E4%BB%A3%E7%A0%81%EF%BC%8C%E8%AF%B7%E5%89%8D%E5%BE%80%E3%80%8C%E6%B2%99%E6%8B%89%E6%9F%A5%E8%AF%8D%E3%80%8D%E5%AE%98%E6%96%B9%E5%BB%BA%E8%AE%AE%E7%9A%84%E5%B9%B3%E5%8F%B0%E5%AE%89%E8%A3%85')}
            >
              <span style={{ color: '#fff' }}>
                <Icon type='warning' /> {decodeURI('%E6%BD%9C%E5%9C%A8%E5%A8%81%E8%83%81')}
              </span>
            </Tooltip>
          </li>
        }
        <li className='head-info-bubble-wrap'>
          <a
            href='https://github.com/crimx/ext-saladict/wiki#acknowledgement'
            onMouseEnter={this.showAcknowledgement}
            onMouseLeave={this.hideAcknowledgement}
            onClick={this.preventDefault}>{t('opt:head_info_acknowledgement')}</a>
          <CSSTransition
            classNames='head-info-fade'
            in={this.state.isShowAcknowledgement}
            timeout={500}
            mountOnEnter
            unmountOnExit
          >{() => (
            <div
              className='head-info-bubble'
              onMouseEnter={this.showAcknowledgement}
              onMouseLeave={this.hideAcknowledgement}
            >
              <ol>
                {acknowledgement.map(ack => (
                  <li key={ack.locale}>
                    <a
                      href={ack.href}
                      rel='nofollow noopener noreferrer'
                      target='_blank'
                    >{ack.name}</a> {t(`opt:head_info_acknowledgement_${ack.locale}`)}
                  </li>
                ))}
              </ol>
            </div>
          )}</CSSTransition>
        </li>
        <li>
          <a
            href='https://github.com/crimx/ext-saladict/wiki#wiki-content'
            target='_blank'
            rel='nofollow noopener noreferrer'
          >{t('opt:head_info_instructions')}</a>
        </li>
        <li className='head-info-bubble-wrap'>
          <a
            href='mailto:straybugsgmail.com'
            onMouseEnter={this.showSocialMedia}
            onMouseLeave={this.hideSocialMedia}
            onClick={this.preventDefault}>{t('opt:head_info_contact_author')}</a>
          <CSSTransition
            classNames='head-info-fade'
            in={this.state.isShowSocial}
            timeout={500}
            mountOnEnter
            unmountOnExit
          >{() => (
            <div
              className='head-info-bubble'
              onMouseEnter={this.showSocialMedia}
              onMouseLeave={this.hideSocialMedia}
            >
              <SocialMedia />
            </div>
          )}</CSSTransition >
        </li>
        <li className='head-info-bubble-wrap'>
          <a
            href='https://github.com/crimx/ext-saladict/wiki#user-content-reward'
            onMouseEnter={this.showDonate}
            onMouseLeave={this.hideDonate}
            onClick={this.preventDefault}>{t('opt:head_info_donate')}</a>
          <CSSTransition
            classNames='head-info-fade'
            in={this.state.isShowDonate}
            timeout={500}
            mountOnEnter
            unmountOnExit
          >{() => (
            <div
              className='head-info-bubble'
              onMouseEnter={this.showDonate}
              onMouseLeave={this.hideDonate}
            >
              <div className='head-info-donate'>
                <img
                  src={atob('aHR0cHM6Ly9naXRodWIuY29tL2NyaW14L2NyeC1zYWxhZGljdC93aWtpL2ltYWdlcy93ZWNoYXQucG5n')}
                  alt='wechat'
                />
                <img
                  src={atob('aHR0cHM6Ly9naXRodWIuY29tL2NyaW14L2NyeC1zYWxhZGljdC93aWtpL2ltYWdlcy9hbGlwYXkucG5n')}
                  alt='alipay'
                />
              </div>
              <p>{decodeURI('%E8%AE%BE%E8%AE%A1%E4%B8%8E%E5%BC%80%E5%8F%91%E6%9C%AC%E6%89%A9%E5%B1%95%E5%9D%87%E7%94%B1%E4%BD%9C%E8%80%85%E4%B8%80%E4%BA%BA%E8%8A%B1%E8%B4%B9%E5%A4%A7%E9%87%8F%E7%A7%81%E4%BA%BA%E6%97%B6%E9%97%B4%E4%B8%8E%E7%B2%BE%E5%8A%9B%E5%AE%8C%E6%88%90%EF%BC%8C%E5%B9%B6%E6%89%BF%E8%AF%BA%E4%B8%80%E7%9B%B4%E5%BC%80%E6%BA%90%E5%85%8D%E8%B4%B9%E6%97%A0%E5%B9%BF%E5%91%8A%EF%BC%8C%E6%AC%A2%E8%BF%8E%E9%9A%8F%E5%96%9C%E6%89%93%E8%B5%8F%E4%BB%A5%E6%94%AF%E6%8C%81%E6%8C%81%E7%BB%AD%E5%BC%80%E5%8F%91%E3%80%82')}</p>
            </div>
          )}</CSSTransition >
        </li>
        <li>
          <a
            href='https://github.com/crimx/ext-saladict/issues'
            target='_blank'
            rel='nofollow noopener noreferrer'
          >{t('opt:head_info_report_issue')}</a>
        </li>
      </ul>
    )
  }
}

export default translate()(OptMenu)
