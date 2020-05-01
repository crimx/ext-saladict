import React, { FC, useState } from 'react'
import { Layout } from 'antd'
import { from } from 'rxjs'
import { switchMap, startWith, debounceTime } from 'rxjs/operators'
import { useObservable, useSubscription } from 'observable-hooks'
import { DBArea, getWords, Word, deleteWords } from '@/_helpers/record-manager'
import { useTranslate } from '@/_helpers/i18n'
import { Helmet } from 'react-helmet'
import { Header } from './Header'
import { WordTableProps, colSelectionWidth, WordTable } from './WordTable'
import { ExportModal, ExportModalTitle } from './ExportModal'

import './_style.scss'

const ITEMS_PER_PAGE = 200

type TableInfo = Pick<
  WordTableProps,
  'dataSource' | 'pagination' | 'rowSelection' | 'loading'
>

interface FetchWordsConfig {
  itemsPerPage?: number
  pageNum?: number
  filters: { [field: string]: (string | number)[] | null | undefined }
  sortField?: string | number | (string | number)[]
  sortOrder?: 'ascend' | 'descend' | false | null
  searchText: string
}

const initialFetchWordsConfig: Readonly<FetchWordsConfig> = {
  searchText: '',
  itemsPerPage: ITEMS_PER_PAGE,
  pageNum: 1,
  filters: {}
}

export interface WordPageProps {
  area: DBArea
}

export const WordPage: FC<WordPageProps> = props => {
  const { t } = useTranslate('wordpage')
  const [searchText, setSearchText] = useState('')
  const [selectedRows, setSelectedRows] = useState<Word[]>([])
  const [tableInfo, setTableInfo] = useState<TableInfo>(() => ({
    dataSource: [],
    pagination: {
      showSizeChanger: true,
      showQuickJumper: true,
      hideOnSinglePage: true,
      current: 1,
      pageSize: ITEMS_PER_PAGE,
      defaultPageSize: ITEMS_PER_PAGE,
      total: 0
    },
    rowSelection: {
      selectedRowKeys: [],
      columnWidth: colSelectionWidth,
      onChange: (selectedRowKeys, selectedRows) => {
        setTableInfo(lastInfo => ({
          ...lastInfo,
          rowSelection: {
            ...lastInfo.rowSelection,
            selectedRowKeys
          }
        }))
        setSelectedRows(selectedRows)
      }
    },
    loading: false
  }))

  const [exportModalTitle, setExportModalTitle] = useState<ExportModalTitle>('')
  const [exportModalWords, setExportModalWords] = useState<Word[]>([])

  const [fetchWordsConfig, setFetchWordsConfig] = useState(
    initialFetchWordsConfig
  )
  const fetchWords = (config: Partial<FetchWordsConfig>) =>
    setFetchWordsConfig(lastConfig => ({
      ...lastConfig,
      ...config
    }))

  const fetchWords$ = useObservable<
    { total: number; words: Word[] } | null,
    [FetchWordsConfig]
  >(
    inputs$ =>
      inputs$.pipe(
        debounceTime(200),
        switchMap(([config]) =>
          from(
            getWords(props.area, config).catch(e => {
              console.error(e)
              return { total: 0, words: [] }
            })
          ).pipe(startWith(null))
        )
      ),
    [fetchWordsConfig]
  )

  useSubscription(fetchWords$, response => {
    setTableInfo(lastInfo => ({
      ...lastInfo,
      ...(response
        ? {
            pagination: {
              ...lastInfo.pagination,
              total: response.total
            },
            dataSource: response.words,
            loading: false
          }
        : { loading: true })
    }))
    setSelectedRows([])
  })

  return (
    <Layout className="wordpage-Container">
      <Helmet>
        <title>{t(`title.${props.area}`)}</title>
      </Helmet>
      <Header
        t={t}
        area={props.area}
        searchText={searchText}
        totalCount={(tableInfo.pagination && tableInfo.pagination.total) || 0}
        selectedCount={selectedRows.length}
        onSearchTextChanged={text => {
          setSearchText(text)
          fetchWords({ searchText: text })
        }}
        onExport={async ({ key }) => {
          if (key === 'all') {
            const { total, words } = await getWords(props.area, {
              ...fetchWordsConfig,
              itemsPerPage: undefined,
              pageNum: undefined
            })
            if (process.env.DEBUG) {
              console.assert(words.length === total, 'get all words')
            }
            setExportModalTitle(key)
            setExportModalWords(words)
          } else if (key === 'selected') {
            setExportModalTitle(key)
            setExportModalWords(selectedRows)
          } else if (key === 'page') {
            setExportModalTitle(key)
            setExportModalWords(tableInfo.dataSource || [])
          } else {
            setExportModalTitle('')
          }
        }}
        onDelete={key => {
          const keys =
            key === 'selected'
              ? tableInfo.rowSelection?.selectedRowKeys?.map(date =>
                  Number(date)
                )
              : key === 'page'
              ? tableInfo.dataSource?.map(({ date }) => date)
              : undefined
          deleteWords(props.area, keys).then(() => fetchWords({}))
        }}
      />
      <Layout.Content>
        <WordTable
          area={props.area}
          {...tableInfo}
          onChange={(pagination, filters, sorter) => {
            window.scrollTo(0, 0)

            setTableInfo(lastInfo => ({
              ...lastInfo,
              pagination: {
                ...lastInfo.pagination,
                current: pagination.current || 1
              }
            }))

            const realSorter = Array.isArray(sorter) ? sorter[0] : sorter

            fetchWords({
              itemsPerPage: pagination?.pageSize || ITEMS_PER_PAGE,
              pageNum: pagination?.current || 1,
              filters: filters,
              sortField: realSorter?.field,
              sortOrder: realSorter?.order,
              searchText
            })
          }}
        />
      </Layout.Content>
      <ExportModal
        title={exportModalTitle}
        rawWords={exportModalWords}
        onCancel={() => {
          setExportModalTitle('')
        }}
      />
    </Layout>
  )
}
