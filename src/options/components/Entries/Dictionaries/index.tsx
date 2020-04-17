import React, { FC, useContext, useState } from 'react'
import { Tooltip, Row, Col } from 'antd'
import { BlockOutlined } from '@ant-design/icons'
import { useObservableGetState } from 'observable-hooks'
import { useTranslate } from '@/_helpers/i18n'
import { GlobalsContext, profile$$ } from '@/options/data'
import { SortableList } from '@/options/components/SortableList'
import { DictTitleMemo } from './DictTitle'
import { EditModal } from './EditModal'
import { DictID } from '@/app-config'

export const Dictionaries: FC = () => {
  const { t } = useTranslate(['options', 'common', 'dicts'])
  const globals = useContext(GlobalsContext)
  const selectedDicts = useObservableGetState(profile$$, 'dicts', 'selected')!
  const [editingDict, setEditingDict] = useState<DictID | null>(null)

  return (
    <Row>
      <Col span={14}>
        <SortableList
          title={
            <Tooltip
              title={t('profile.opt.item_extra')}
              className="saladict-form-profile-title"
            >
              <span>
                <BlockOutlined />
                {t('opt.dict_selected')}
              </span>
            </Tooltip>
          }
          list={selectedDicts.map(id => {
            return {
              value: id,
              title: (
                <DictTitleMemo
                  dictID={id}
                  dictLangs={globals.profile.dicts.all[id].lang}
                />
              )
            }
          })}
          onAdd={() => {}}
          onEdit={index => {
            setEditingDict(selectedDicts[index])
          }}
          onDelete={() => {}}
          onSortEnd={() => {}}
        />
      </Col>
      <EditModal dictID={editingDict} onClose={() => setEditingDict(null)} />
    </Row>
  )
}
