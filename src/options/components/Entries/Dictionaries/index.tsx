import React, { FC, useContext, useState } from 'react'
import { Tooltip, Row, Col } from 'antd'
import { BlockOutlined } from '@ant-design/icons'
import { useSubscription } from 'observable-hooks'
import { DictID } from '@/app-config'
import { useTranslate } from '@/_helpers/i18n'
import { GlobalsContext, profile$$ } from '@/options/data'
import { SortableList, arrayMove } from '@/options/components/SortableList'
import { SaladictModalForm } from '@/options/components/SaladictModalForm'
import { getProfilePath } from '@/options/helpers/path-joiner'
import { upload } from '@/options/helpers/upload'
import { useListLayout } from '@/options/helpers/layout'
import { DictTitleMemo } from './DictTitle'
import { EditModal } from './EditModal'
import { AllDicts } from './AllDicts'

export const Dictionaries: FC = () => {
  const { t } = useTranslate(['options', 'common', 'dicts'])
  const globals = useContext(GlobalsContext)
  const [editingDict, setEditingDict] = useState<DictID | null>(null)
  const [showAddModal, setShowAddModal] = useState(false)
  const listLayout = useListLayout()

  // make a local copy to avoid flickering on drag end
  const [selectedDicts, setSelectedDicts] = useState<ReadonlyArray<DictID>>([])
  useSubscription(profile$$, profile => {
    setSelectedDicts(profile.dicts.selected)
  })

  return (
    <Row>
      <Col {...listLayout}>
        <SortableList
          title={
            <Tooltip
              title={t('profile.opt.item_extra')}
              className="saladict-form-profile-title"
            >
              <span>
                <BlockOutlined />
                {t('profile.opt.dict_selected')}
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
          onAdd={() => setShowAddModal(true)}
          onEdit={index => {
            setEditingDict(selectedDicts[index])
          }}
          onDelete={index => {
            const newList = selectedDicts.slice()
            newList.splice(index, 1)

            upload({
              [getProfilePath('dicts', 'selected')]: newList
            })
            setSelectedDicts(newList)
          }}
          onSortEnd={({ oldIndex, newIndex }) => {
            if (oldIndex === newIndex) {
              return
            }
            const newList = arrayMove(selectedDicts.slice(), oldIndex, newIndex)
            upload({
              [getProfilePath('dicts', 'selected')]: newList
            })
            setSelectedDicts(newList)
          }}
        />
      </Col>
      <SaladictModalForm
        visible={showAddModal}
        title={t('dict.add')}
        onClose={() => setShowAddModal(false)}
        wrapperCol={{ span: 24 }}
        items={[
          {
            name: getProfilePath('dicts', 'selected'),
            label: null,
            help: null,
            extra: null,
            children: <AllDicts />
          }
        ]}
      />
      <EditModal dictID={editingDict} onClose={() => setEditingDict(null)} />
    </Row>
  )
}
