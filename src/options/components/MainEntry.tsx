import React, { FC, useState, useEffect, useContext } from 'react'
import { Helmet } from 'react-helmet'
import { Layout, Row, Col, message as antMsg, notification } from 'antd'
import { useObservablePickState, useSubscription } from 'observable-hooks'
import { reportGA } from '@/_helpers/analytics'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import { useTranslate } from '@/_helpers/i18n'
import { EntrySideBarMemo } from './EntrySideBar'
import { HeaderMemo } from './Header'
import { EntryError } from './EntryError'
import { BtnPreviewMemo } from './BtnPreview'
import { config$$, GlobalsContext } from '../data'
import { uploadResult$$ } from '../helpers/upload'

const EntryComponent = React.memo(({ entry }: { entry: string }) =>
  React.createElement(require(`./Entries/${entry}`)[entry])
)

export const MainEntry: FC = () => {
  const { t, ready } = useTranslate('options')
  const globals = useContext(GlobalsContext)
  const [entry, setEntry] = useState(getEntry)
  const { analytics, darkMode } = useObservablePickState(
    config$$,
    'analytics',
    'darkMode'
  )!

  useEffect(() => {
    if (getEntry() !== entry) {
      const { protocol, host, pathname } = window.location
      const newurl = `${protocol}//${host}${pathname}?menuselected=${entry}`
      window.history.pushState({ key: entry }, '', newurl)
    }
    if (analytics) {
      reportGA(`/options/${entry}`)
    }
  }, [entry, analytics])

  // settings saving status
  useSubscription(uploadResult$$, result => {
    if (result.error) {
      notification.error({
        message: t('config.opt.upload_error'),
        description: result.error.message
      })
    } else if (!result.loading) {
      // success
      ;(globals as GlobalsContext).dirty = false
      antMsg.destroy()
      antMsg.success(t('msg_updated'))
    }
  })

  // Warn about unsaved settings before closing window
  useEffect(() => {
    window.addEventListener('beforeunload', e => {
      if (globals.dirty) {
        e.preventDefault()
        e.returnValue = t('unsave_confirm')
      }
    })
  }, [])

  return (
    <Layout
      style={{ maxWidth: 1400, margin: '0 auto' }}
      className={`main-entry${darkMode ? ' dark-mode' : ''}`}
    >
      <Helmet>
        {ready && <title>{`${t('title')} - ${t('nav.' + entry)}`}</title>}
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
                {ready && <EntryComponent entry={entry} />}
              </ErrorBoundary>
            </Layout.Content>
          </Layout>
        </Col>
      </Row>
      <BtnPreviewMemo />
    </Layout>
  )
}

function getEntry(): string {
  return new URL(document.URL).searchParams.get('menuselected') || 'General'
}
