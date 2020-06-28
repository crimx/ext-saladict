import React, { FC, useState, useEffect, useContext } from 'react'
import { Helmet } from 'react-helmet'
import { shallowEqual } from 'react-redux'
import { Layout, Row, Col } from 'antd'
import { useSelector } from '@/options/redux/modules'
import { reportGA } from '@/_helpers/analytics'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import { useTranslate, I18nContext } from '@/_helpers/i18n'
import { ChangeEntryContext } from '../helpers/change-entry'
import { useFormDirty } from '../helpers/use-form-dirty'
import { EntrySideBarMemo } from './EntrySideBar'
import { HeaderMemo } from './Header'
import { EntryError } from './EntryError'
import { BtnPreviewMemo } from './BtnPreview'

const EntryComponent = React.memo(({ entry }: { entry: string }) =>
  React.createElement(require(`./Entries/${entry}`)[entry])
)

export const MainEntry: FC = () => {
  const lang = useContext(I18nContext)
  const { t, ready } = useTranslate('options')
  const [entry, setEntry] = useState(getEntry)
  const formDirtyRef = useFormDirty()
  const { analytics, darkMode } = useSelector(
    state => ({
      analytics: state.config.analytics,
      darkMode: state.config.darkMode
    }),
    shallowEqual
  )

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

  // Warn about unsaved settings before closing window
  useEffect(() => {
    window.addEventListener('beforeunload', e => {
      if (formDirtyRef.value) {
        e.preventDefault()
        e.returnValue = t('unsave_confirm')
      }
    })
  }, [])

  return (
    <>
      <Helmet>
        {ready && <title>{`${t('title')} - ${t('nav.' + entry)}`}</title>}
      </Helmet>
      <HeaderMemo openProfilesTab={setEntry} />
      <Layout
        style={{ maxWidth: 1400, margin: '0 auto' }}
        className={`main-entry${darkMode ? ' dark-mode' : ''}`}
      >
        <Row>
          <Col>
            <EntrySideBarMemo entry={entry} onChange={setEntry} />
          </Col>
          <Col style={{ flex: '1' }}>
            <Layout style={{ padding: 24 }}>
              <Layout.Content
                data-option-content={entry} // for utools hiding unused options
                style={{
                  padding: 24,
                  backgroundColor: 'var(--opt-background-color)'
                }}
              >
                <ChangeEntryContext.Provider value={setEntry}>
                  <ErrorBoundary key={entry + lang} error={EntryError}>
                    {ready && <EntryComponent entry={entry} />}
                  </ErrorBoundary>
                </ChangeEntryContext.Provider>
              </Layout.Content>
            </Layout>
          </Col>
        </Row>
        <BtnPreviewMemo />
      </Layout>
    </>
  )
}

function getEntry(): string {
  return new URL(document.URL).searchParams.get('menuselected') || 'General'
}
