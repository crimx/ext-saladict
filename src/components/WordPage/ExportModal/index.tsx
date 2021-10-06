import React, { FC, useState, useEffect, useContext } from 'react'
import { Modal, Layout, Switch } from 'antd'
import escapeHTML from 'lodash/escape'
import { Word, newWord } from '@/_helpers/record-manager'
import { useTranslate, I18nContext } from '@/_helpers/i18n'
import { storage } from '@/_helpers/browser-api'
import { LineBreakMemo, LineBreakOption } from './Linebreak'
import { PlaceholderTableMemo } from './PlaceholderTable'

const keywordMatchStr = `%(${Object.keys(newWord()).join('|')})%`

export type ExportModalTitle = 'all' | 'selected' | 'page' | ''

export interface ExportModalProps {
  title: ExportModalTitle
  rawWords: Word[]
  onCancel: (e: React.MouseEvent<any>) => any
}

export const ExportModal: FC<ExportModalProps> = props => {
  const lang = useContext(I18nContext)
  const { t } = useTranslate(['wordpage', 'common'])
  const [template, setTemplate] = useState('%text%\n%trans%\n%context%\n')
  const [lineBreak, setLineBreak] = useState<LineBreakOption>('')
  const [escape, setEscape] = useState(false)

  const [output, setOutput] = useState('')

  useEffect(() => {
    setOutput(
      props.rawWords
        .map(word =>
          template.replace(new RegExp(keywordMatchStr, 'g'), (match, k) => {
            switch (k) {
              case 'date':
                return new Date(word.date).toLocaleDateString(lang)
              case 'trans':
              case 'note':
              case 'context': {
                const text: string = escape
                  ? escapeHTML(word[k] || '')
                  : word[k] || ''
                switch (lineBreak) {
                  case 'n':
                    return text.replace(/\n|\r\n/g, '\\n')
                  case 'br':
                    return text.replace(/\n|\r\n/g, '<br>')
                  case 'p':
                    return text
                      .split(/\n|\r\n/)
                      .map(line => `<p>${line}</p>`)
                      .join('')
                  case 'space':
                    return text.replace(/\n|\r\n/g, ' ')
                  default:
                    return text
                }
              }
              default:
                return word[k] || ''
            }
          })
        )
        .join('\n')
    )
  }, [props.rawWords, lang, template, lineBreak, escape])

  useEffect(() => {
    storage.sync
      .get<{
        wordpageTemplate: string
        wordpageLineBreak: LineBreakOption
      }>(['wordpageTemplate', 'wordpageLineBreak'])
      .then(({ wordpageTemplate, wordpageLineBreak }) => {
        if (wordpageTemplate != null) {
          setTemplate(wordpageTemplate)
        }
        if (wordpageLineBreak != null) {
          setLineBreak(wordpageLineBreak)
        }
      })

    storage.local
      .get<{
        wordpageHTMLEscape: boolean
      }>('wordpageHTMLEscape')
      .then(({ wordpageHTMLEscape }) => {
        if (wordpageHTMLEscape != null) {
          setEscape(wordpageHTMLEscape)
        }
      })
  }, [])

  const exportWords = () => {
    browser.runtime.getPlatformInfo().then(({ os }) => {
      const content = os === 'win' ? output.replace(/\r\n|\n/g, '\r\n') : output
      const file = new Blob([content], { type: 'text/plain;charset=utf-8' })
      const a = document.createElement('a')
      a.style.display = 'none'
      a.href = URL.createObjectURL(file)
      a.download = `saladict-words-${Date.now()}.txt`
      // firefox
      a.target = '_blank'
      document.body.appendChild(a)

      a.click()
    })
  }

  return (
    <Modal
      title={props.title ? t(`export.${props.title}`) : ' '}
      visible={!!props.title}
      destroyOnClose={true}
      onOk={exportWords}
      onCancel={props.onCancel}
      okText={t('common:export')}
      style={{ width: '90vw', maxWidth: 1200, top: 24 }}
      width="90vw"
    >
      <Layout
        style={{ height: '70vh', maxHeight: 1000, background: 'transparent' }}
      >
        <Layout.Content style={{ display: 'flex', flexDirection: 'column' }}>
          <p className="export-Description">
            {t('export.description')}
            <a
              href="https://saladict.crimx.com/anki.html"
              target="_blank"
              rel="nofollow noopener noreferrer"
            >
              {t('export.explain')}
            </a>
          </p>
          <PlaceholderTableMemo t={t} />
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '1em'
            }}
          >
            <LineBreakMemo
              t={t}
              value={lineBreak}
              onChange={value => {
                setLineBreak(value)
                storage.sync.set({ wordpageLineBreak: value })
                if (value === 'br' || value === 'p') {
                  setEscape(true)
                  storage.local.set({ wordpageHTMLEscape: true })
                }
              }}
            />
            <Switch
              title={t('export.htmlescape.title')}
              checked={escape}
              onChange={checked => {
                setEscape(checked)
                storage.local.set({ wordpageHTMLEscape: checked })
              }}
              checkedChildren={t('export.htmlescape.text')}
              unCheckedChildren={t('export.htmlescape.text')}
            />
          </div>
          <textarea
            style={{ flex: 1, width: '100%' }}
            value={template}
            onChange={({ currentTarget: { value } }) => {
              setTemplate(value)
              storage.sync.set({ wordpageTemplate: value })
            }}
          />
        </Layout.Content>
        <Layout.Sider
          width="50%"
          style={{ paddingLeft: 24, background: 'transparent' }}
        >
          <textarea
            style={{ width: '100%', height: '100%' }}
            readOnly={true}
            value={output}
          />
        </Layout.Sider>
      </Layout>
    </Modal>
  )
}
