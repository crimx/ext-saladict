import React from 'react'
import { withTranslation, WithTranslation } from 'react-i18next'
import {
  Layout,
  Table,
  Tooltip,
  Button,
  Dropdown,
  Icon,
  Menu,
  Modal,
  Input
} from 'antd'
import {
  PaginationConfig,
  TableRowSelection,
  ColumnProps
} from 'antd/lib/table/interface'
import { ClickParam as MenuClickParam } from 'antd/lib/menu'

import ExportModal from './ExportModal'

import './_style.scss'

import { DBArea, Word, getWords, deleteWords } from '@/_helpers/record-manager'
import { message } from '@/_helpers/browser-api'

import { Observable, Subject } from 'rxjs'
import {
  mergeMap,
  audit,
  mapTo,
  share,
  startWith,
  debounceTime
} from 'rxjs/operators'

const { Header, Content } = Layout

const ITEMS_PER_PAGE = 100

export interface WordPageMainProps {
  area: DBArea
  locale: string
}

export interface WordPageMainState {
  searchText: string
  words: Word[]
  pagination: PaginationConfig
  rowSelection: TableRowSelection<Word>
  selectedRows: Word[]
  loading: boolean
  exportModalTitle: '' | 'all' | 'selected' | 'page'
  exportModalWords: Word[]
}

type WordPageMainInnerProps = WordPageMainProps & WithTranslation

interface FetchDataConfig {
  itemsPerPage?: number
  pageNum?: number
  filters: { [field: string]: string[] | undefined }
  sortField?: string
  sortOrder?: 'ascend' | 'descend' | false
  searchText: string
}

export class WordPageMain extends React.Component<
  WordPageMainInnerProps,
  WordPageMainState
