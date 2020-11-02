import React, {
  FC,
  useState,
  useEffect,
  useCallback,
  useLayoutEffect
} from 'react'
import classNames from 'classnames'
import QRCode from 'qrcode.react'
import CSSTransition from 'react-transition-group/CSSTransition'
import { AppConfig } from '@/app-config'
import { updateConfig, addConfigListener } from '@/_helpers/config-manager'
import { message } from '@/_helpers/browser-api'
import { useTranslate } from '@/_helpers/i18n'
import { DictPanelStandaloneContainer } from '@/content/components/DictPanel/DictPanelStandalone.container'

interface PopupProps {
  config: AppConfig
}

export const Popup: FC<PopupProps> = props => {
  const { t } = useTranslate('popup')

  const [config, setConfig] = useState(props.config)

  /** URL box with QR code */
  const [isShowUrlBox, setIsShowUrlBox] = useState(false)
  const [currentTabUrl, setCurrentTabUrl] = useState('')

  const [dictPanelHeight, setDictPanelHeight] = useState(30)
  const expandDictPanel = useCallback(
    () => setDictPanelHeight(config.baHeight - 51),
    [config.baHeight]
  )
  const shrinkDictPanel = useCallback(
    () => setDictPanelHeight(config.baHeight - 151),
    [config.baHeight]
  )

  /** Instant Capture Mode */
  const [insCapMode, setInsCapMode] = useState<'mode' | 'pinMode'>('mode')

  const [isTempOff, setTempOff] = useState(false)

  const [isShowPageNoResponse, setShowPageNoResponse] = useState(false)

  useLayoutEffect(() => {
    document.body.style.width =
      (config.baWidth >= 0 ? config.baWidth : config.panelWidth) + 'px'
  }, [config])

  useEffect(() => {
    expandDictPanel()

    addConfigListener(({ newConfig }) => {
      setConfig(newConfig)
    })

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
              setTempOff(flag)
            })

          message
            .send<'QUERY_PIN_STATE', boolean>(tabs[0].id, {
              type: 'QUERY_PIN_STATE'
            })
            .then(isPinned => {
              setInsCapMode(isPinned ? 'pinMode' : 'mode')
            })
        }
      })
      .catch(err =>
        console.warn('Error when receiving MsgTempDisabled response', err)
      )
  }, [])

  return (
    <div
      className={classNames('popup-root', { 'dark-mode': config.darkMode })}
      style={{ height: config.baHeight }}
    >
      <DictPanelStandaloneContainer
        width="100vw"
        height={dictPanelHeight + 'px'}
      />
      <div
        className="switch-container"
        onMouseEnter={shrinkDictPanel}
        onMouseLeave={expandDictPanel}
      >
        <div className="active-switch">
          <span className="switch-title">{t('app_temp_active_title')}</span>
          <input
            type="checkbox"
            id="opt-temp-active"
            className="btn-switch"
            checked={isTempOff}
            onChange={toggleTempOff}
            onFocus={shrinkDictPanel}
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
            onChange={toggleInsCap}
            onFocus={shrinkDictPanel}
          />
          <label htmlFor="opt-instant-capture"></label>
        </div>
        <div className="active-switch">
          <svg
            className="icon-qrcode"
            onMouseEnter={showQRcode}
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
            onChange={toggleAppActive}
            onFocus={shrinkDictPanel}
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
          {() => (
            <div
              className="qrcode-panel"
              onMouseLeave={() => setCurrentTabUrl('')}
            >
              <QRCode
                value={currentTabUrl}
                size={250}
                bgColor={config.darkMode ? '#ddd' : '#fff'}
                fgColor="#222"
              />
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
              {isShowPageNoResponse && (
                <div className="page-no-response-panel">
                  <p className="page-no-response-title">
                    {t('page_no_response')}
                  </p>
                </div>
              )}
            </div>
          )}
        </CSSTransition>
      </div>
    </div>
  )

  function toggleTempOff() {
    const newTempOff = !isTempOff

    setTempOff(newTempOff)

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
          setTempOff(!newTempOff)
          throw new Error('Set tempOff failed')
        }
      })
      .catch(() => setShowPageNoResponse(true))
  }

  function toggleInsCap() {
    updateConfig({
      ...config,
      [insCapMode]: {
        ...config[insCapMode],
        instant: {
          ...config[insCapMode].instant,
          enable: !config[insCapMode].instant.enable
        }
      }
    })
  }

  function toggleAppActive() {
    updateConfig({
      ...config,
      active: !config.active
    })
  }

  async function showQRcode() {
    const tabs = await browser.tabs.query({ active: true, currentWindow: true })
    if (tabs.length > 0) {
      const url = tabs[0].url
      if (url) {
        if (!url.startsWith('http')) {
          const match = /pdf\/web\/viewer\.html\?file=(.*)$/.exec(url)
          if (match) {
            setIsShowUrlBox(true)
            setCurrentTabUrl(decodeURIComponent(match[1]))
            return
          }
        }
        setIsShowUrlBox(false)
        setCurrentTabUrl(url)
      }
    }
  }
}

export default Popup
