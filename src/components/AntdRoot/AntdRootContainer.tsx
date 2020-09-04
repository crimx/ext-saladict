import React, { FC, useEffect, useMemo } from 'react'
import { shallowEqual } from 'react-redux'
import { ConfigProvider as AntdConfigProvider } from 'antd'
import zh_CN from 'antd/lib/locale-provider/zh_CN'
import zh_TW from 'antd/lib/locale-provider/zh_TW'
import en_US from 'antd/lib/locale-provider/en_US'
import { useSelector } from '@/content/redux'
import { reportPaveview } from '@/_helpers/analytics'

const antdLocales = (saladictLocale: string) => {
  switch (saladictLocale) {
    case 'zh-CN':
      return zh_CN
    case 'zh-TW':
      return zh_TW
    default:
      return en_US
  }
}

export interface AntdRootContainerProps {
  /** Render Props */
  render: () => React.ReactNode
  /** Analytics path */
  gaPath?: string
}

/** Inner Component so that it can access Redux store */
export const AntdRootContainer: FC<AntdRootContainerProps> = props => {
  const { langCode, analytics, darkMode } = useSelector(state => {
    const { langCode, analytics, darkMode } = state.config
    return { langCode, analytics, darkMode }
  }, shallowEqual)

  const locale = useMemo(() => antdLocales(langCode), [langCode])

  const bgStyles = useMemo(
    () => ({ backgroundColor: darkMode ? '#000' : '#f0f2f5' }),
    [darkMode]
  )

  useEffect(() => {
    if (analytics && props.gaPath) {
      reportPaveview(props.gaPath)
    }
  }, [analytics, props.gaPath])

  return (
    <AntdConfigProvider locale={locale}>
      <div style={bgStyles}>{props.render()}</div>
    </AntdConfigProvider>
  )
}
