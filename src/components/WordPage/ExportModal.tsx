import React from 'react'
import { withTranslation, WithTranslation } from 'react-i18next'
import { Layout, Modal, Table, Select, Switch } from 'antd'
import { ColumnProps } from 'antd/lib/table/interface'
import { Word, newWord } from '@/_helpers/record-manager'
import { storage } from '@/_helpers/browser-api'
import escapeHTML from 'lodash/escape'

const { Content, Sider } = Layout

export interface ExportModalProps {
  locale: string
  title: 'all' | 'selected' | 'page' | ''
  rawWords: Word[]
  onCancel: (e: React.MouseEvent<any>) => any
}

type ExportModalInnerProps = ExportModalProps & WithTranslation

interface ExportModalState {
  lineBreak: '' | 'n' | 'p' | 'br' | 'space'
  template: string
  escape: boolean
}

interface TemplateData {
  plcholderL: string
  contentL: string
  plcholderR: string
  contentR: string
}

export class ExportModalBody extends React.Component<
  ExportModalInnerProps,
  ExportModalState
> {
  readonly tplTableData: TemplateData[]
  readonly tplTableCols: ColumnProps<TemplateData>[]
  proccessedText = ''

  constructor(props) {
    super(props)
    const { t } = props

    this.state = {
      template: '',
      lineBreak: '',
      escape: false
    }

    this.tplTableData = [
      {
        plcholderL: '%text%',
        contentL: t('common:note.word'),
        plcholderR: '%title%',
        contentR: t('common:note.srcTitle')
      },
      {
        plcholderL: '%context%',
        contentL: t('common:note.context'),
        plcholderR: '%url%',
        contentR: t('common:note.srcLink')
      },
      {
        plcholderL: '%note%',
        contentL: t('common:note.note'),
        plcholderR: '%favicon%',
        contentR: t('common:note.srcFavicon')
      },
      {
        plcholderL: '%trans%',
        contentL: t('common:note.trans'),
        plcholderR: '%date%',
        contentR: t('common:note.date')
      }
    ]

    this.tplTableCols = [
      {
        title: t('export.placeholder'),
        dataIndex: 'plcholderL',
        key: 'plcholderL',
        width: '25%',
        align: 'center'
      },
      {
        title: t('export.gencontent'),
        dataIndex: 'contentL',
        key: 'contentL',
        width: '25%',
        align: 'center'
      },
      {
        title: t('export.placeholder'),
        dataIndex: 'plcholderR',
        key: 'plcholderR',
        width: '25%',
        align: 'center'
      },
      {
        title: t('export.gencontent'),
        dataIndex: 'contentR',
        key: 'contentR',
        width: '25%',
        align: 'center'
      }
    ]
  }

  exportWords = () => {
    browser.runtime.getPlatformInfo().then(({ os }) => {
      const content =
        os === 'win'
          ? this.proccessedText.replace(/\r\n|\n/g, '\r\n')
          : this.proccessedText
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

  handleTemplateChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const template = e.currentTarget.value
    this.setState({ template })
    storage.sync.set({ wordpageTemplate: template })
  }

  handleLinebreakChange = (value: ExportModalState['lineBreak']) => {
    const escape = value === 'br' || value === 'p' ? true : this.state.escape
    this.setState({ lineBreak: value, escape })
    storage.sync.set({ wordpageLineBreak: value })
    storage.local.set({ wordpageHTMLEscape: escape })
  }

  handleHTMLEscapeChange = (checked: boolean) => {
    this.setState({ escape: checked })
    storage.local.set({ wordpageHTMLEscape: checked })
  }

  processWords = (): string => {
    const keys = Object.keys(newWord())
    return this.props.rawWords
      .map(word =>
        this.state.template.replace(/%(\S+)%/g, (match, k) => {
          if (keys.includes(k)) {
            switch (k) {
              case 'date':
                return new Date(word.date).toLocaleDateString(this.props.locale)
              case 'trans':
              case 'note':
              case 'context': {
                const text: string = this.state.escape
                  ? escapeHTML(word[k] || '')
                  : word[k] || ''
                switch (this.state.lineBreak) {
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
          }
          return match
        })
      )
      .join('\n')
  }

  componentDidMount() {
    const { t } = this.props

    storage.sync
      .get<{
        wordpageTemplate: string
        wordpageLineBreak: ExportModalState['lineBreak']
      }>(['wordpageTemplate', 'wordpageLineBreak'])
      .then(({ wordpageTemplate, wordpageLineBreak }) => {
        const template =
          wordpageTemplate ||
          `${t('common:note.word')}: %text%\n%trans%\n${t(
            'common:note.context'
          )}: %context%\n`
        this.setState({
          template,
          lineBreak: wordpageLineBreak || ''
        })
      })

    storage.local
      .get<{
        wordpageHTMLEscape: boolean
      }>('wordpageHTMLEscape')
      .then(({ wordpageHTMLEscape }) => {
        if (wordpageHTMLEscape != null) {
          this.setState({ escape: wordpageHTMLEscape })
        }
      })
  }

  render() {
    const { t } = this.props

    const { template } = this.state

    this.proccessedText = this.processWords()

    return (
      <Layout style={{ height: '70vh', maxHeight: 1000 }}>
        <Content
          style={{
            display: 'flex',
            flexDirection: 'column',
            background: '#fff'
          }}
        >
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
          <Table
            dataSource={this.tplTableData}
            columns={this.tplTableCols}
            rowKey="plcholderL"
            pagination={false}
            size="small"
            bordered={true}
            style={{ marginBottom: '1em' }}
          />
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '1em'
            }}
          >
            <Select
              value={this.state.lineBreak}
              style={{ width: 210 }}
              onChange={this.handleLinebreakChange}
            >
              <Select.Option value="">
                {t('export.linebreak.default')}
              </Select.Option>
              <Select.Option value="n">{t('export.linebreak.n')}</Select.Option>
              <Select.Option value="br">
                {t('export.linebreak.br')}
              </Select.Option>
              <Select.Option value="p">{t('export.linebreak.p')}</Select.Option>
              <Select.Option value="space">
                {t('export.linebreak.space')}
              </Select.Option>
            </Select>
            <Switch
              title={t('export.htmlescape.title')}
              checked={this.state.escape}
              onChange={this.handleHTMLEscapeChange}
              checkedChildren={t('export.htmlescape.text')}
              unCheckedChildren={t('export.htmlescape.text')}
            />
          </div>
          <textarea
            style={{ flex: 1, width: '100%' }}
            value={template}
            onChange={this.handleTemplateChange}
          />
        </Content>
        <Sider width="50%" style={{ paddingLeft: 24, background: '#fff' }}>
          <textarea
            style={{ width: '100%', height: '100%' }}
            readOnly={true}
            value={this.proccessedText}
          />
        </Sider>
      </Layout>
    )
  }
}

export class ExportModal extends React.PureComponent<
  ExportModalInnerProps,
  ExportModalState
> {
  bodyRef = React.createRef<ExportModalBody>()

  exportWords = () => {
    if (this.bodyRef.current) {
      this.bodyRef.current.exportWords()
    }
  }

  render() {
    const { t, title, onCancel } = this.props

    return (
      <Modal
        title={title ? t(`export.${title}`) : ' '}
        visible={!!title}
        destroyOnClose={true}
        onOk={this.exportWords}
        onCancel={onCancel}
        okText={t('common:export')}
        style={{ width: '90vw', maxWidth: 1200, top: 24 }}
        width="90vw"
      >
        <ExportModalBody ref={this.bodyRef} {...this.props} />
      </Modal>
    )
  }
}

export default withTranslation()(ExportModal)
