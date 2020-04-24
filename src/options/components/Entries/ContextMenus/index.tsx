import React, { FC, useContext, useState } from 'react'
import { Row, Col } from 'antd'
import { useSubscription } from 'observable-hooks'
import { isFirefox } from '@/_helpers/saladict'
import { useTranslate } from '@/_helpers/i18n'
import { GlobalsContext, config$$ } from '@/options/data'
import { SortableList, arrayMove } from '@/options/components/SortableList'
import { getConfigPath } from '@/options/helpers/path-joiner'
import { upload } from '@/options/helpers/upload'
import { useListLayout } from '@/options/helpers/layout'
import { AddModal } from './AddModal'
import { EditModal } from './EditeModal'

export const ContextMenus: FC = () => {
  const { t } = useTranslate(['options', 'common', 'menus'])
  const globals = useContext(GlobalsContext)
  const [showAddModal, setShowAddModal] = useState(false)
  const [editingMenu, setEditingMenu] = useState<string | null>(null)
  const listLayout = useListLayout()

  // make a local copy to avoid flickering on drag end
  const [selectedMenus, setSelectedMenus] = useState<ReadonlyArray<string>>([])
  useSubscription(config$$, config => {
    setSelectedMenus(config.contextMenus.selected)
  })

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
              const item = globals.config.contextMenus.all[id]
              return {
                value: id,
                title: typeof item === 'string' ? t(`menus:${id}`) : item.name
              }
            })}
          disableEdit={(index, item) =>
            globals.config.contextMenus.all[item.value] === 'x'
          }
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
