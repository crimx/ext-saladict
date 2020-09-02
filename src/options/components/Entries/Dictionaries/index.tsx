import React, { FC, useState, useLayoutEffect } from 'react'
import { Tooltip, Row, Col } from 'antd'
import { BlockOutlined } from '@ant-design/icons'
import { DictID } from '@/app-config'
import { useTranslate } from '@/_helpers/i18n'
import { useSelector } from '@/content/redux'
import { SortableList, reorder } from '@/options/components/SortableList'
import { SaladictModalForm } from '@/options/components/SaladictModalForm'
import { getProfilePath } from '@/options/helpers/path-joiner'
import { useCheckDictAuth } from '@/options/helpers/use-check-dict-auth'
import { useListLayout } from '@/options/helpers/layout'
import { useUpload } from '@/options/helpers/upload'
import { DictTitleMemo } from './DictTitle'
import { EditModal } from './EditModal'
import { AllDicts } from './AllDicts'

export const Dictionaries: FC = () => {
  const { t } = useTranslate(['options', 'common', 'dicts'])
  const checkDictAuth = useCheckDictAuth()
  const [editingDict, setEditingDict] = useState<DictID | null>(null)
  const [showAddModal, setShowAddModal] = useState(false)
  const listLayout = useListLayout()
  const dicts = useSelector(state => state.activeProfile.dicts)
  const upload = useUpload()

  // make a local copy to avoid flickering on drag end
  const [selectedDicts, setSelectedDicts] = useState<ReadonlyArray<DictID>>(
    dicts.selected
  )
  useLayoutEffect(() => {
    setSelectedDicts(dicts.selected)
  }, [dicts.selected])

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
          list={selectedDicts.map(id => ({
            value: id,
            title: <DictTitleMemo dictID={id} dictLangs={dicts.all[id].lang} />
          }))}
          onAdd={async () => {
            if (await checkDictAuth()) {
              setShowAddModal(true)
            }
          }}
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
          onOrderChanged={(oldIndex, newIndex) => {
            const newList = reorder(selectedDicts, oldIndex, newIndex)
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
