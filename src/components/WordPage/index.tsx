import React, { FC, useState } from 'react'
import { Layout } from 'antd'
import { from } from 'rxjs'
import { scan, switchMap, startWith, debounceTime } from 'rxjs/operators'
import { useObservableCallback, useSubscription } from 'observable-hooks'
import { DBArea, getWords, Word, deleteWords } from '@/_helpers/record-manager'
import { Header } from './Header'
import { WordTableProps, colSelectionWidth, WordTable } from './WordTable'

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
  const [searchText, setSearchText] = useState('')
  const [tableInfo, setTableInfo] = useState<TableInfo>(() => ({
    dataSource: [],
    pagination: {
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
          rowSelection: {
            ...lastInfo.rowSelection,
            selectedRowKeys
          },
          selectedRows
        }))
      }
    },
    loading: false
  }))

  const [fetchWords, fetchWords$] = useObservableCallback<
    { total: number; words: Word[] } | null,
    Partial<FetchWordsConfig>
  >(config$ =>
    config$.pipe(
      scan(
        (lastConfig, config) => ({ ...lastConfig, ...config }),
        initialFetchWordsConfig
      ),
      debounceTime(200),
      switchMap(config =>
        from(
          getWords(props.area, config).catch(e => {
            console.error(e)
            return { total: 0, words: [] }
          })
        ).pipe(startWith(null))
      ),
      startWith(null)
    )
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
  })

  return (
    <Layout className="wordpage-Container">
      <Header
        area={props.area}
        searchText={searchText}
        totalCount={10}
        selectedCount={12}
        onSearchTextChanged={text => {
          setSearchText(text)
          fetchWords({ searchText: text })
        }}
        onExport={() => {}}
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
    </Layout>
  )
}
