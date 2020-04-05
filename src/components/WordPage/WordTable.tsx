import React, { FC, ReactNode, useMemo } from 'react'
import i18next, { TFunction } from 'i18next'
import { Button, Tooltip } from 'antd'
import Table, { ColumnsType, TableProps } from 'antd/lib/table'
import { Word, DBArea } from '@/_helpers/record-manager'
import { message } from '@/_helpers/browser-api'
import { useTranslate } from '@/_helpers/i18n'

export const colSelectionWidth = 48
const colDateWidth = 150
const colEditWidth = 80
const fixedWidth = colSelectionWidth + colDateWidth + colEditWidth
const colTextWidth = `calc((100vw - ${fixedWidth}px) / 7)`
const restWidth = `calc((100vw - ${fixedWidth}px) * 2 / 7)`

export interface WordTableProps
  extends Pick<
    TableProps<Word>,
    'dataSource' | 'pagination' | 'rowSelection' | 'onChange' | 'loading'
  > {
  area: DBArea
}

export const WordTable: FC<WordTableProps> = props => {
  const { t, ready } = useTranslate('wordpage')

  const tableColumns = useMemo<ColumnsType<Word>>(
    () => [
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
        render: renderSource
      },
      {
        title: t('column.trans'),
        dataIndex: 'trans',
        key: 'trans',
        width: restWidth,
        render: renderTrans
      },
      {
        title: t('column.note'),
        dataIndex: 'note',
        key: 'note',
        width: restWidth,
        render: renderNote
      },
      {
        title: t('column.date'),
        dataIndex: 'date',
        key: 'date',
        width: colDateWidth,
        align: 'center',
        sorter: true,
        render: renderDate
      },
      {
        title: t(`column.${props.area === 'notebook' ? 'edit' : 'add'}`),
        key: 'edit',
        align: 'center',
        render: (_, record) => renderEdit(t, props.area, record)
      }
    ],
    [ready, props.area]
  )

  return (
    <Table
      rowKey="date"
      columns={tableColumns}
      bordered={true}
      showHeader={true}
      dataSource={props.dataSource}
      pagination={props.pagination}
      rowSelection={props.rowSelection}
      onChange={props.onChange}
      loading={props.loading}
    />
  )
}

function renderSource(_: any, record: Word): ReactNode {
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

function renderParagraphs(text?: string): ReactNode {
  if (!text) {
    return ''
  }
  return text.split('\n').map((line, i) => <div key={i}>{line}</div>)
}

function renderTrans(_: any, record: Word): ReactNode {
  return renderParagraphs(record.trans)
}

function renderNote(_: any, record: Word): ReactNode {
  return renderParagraphs(record.note)
}

function renderDate(datenum: number): ReactNode {
  const date = new Date(datenum)
  return (
    <Tooltip
      key={datenum}
      placement="topRight"
      title={date.toLocaleString(i18next.language)}
    >
      <>{date.toLocaleDateString(i18next.language)}</>
    </Tooltip>
  )
}

function renderEdit(t: TFunction, area: DBArea, record: Word): ReactNode {
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
