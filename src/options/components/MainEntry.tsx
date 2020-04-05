import React, { FC, useState, useContext, useEffect } from 'react'
import { Helmet } from 'react-helmet'
import { Layout } from 'antd'
import { reportGA } from '@/_helpers/analytics'
import { useTranslate } from '@/_helpers/i18n'
import { ConfigContext } from './Contexts'
import { EntrySideBarMemo } from './EntrySideBar'
import { HeaderMemo } from './Header'

export const MainEntry: FC = () => {
  const { t } = useTranslate('options')
  const [entry, setEntry] = useState(getEntry)
  const config = useContext(ConfigContext)

  useEffect(() => {
    if (getEntry() !== entry) {
      const { protocol, host, pathname } = window.location
      const newurl = `${protocol}//${host}${pathname}?menuselected=${entry}`
      window.history.pushState({ key: entry }, '', newurl)
    }
    if (config.analytics) {
      reportGA(`/options/${entry}`)
    }
  }, [entry, config.analytics])

  return (
    <Layout style={{ maxWidth: 1400, margin: '0 auto' }}>
      <Helmet>
        <title>{`${t('title')} - ${t('nav.' + entry)}`}</title>
      </Helmet>
      <HeaderMemo />
      <EntrySideBarMemo entry={entry} onChange={setEntry} />
    </Layout>
  )
}

function getEntry(): string {
  return new URL(document.URL).searchParams.get('menuselected') || 'General'
}
