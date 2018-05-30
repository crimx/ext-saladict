import React from 'react'
import { translate, TranslationFunction } from 'react-i18next'
import { Layout, Modal, Table } from 'antd'
import { ColumnProps } from 'antd/lib/table/interface'
import { Word } from '@/_helpers/record-manager'
import { storage } from '@/_helpers/browser-api'

const { Content, Sider } = Layout

export interface ExportModalProps {
  title: 'all' | 'selected' | ''
  rawWords: Word[]
  onCancel: (e: React.MouseEvent<any>) => any
}

interface ExportModalInnerProps extends ExportModalProps {
  t: TranslationFunction
}

interface ExportModalState {
  template: string
  processedWords: string
}

interface TemplateData {
  plcholderL: string
  contentL: string
  plcholderR: string
  contentR: string
}

export class ExportModalBody extends React.Component<ExportModalInnerProps, ExportModalState> {
  readonly tplTableData: TemplateData[]
  readonly tplTableCols: ColumnProps<TemplateData>[]

  constructor (props) {
    super(props)
    const {
      t,
    } = props

    this.state = {
      template: '',
      processedWords: '',
    }

    this.tplTableData = [
      {
        plcholderL: '%text%', contentL: t('content:wordEditorNoteWord'),
        plcholderR: '%title%', contentR: t('content:wordEditorNoteSrcTitle'),
      },
      {
        plcholderL: '%context%', contentL: t('content:wordEditorNoteContext'),
        plcholderR: '%url%', contentR: t('content:wordEditorNoteSrcLink'),
      },
      {
        plcholderL: '%note%', contentL: t('content:wordEditorNoteNote'),
        plcholderR: '%favicon%', contentR: t('content:wordEditorNoteSrcFavicon'),
      },
      {
        plcholderL: '%trans%', contentL: t('content:wordEditorNoteTrans'),
        plcholderR: '', contentR: '',
      },
    ]

    this.tplTableCols = [{
      title: t('export_placeholder'),
      dataIndex: 'plcholderL',
      key: 'plcholderL',
      width: '25%',
      align: 'center',
    }, {
      title: t('export_gencontent'),
      dataIndex: 'contentL',
      key: 'contentL',
      width: '25%',
      align: 'center',
    }, {
      title: t('export_placeholder'),
      dataIndex: 'plcholderR',
      key: 'plcholderR',
      width: '25%',
      align: 'center',
    }, {
      title: t('export_gencontent'),
      dataIndex: 'contentR',
      key: 'contentR',
      width: '25%',
      align: 'center',
    }]
  }

  exportWords = () => {
    browser.runtime.getPlatformInfo()
      .then(({ os }) => {
        const content = os === 'win'
          ? this.state.processedWords.replace(/\r\n|\n/g, '\r\n')
          : this.state.processedWords
        const file = new Blob([content], { type: 'text/plain;charset=utf-8' })
        const a = document.createElement('a')
        a.href = URL.createObjectURL(file)
        a.download = `saladict-${Date.now()}`
        a.click()
      })
  }

  handleTemplateChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const template = e.currentTarget.value
    this.setState({
      template,
      processedWords: processWords(this.props.rawWords, template)
    })
    storage.sync.set({ wordpageTemplate: template })
  }

  componentDidMount () {
    const { t, rawWords } = this.props

    storage.sync.get<{ wordpageTemplate: string }>('wordpageTemplate')
      .then(({ wordpageTemplate }) => {
        const template = wordpageTemplate ||
          `${t('content:wordEditorNoteWord')}: %text%\n${t('content:wordEditorNoteContext')}: %context%\n`
        this.setState({
          template,
          processedWords: processWords(rawWords, template),
        })
      })
  }

  render () {
    const {
      t,
    } = this.props

    const {
      template,
      processedWords,
    } = this.state

    return (
      <Layout style={{ height: '70vh', maxHeight: 1000 }}>
        <Content style={{ display: 'flex', flexDirection: 'column', background: '#fff' }}>
          <p className='export-Description'>{t('export_description')}</p>
          <Table
            dataSource={this.tplTableData}
            columns={this.tplTableCols}
            rowKey='plcholderL'
            pagination={false}
            size='small'
            bordered={true}
            style={{ marginBottom: 24 }}
          />
          <textarea style={{ flex: 1, width: '100%' }} value={template} onChange={this.handleTemplateChange} />
        </Content>
        <Sider width='50%' style={{ paddingLeft: 24, background: '#fff' }}>
          <textarea style={{ width: '100%', height: '100%' }} readOnly={true} value={processedWords} />
        </Sider>
      </Layout>
    )
  }
}

export class ExportModal extends React.PureComponent<ExportModalInnerProps, ExportModalState> {
  bodyRef = React.createRef<ExportModalBody>()

  exportWords = () => {
    if (this.bodyRef.current) {
      this.bodyRef.current.exportWords()
    }
  }

  render () {
    const {
      t,
      title,
      onCancel,
    } = this.props

    return (
      <Modal
        title={title ? t(`export_${title}`) : ' '}
        visible={!!title}
        destroyOnClose={true}
        onOk={this.exportWords}
        onCancel={onCancel}
        okText={t('export')}
        style={{ width: '90vw', maxWidth: 1200, top: 24 }}
        width='90vw'
      >
        <ExportModalBody ref={this.bodyRef} {...this.props} />
      </Modal>
    )
  }
}

export default translate()(ExportModal)

function processWords (rawWords: Word[], template: string): string {
  return rawWords
    .map(word =>
      template.replace(/%(\S+)%/g, (match, k) =>
        typeof word[k] === 'string' ? word[k] : match)
    )
    .join('\n')
}