> {
  readonly tableColumns: ColumnProps<Word>[]
  readonly emptyRow = []
  readonly contentRef = React.createRef<any>()
  readonly fetchData$$: Subject<FetchDataConfig>

  lastFetchDataConfig: FetchDataConfig = {
    searchText: '',
    itemsPerPage: ITEMS_PER_PAGE,
    pageNum: 1,
    filters: {}
  }

  constructor(props: WordPageMainInnerProps) {
    super(props)
    const { t, area } = props

    let signal$: Observable<boolean>
    this.fetchData$$ = new Subject<FetchDataConfig>()
    const fetchData$$ = this.fetchData$$.pipe(
      debounceTime(200),
      // ignore values while fetchData is running
      // if source emits any value during fetchData,
      // retrieve the latest after fetchData is completed
      audit(() => signal$),
      mergeMap(config => this.fetchData(config)),
      share()
    )
    signal$ = fetchData$$.pipe(
      mapTo(true), // last fetchData is completed
      startWith(true as boolean)
    )
    fetchData$$.subscribe()

    const colSelectionWidth = 48
    const colDateWidth = 150
    const colEditWidth = 80
    const fixedWidth = colSelectionWidth + colDateWidth + colEditWidth
    const colTextWidth = `calc((100vw - ${fixedWidth}px) / 7)`
    const restWidth = `calc((100vw - ${fixedWidth}px) * 2 / 7)`

    this.state = {
      searchText: '',
      words: [],
      selectedRows: [],
      pagination: {
        current: 1,
        pageSize: ITEMS_PER_PAGE,
        defaultPageSize: ITEMS_PER_PAGE,
        total: 0
      },
      rowSelection: {
        selectedRowKeys: [],
        columnWidth: colSelectionWidth,
        onChange: this.handleSelectionChange
      },
      loading: false,
      exportModalTitle: '',
      exportModalWords: []
    }

    this.tableColumns = [
      {
        title: t('column.word'),
        dataIndex: 'text',
        key: 'text',
        width: colTextWidth,
        align: 'center',
        sorter: true,
        filters: [
          { text: t('filterWord.chs'), value: 'ch' },
          { text: t('filterWord.eng'), value: 'en' },
          { text: t('filterWord.word'), value: 'word' },
          { text: t('filterWord.phrase'), value: 'phra' }
        ]
      },
      {
        title: t('column.source'),
        dataIndex: 'context',
        key: 'context',
        width: restWidth,
        align: 'center',
        render: this.renderSource
      },
      {
        title: t('column.trans'),
        dataIndex: 'trans',
        key: 'trans',
        width: restWidth,
        render: (_, record) => this.renderText(record.trans)
      },
      {
        title: t('column.note'),
        dataIndex: 'note',
        key: 'note',
        width: restWidth,
        render: (_, record) => this.renderText(record.note)
      },
      {
        title: t('column.date'),
        dataIndex: 'date',
        key: 'date',
        width: colDateWidth,
        align: 'center',
        sorter: true,
        render: this.renderDate
      },
      {
        title: t(`column.${area === 'notebook' ? 'edit' : 'add'}`),
        key: 'edit',
        align: 'center',
        render: this.renderEdit
      }
    ]
  }

  fetchData = (config?: FetchDataConfig): Promise<void> => {
    config = config || this.lastFetchDataConfig
    this.lastFetchDataConfig = config

    this.setState({ loading: true })

    return getWords(this.props.area, config).then(({ total, words }) =>
      this.setState({
        words,
        loading: false,
        pagination: {
          ...this.state.pagination,
          total
        },
        selectedRows: []
      })
    )
  }

  handleTableChange = (pagination, filters, sorter) => {
    window.scrollTo(0, 0)

    this.setState({
      pagination: {
        ...this.state.pagination,
        current: pagination.current || 1
      }
    })

    this.fetchData$$.next({
      itemsPerPage: (pagination && pagination.pageSize) || ITEMS_PER_PAGE,
      pageNum: (pagination && pagination.current) || 1,
      filters: filters,
      sortField: sorter && sorter.field,
      sortOrder: sorter && sorter.order,
      searchText: this.state.searchText
    })
  }

  handleSearchTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const searchText = e.currentTarget.value
    this.setState({ searchText })
    this.fetchData$$.next({
      ...this.lastFetchDataConfig,
      searchText
    })
  }

  handleSelectionChange = (
    selectedRowKeys: string[] | number[],
    selectedRows
  ) => {
    this.setState({
      rowSelection: {
        ...this.state.rowSelection,
        selectedRowKeys
      },
      selectedRows
    })
  }

  handleBtnExportClick = ({ key }: MenuClickParam) => {
    if (key === 'all') {
      const config = {
        ...this.lastFetchDataConfig,
        itemsPerPage: undefined,
        pageNum: undefined
      }
      getWords(this.props.area, config).then(({ total, words }) => {
        if (process.env.NODE_ENV !== 'production') {
          console.assert(words.length === total, 'get all words')
        }
        this.setState({
          exportModalTitle: key,
          exportModalWords: words
        })
      })
    } else if (key === 'selected') {
      this.setState({
        exportModalTitle: key,
        exportModalWords: this.state.selectedRows
      })
    } else if (key === 'page') {
      this.setState({
        exportModalTitle: key,
        exportModalWords: this.state.words
      })
    } else {
      this.setState({ exportModalTitle: '' })
    }
  }

  handleExportModalCancel = () => {
    this.setState({ exportModalTitle: '' })
  }

  handleBtnDeleteClick = ({ key }: MenuClickParam) => {
    if (key) {
      const { t, area } = this.props

      Modal.confirm({
        title: t('delete'),
        content: t(`delete.${key}`) + t('delete.confirm'),
        okType: 'danger',
        onOk: () => {
          const keys =
            key === 'selected'
              ? (this.state.rowSelection.selectedRowKeys as number[])
              : key === 'page'
              ? this.state.words.map(({ date }) => date)
              : undefined
          deleteWords(area, keys).then(() => this.fetchData$$.next())
        }
      })
    }
  }

  componentDidMount() {
    this.fetchData$$.next()

    message.addListener('WORD_SAVED', () => {
      this.fetchData$$.next()
    })

    // From popup page
    const searchURL = new URL(document.URL)
    const wordString = searchURL.searchParams.get('word')
    if (wordString) {
      try {
        const word = JSON.parse(decodeURIComponent(wordString)) as Word
        setTimeout(() => {
          message.self.send({
            type: 'UPDATE_WORD_EDITOR_WORD',
            payload: { word, translateCtx: true }
          })
        }, 1000)
      } catch (err) {
        console.warn(err)
      }
    }

    const wordText = searchURL.searchParams.get('text')
    if (wordText) {
      const text = decodeURIComponent(wordText)
      this.fetchData({
        ...this.lastFetchDataConfig,
        filters: {
          word: [text]
        }
      })
      this.setState({ searchText: text })
    }
  }

  renderEdit = (_, record: Word): React.ReactNode => {
    const { t, area } = this.props
    return (
      <Button
        key={record.date}
        size="small"
        onClick={() => {
          const word = {
            ...record,
            // give it a new date if it's from history
            date: area === 'notebook' ? record.date : Date.now()
          }
          // wait till selection ends
          setTimeout(() => {
            message.self.send({
              type: 'UPDATE_WORD_EDITOR_WORD',
              payload: { word }
            })
          }, 500)
        }}
      >
        {t(`column.${area === 'notebook' ? 'edit' : 'add'}`)}
      </Button>
    )
  }

  renderText = (text?: string): React.ReactNode => {
    if (!text) {
      return ''
    }
    return text.split('\n').map((line, i) => <div key={i}>{line}</div>)
  }

  renderSource = (_, record: Word): React.ReactNode => {
    return (
      <React.Fragment key={record.date}>
        {record.context && (
          <p className="wordpage-Record_Context">{record.context}</p>
        )}
        {record.title && (
          <p className="wordpage-Source_Footer">
            {record.favicon && (
              <img className="wordpage-Record_Favicon" src={record.favicon} />
            )}
            <span className="wordpage-Record_Title">{record.title}</span>
          </p>
        )}
      </React.Fragment>
    )
  }

  renderDate = (datenum: number): React.ReactNode => {
    const date = new Date(datenum)
    const locale = this.props.locale

    return (
      <Tooltip
        key={datenum}
        placement="topRight"
        title={date.toLocaleString(locale)}
      >
        {date.toLocaleDateString(locale)}
      </Tooltip>
    )
  }

  render() {
    const { t, area } = this.props

    const {
      searchText,
      words,
      selectedRows,
      pagination,
      rowSelection,
      loading,
      exportModalTitle,
      exportModalWords
    } = this.state

    return (
      <>
        <Layout className="wordpage-Container">
          <Header className="wordpage-Header">
            <h1 style={{ color: '#fff' }}>{t(`title.${area}`)}</h1>
            {(pagination.total as number) > 0 && (
              <span className="wordpage-Wordcount">
                {t(`wordCount.total`, { count: pagination.total })}
              </span>
            )}
            {selectedRows.length > 0 && (
              <span className="wordpage-Wordcount">
                {t(`wordCount.selected`, { count: selectedRows.length })}
              </span>
            )}
            <div style={{ marginLeft: 'auto' }}>
              <Input
                style={{ width: '15em' }}
                placeholder="Search"
                onChange={this.handleSearchTextChange}
                value={searchText}
              />
              <Dropdown
                overlay={
                  <Menu onClick={this.handleBtnExportClick}>
                    {selectedRows.length > 0 && (
                      <Menu.Item key="selected">
                        {t('export.selected')}
                      </Menu.Item>
                    )}
                    <Menu.Item key="page">{t('export.page')}</Menu.Item>
                    <Menu.Item key="all">{t('export.all')}</Menu.Item>
                  </Menu>
                }
              >
                <Button style={{ marginLeft: 8 }}>
                  {t('export.title')} <Icon type="down" />
                </Button>
              </Dropdown>
              <Dropdown
                overlay={
                  <Menu onClick={this.handleBtnDeleteClick}>
                    {selectedRows.length > 0 && (
                      <Menu.Item key="selected">
                        {t('delete.selected')}
                      </Menu.Item>
                    )}
                    <Menu.Item key="page">{t('delete.page')}</Menu.Item>
                    <Menu.Item key="all">{t('delete.all')}</Menu.Item>
                  </Menu>
                }
              >
                <Button type="danger" style={{ marginLeft: 8 }}>
                  {t('delete.title')} <Icon type="down" />
                </Button>
              </Dropdown>
            </div>
          </Header>
          <Content ref={this.contentRef} className="wordpage-Content">
            <Table
              dataSource={words}
              columns={this.tableColumns}
              pagination={pagination}
              rowSelection={rowSelection}
              onChange={this.handleTableChange}
              rowKey="date"
              bordered={true}
              loading={loading}
              showHeader={true}
            />
          </Content>
        </Layout>
        <ExportModal
          locale={this.props.locale}
          title={exportModalTitle}
          rawWords={exportModalWords}
          onCancel={this.handleExportModalCancel}
        />
      </>
    )
  }
}

export default withTranslation()(WordPageMain)
