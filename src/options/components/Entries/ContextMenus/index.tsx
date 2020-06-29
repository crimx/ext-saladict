import React, { FC, useState, useLayoutEffect } from 'react'
import { Row, Col } from 'antd'
import { isFirefox } from '@/_helpers/saladict'
import { useTranslate } from '@/_helpers/i18n'
import { SortableList, arrayMove } from '@/options/components/SortableList'
import { getConfigPath } from '@/options/helpers/path-joiner'
import { useListLayout } from '@/options/helpers/layout'
import { useUpload } from '@/options/helpers/upload'
import { useSelector } from '@/options/redux/modules'
import { AddModal } from './AddModal'
import { EditModal } from './EditeModal'

export const ContextMenus: FC = () => {
  const { t } = useTranslate(['options', 'common', 'menus'])
  const upload = useUpload()
  const [showAddModal, setShowAddModal] = useState(false)
  const [editingMenu, setEditingMenu] = useState<string | null>(null)
  const listLayout = useListLayout()
  const contextMenus = useSelector(state => state.config.contextMenus)
  // make a local copy to avoid flickering on drag end
  const [selectedMenus, setSelectedMenus] = useState<ReadonlyArray<string>>(
    contextMenus.selected
  )
  useLayoutEffect(() => {
    setSelectedMenus(contextMenus.selected)
  }, [contextMenus.selected])

  return (
    <Row>
      <Col {...listLayout}>
        <SortableList
          title={t('nav.ContextMenus')}
          description={<p>{t('config.opt.contextMenus_description')}</p>}
          list={selectedMenus
            .filter(id => {
              // FF policy
              if (isFirefox && id === 'youdao_page_translate') {
                return false
              }
              return true
            })
            .map(id => {
              const item = contextMenus.all[id]
              return {
                value: id,
                title: typeof item === 'string' ? t(`menus:${id}`) : item.name
              }
            })}
          disableEdit={(index, item) => contextMenus.all[item.value] === 'x'}
          onAdd={() => setShowAddModal(true)}
          onEdit={index => {
            setEditingMenu(selectedMenus[index])
          }}
          onDelete={index => {
            const newList = selectedMenus.slice()
            newList.splice(index, 1)
            upload({
              [getConfigPath('contextMenus', 'selected')]: newList
            })
            setSelectedMenus(newList)
          }}
          onSortEnd={({ oldIndex, newIndex }) => {
            if (oldIndex === newIndex) {
              return
            }
            const newList = arrayMove(selectedMenus.slice(), oldIndex, newIndex)
            upload({
              [getConfigPath('contextMenus', 'selected')]: newList
            })
            setSelectedMenus(newList)
          }}
        />
      </Col>
      <AddModal
        show={showAddModal}
        onEdit={setEditingMenu}
        onClose={() => setShowAddModal(false)}
      />
      <EditModal menuID={editingMenu} onClose={() => setEditingMenu(null)} />
    </Row>
  )
}
