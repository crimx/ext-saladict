import React, { FC, useState, useContext, useEffect } from 'react'
import { Helmet } from 'react-helmet'
import { Layout, Row, Col } from 'antd'
import { reportGA } from '@/_helpers/analytics'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import { useTranslate } from '@/_helpers/i18n'
import { ConfigContext } from './Contexts'
import { EntrySideBarMemo } from './EntrySideBar'
import { HeaderMemo } from './Header'
import { EntryError } from './EntryError'

const EntryComponent = React.memo(({ entry }: { entry: string }) =>
  React.createElement(require(`./Entries/${entry}`)[entry])
)

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
    <Layout
      style={{ maxWidth: 1400, margin: '0 auto' }}
      className={`main-entry${config.darkMode ? ' dark-mode' : ''}`}
    >
      <Helmet>
        <title>{`${t('title')} - ${t('nav.' + entry)}`}</title>
      </Helmet>
      <HeaderMemo openProfilesTab={setEntry} />
      <Row>
        <Col>
          <EntrySideBarMemo entry={entry} onChange={setEntry} />
        </Col>
        <Col style={{ flex: '1' }}>
          <Layout style={{ padding: 24 }}>
            <Layout.Content
              style={{
                padding: 24,
                backgroundColor: 'var(--opt-background-color)'
              }}
            >
              <ErrorBoundary key={entry} error={EntryError}>
                <EntryComponent entry={entry} />
              </ErrorBoundary>
            </Layout.Content>
          </Layout>
        </Col>
      </Row>
    </Layout>
  )
}

function getEntry(): string {
  return new URL(document.URL).searchParams.get('menuselected') || 'General'
}
