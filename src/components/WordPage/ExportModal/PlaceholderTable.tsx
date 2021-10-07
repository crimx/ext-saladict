import React, { FC } from 'react'
import { Table } from 'antd'
import { TFunction } from 'i18next'

export interface PlaceholderTableProps {
  t: TFunction
}

export const PlaceholderTable: FC<PlaceholderTableProps> = ({ t }) => (
  <Table
    rowKey="plcholderL"
    pagination={false}
    size="small"
    bordered={true}
    style={{ marginBottom: '1em' }}
    dataSource={[
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
      },
      {
        plcholderL: '%contextCloze%',
        contentL: t('common:note.contextCloze'),
        plcholderR: '',
        contentR: ''
      }
    ]}
    columns={[
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
    ]}
  />
)

export const PlaceholderTableMemo = React.memo(PlaceholderTable)
