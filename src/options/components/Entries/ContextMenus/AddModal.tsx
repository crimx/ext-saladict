import React, { FC, useMemo } from 'react'
import { List, Modal, Button } from 'antd'
import { CheckOutlined, CloseOutlined, EditOutlined } from '@ant-design/icons'
import omit from 'lodash/omit'
import { useTranslate } from '@/_helpers/i18n'
import { isFirefox } from '@/_helpers/saladict'
import { genUniqueKey } from '@/_helpers/uniqueKey'
import { useSelector } from '@/content/redux'
import { getConfigPath } from '@/options/helpers/path-joiner'
import { useUpload } from '@/options/helpers/upload'

export interface AddModalProps {
  show: boolean
  onEdit: (menuID: string) => void
  onClose: () => void
}

export const AddModal: FC<AddModalProps> = ({ show, onEdit, onClose }) => {
  const { t } = useTranslate(['common', 'menus'])
  const contextMenus = useSelector(state => state.config.contextMenus)
  const unselected = useMemo(() => {
    if (!contextMenus) {
      return []
    }

    const selectedSet = new Set(contextMenus.selected as string[])
    return Object.keys(contextMenus.all).filter(id => {
      // FF policy
      if (isFirefox && id === 'youdao_page_translate') {
        return false
      }
      return !selectedSet.has(id)
    })
  }, [contextMenus])
  const upload = useUpload()

  return (
    <Modal
      visible={show}
      title={t('common:add')}
      destroyOnClose
      onOk={onClose}
      onCancel={onClose}
      footer={null}
    >
      <Button type="dashed" block onClick={addItem}>
        {t('common:add')}
      </Button>
      <List dataSource={unselected} renderItem={renderListItem} />
      <Button type="dashed" block onClick={addItem}>
        {t('common:add')}
      </Button>
    </Modal>
  )

  function renderListItem(menuID: string) {
    if (!contextMenus) return null

    const item = contextMenus.all[menuID]
    return (
      <List.Item>
        <div className="sortable-list-item">
          {typeof item === 'string' ? t(`menus:${menuID}`) : item.name}
          <div>
            <div>
              <Button
                title={t('common:add')}
                className="sortable-list-item-btn"
                shape="circle"
                size="small"
                icon={<CheckOutlined />}
                onClick={selectItem}
              />
              <Button
                title={t('common:edit')}
                className="sortable-list-item-btn"
                shape="circle"
                size="small"
                icon={<EditOutlined />}
                disabled={item === 'x' /** internal options */}
                onClick={() => onEdit(menuID)}
              />
              <Button
                title={t('common:delete')}
                disabled={item === 'x' /** internal options */}
                className="sortable-list-item-btn"
                shape="circle"
                size="small"
                icon={<CloseOutlined />}
                onClick={deleteItem}
              />
            </div>
          </div>
        </div>
      </List.Item>
    )

    function selectItem() {
      if (!contextMenus) return

      upload({
        [getConfigPath('contextMenus', 'selected')]: [
          ...contextMenus.selected,
          menuID
        ]
      })
    }

    function deleteItem() {
      if (!contextMenus) return

      Modal.confirm({
        title: t('common:delete_confirm'),
        okType: 'danger',
        onOk: () => {
          if (contextMenus.all[menuID] !== 'x') {
            upload({
              [getConfigPath('contextMenus')]: {
                ...contextMenus,
                selected: contextMenus.selected.filter(id => id !== menuID),
                all: omit(contextMenus.all, [menuID])
              }
            })
          }
        }
      })
    }
  }

  function addItem() {
    onEdit(`c_${genUniqueKey()}`)
  }
}
