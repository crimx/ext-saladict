import React from 'react'
import CSSTransition from 'react-transition-group/CSSTransition'
import { translate, TranslationFunction } from 'react-i18next'
import SocialMedia from '../SocialMedia'

import './_style.scss'

export class OptMenu extends React.PureComponent<{ t: TranslationFunction }> {
  _showSocialMediaTimeout: any

  state = {
    isShowAcknowledgement: false,
    isShowSocial: false,
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

  preventDefault = (e: React.MouseEvent<HTMLElement>) => e.preventDefault()

  render () {
    const { t } = this.props

    return (
      <ul className='head-info'>
        <li className='head-info-acknowledgement-wrap'>
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
              className='head-info-acknowledgement'
              onMouseEnter={this.showAcknowledgement}
              onMouseLeave={this.hideAcknowledgement}
            >
              <ol>
                <li>
                  <a
                    href='https://github.com/stockyman'
                    rel='nofollow'
                    target='_blank'
                  >stockyman</a> {t('opt:head_info_acknowledgement_trans_tw')}
                </li>
                <li>
                  <a
                    href='https://github.com/caerlie'
                    rel='nofollow'
                    target='_blank'
                  >caerlie</a> {t('opt:head_info_acknowledgement_weblio')}
                </li>
              </ol>
            </div>
          )}</CSSTransition>
        </li>
        <li>
          <a
            href='https://github.com/crimx/ext-saladict/wiki#wiki-content'
            target='_blank'
            rel='noopener'>{t('opt:head_info_instructions')}</a>
        </li>
        <li className='head-info-social-media-wrap'>
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
              className='head-info-social-media'
              onMouseEnter={this.showSocialMedia}
              onMouseLeave={this.hideSocialMedia}
              >
              <SocialMedia />
            </div>
          )}</CSSTransition >
        </li>
        <li>
          <a
            href='https://github.com/crimx/ext-saladict/issues'
            target='_blank'
            rel='noopener'
          >{t('opt:head_info_report_issue')}</a>
        </li>
      </ul>
    )
  }
}

export default translate()(OptMenu)
