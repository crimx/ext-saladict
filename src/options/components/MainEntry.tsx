import React, { FC, useState, useEffect } from 'react'
import { Helmet } from 'react-helmet'
import { Layout, Row, Col, message as antMsg } from 'antd'
import { merge } from 'rxjs'
import {
  useObservablePickState,
  useSubscription,
  useObservable
} from 'observable-hooks'
import { reportGA } from '@/_helpers/analytics'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import { useTranslate } from '@/_helpers/i18n'
import { message } from '@/_helpers/browser-api'
import { newWord } from '@/_helpers/record-manager'
import { getWordOfTheDay } from '@/_helpers/wordoftheday'
import { EntrySideBarMemo } from './EntrySideBar'
import { HeaderMemo } from './Header'
import { EntryError } from './EntryError'
import { BtnPreviewMemo } from './BtnPreview'
import { config$$, profile$$, profileIDList$$ } from '../data'
import { skip } from 'rxjs/operators'

const EntryComponent = React.memo(({ entry }: { entry: string }) =>
  React.createElement(require(`./Entries/${entry}`)[entry])
)

export const MainEntry: FC = () => {
  const { t } = useTranslate('options')
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

  useSubscription(
    useObservable(() =>
      merge(skip(1)(config$$), skip(1)(profile$$), skip(1)(profileIDList$$))
    ),
    () => {
      antMsg.destroy()
      antMsg.success(t('msg_updated'))
    }
  )

  return (
    <Layout
      style={{ maxWidth: 1400, margin: '0 auto' }}
      className={`main-entry${darkMode ? ' dark-mode' : ''}`}
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
      <BtnPreviewMemo show={true} onClick={openDictPanel} />
    </Layout>
  )
}

function getEntry(): string {
  return new URL(document.URL).searchParams.get('menuselected') || 'General'
}

async function openDictPanel() {
  message.self.send({
    type: 'SELECTION',
    payload: {
      word: newWord({ text: await getWordOfTheDay() }),
      self: true, // selection inside dict panel is always avaliable
      instant: true,
      mouseX: window.innerWidth - 250,
      mouseY: 80,
      dbClick: true,
      shiftKey: true,
      ctrlKey: true,
      metaKey: true,
      force: true
    }
  })
}
