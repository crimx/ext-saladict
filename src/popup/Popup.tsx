import React from 'react'
import QRCode from 'qrcode.react'
import CSSTransition from 'react-transition-group/CSSTransition'
import { withTranslation, WithTranslation } from 'react-i18next'
import { AppConfig } from '@/app-config'
import { updateConfig } from '@/_helpers/config-manager'
import { message } from '@/_helpers/browser-api'

interface PopupProps {
  config: AppConfig
}

interface PopupState {
  currentTabUrl: string
  isShowUrlBox: boolean
  tempOff: boolean
  showPageNoResponse: boolean
  insCapMode: 'mode' | 'pinMode'
}

export class Popup extends React.Component<
  PopupProps & WithTranslation,
  PopupState
> {
  state: PopupState = {
    currentTabUrl: '',
    isShowUrlBox: false,
    tempOff: false,
    showPageNoResponse: false,
    insCapMode: 'mode' as 'mode' | 'pinMode'
  }

  activeContainer = () => {
    const $frameRoot = document.querySelector<HTMLDivElement>('#frame-root')
    if ($frameRoot) {
      $frameRoot.style.height = '400px'
    }
  }

  hideContainer = () => {
    const $frameRoot = document.querySelector<HTMLDivElement>('#frame-root')
    if ($frameRoot) {
      $frameRoot.style.height = '500px'
      this.setState({ currentTabUrl: '' })
    }
  }

  changeTempOff = () => {
    const oldTempOff = this.state.tempOff
    const newTempOff = !oldTempOff

    this.setState({ tempOff: newTempOff })

    browser.tabs
      .query({ active: true, currentWindow: true })
      .then(tabs => {
        if (tabs.length > 0 && tabs[0].id != null) {
          return message.send<'TEMP_DISABLED_STATE'>(tabs[0].id, {
            type: 'TEMP_DISABLED_STATE',
            payload: {
              op: 'set',
              value: newTempOff
            }
          })
        }
        return false
      })
      .then(isSuccess => {
        if (!isSuccess) {
          this.setState({ tempOff: oldTempOff })
          throw new Error('Set tempOff failed')
        }
      })
      .catch(() => this.setState({ showPageNoResponse: true }))
  }

  changeInsCap = () => {
    const { config } = this.props
    const { insCapMode } = this.state
    const newConfig: AppConfig = {
      ...config,
      [insCapMode]: {
        ...config[insCapMode],
        instant: {
          ...config[insCapMode].instant,
          enable: !config[insCapMode].instant.enable
        }
      }
    }
    updateConfig(newConfig)
  }

  showQRcode = async () => {
    const tabs = await browser.tabs.query({ active: true, currentWindow: true })
    if (tabs.length > 0) {
      const url = tabs[0].url
      if (url) {
        if (!url.startsWith('http')) {
          const match = /static\/pdf\/web\/viewer\.html\?file=(.*)$/.exec(url)
          if (match) {
            this.setState({
              isShowUrlBox: true,
              currentTabUrl: decodeURIComponent(match[1])
            })
            return
          }
        }
        this.setState({
          isShowUrlBox: false,
          currentTabUrl: url
        })
      }
    }
  }

  changeActive = () => {
    const { config } = this.props
    const newConfig = {
      ...config,
      active: !config.active
    }
    updateConfig(newConfig)
  }

  clearCurrentTabUrl = () => {
    this.setState({ currentTabUrl: '' })
  }

  renderQRPanel = () => {
    const { t } = this.props
    const { isShowUrlBox, currentTabUrl, showPageNoResponse } = this.state
    return (
      <div className="qrcode-panel" onMouseLeave={this.clearCurrentTabUrl}>
        <QRCode value={currentTabUrl} size={250} />
        <p className="qrcode-panel-title">
          {isShowUrlBox ? (
            <input
              type="text"
              autoFocus
              readOnly
              value={currentTabUrl}
              onFocus={e => e.currentTarget.select()}
            />
          ) : (
            <span>{t('qrcode_title')}</span>
          )}
        </p>
        {showPageNoResponse && (
          <div className="page-no-response-panel">
            <p className="page-no-response-title">{t('page_no_response')}</p>
          </div>
        )}
      </div>
    )
  }

  componentDidMount() {
    browser.tabs
      .query({ active: true, currentWindow: true })
      .then(tabs => {
        if (tabs.length > 0 && tabs[0].id != null) {
          message
            .send<'TEMP_DISABLED_STATE'>(tabs[0].id, {
              type: 'TEMP_DISABLED_STATE',
              payload: { op: 'get' }
            })
            .then(flag => {
              this.setState({ tempOff: flag })
            })

          message
            .send<'QUERY_PANEL_STATE', boolean>(tabs[0].id, {
              type: 'QUERY_PANEL_STATE',
              payload: 'widget.isPinned'
            })
            .then(isPinned => {
              this.setState({ insCapMode: isPinned ? 'pinMode' : 'mode' })
            })
        }
      })
      .catch(err =>
        console.warn('Error when receiving MsgTempDisabled response', err)
      )
  }

  render() {
    const { t, config } = this.props
    const { currentTabUrl, tempOff, insCapMode } = this.state

    return (
      <div
        className="switch-container"
        onMouseEnter={this.activeContainer}
        onMouseLeave={this.hideContainer}
      >
        <div className="active-switch">
          <span className="switch-title">{t('app_temp_active_title')}</span>
          <input
            type="checkbox"
            id="opt-temp-active"
            className="btn-switch"
            checked={tempOff}
            onClick={this.changeTempOff}
            onFocus={this.activeContainer}
          />
          <label htmlFor="opt-temp-active"></label>
        </div>
        <div className="active-switch">
          <span className="switch-title">
            {t('instant_capture_title') +
              (insCapMode === 'pinMode' ? t('instant_capture_pinned') : '')}
          </span>
          <input
            type="checkbox"
            id="opt-instant-capture"
            className="btn-switch"
            checked={config[insCapMode].instant.enable}
            onClick={this.changeInsCap}
            onFocus={this.activeContainer}
          />
          <label htmlFor="opt-instant-capture"></label>
        </div>
        <div className="active-switch">
          <svg
            className="icon-qrcode"
            onMouseEnter={this.showQRcode}
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 612 612"
          >
            <path d="M0 225v25h250v-25H0zM0 25h250V0H0v25z" />
            <path d="M0 250h25V0H0v250zm225 0h25V0h-25v250zM87.5 162.5h75v-75h-75v75zM362 587v25h80v-25h-80zm0-200h80v-25h-80v25z" />
            <path d="M362 612h25V362h-25v250zm190-250v25h60v-25h-60zm-77.5 87.5v25h50v-25h-50z" />
            <path d="M432 497.958v-25h-70v25h70zM474.5 387h50v-25h-50v25zM362 225v25h250v-25H362zm0-200h250V0H362v25z" />
            <path d="M362 250h25V0h-25v250zm225 0h25V0h-25v250zm-137.5-87.5h75v-75h-75v75zM0 587v25h250v-25H0zm0-200h250v-25H0v25z" />
            <path d="M0 612h25V362H0v250zm225 0h25V362h-25v250zM87.5 524.5h75v-75h-75v75zM587 612h25V441h-25v171zM474.5 499.5v25h50v-25h-50z" />
            <path d="M474.5 449.5v75h25v-75h-25zM562 587v25h50v-25h-50z" />
          </svg>
          <span className="switch-title">{t('app_active_title')}</span>
          <input
            type="checkbox"
            id="opt-active"
            className="btn-switch"
            checked={config.active}
            onClick={this.changeActive}
            onFocus={this.activeContainer}
          />
          <label htmlFor="opt-active"></label>
        </div>
        <CSSTransition
          classNames="fade"
          in={!!currentTabUrl}
          timeout={500}
          exit={false}
          mountOnEnter
          unmountOnExit
        >
          {this.renderQRPanel}
        </CSSTransition>
      </div>
    )
  }
}

export default withTranslation()(Popup)
