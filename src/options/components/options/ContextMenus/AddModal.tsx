import React from 'react'
import { TFunction } from 'i18next'
import { AppConfig, AppConfigMutable } from '@/app-config'
import { updateConfig } from '@/_helpers/config-manager'
import AddNewItem from './AddNewItem'

import { Modal, List, Card, Button } from 'antd'

const isFirefox = navigator.userAgent.includes('Firefox')

export type AddModalProps = {
  t: TFunction
  config: AppConfig
  show: boolean
  onClose?: () => void
}

export class AddModal extends React.Component<AddModalProps> {
  addItem = (id: string) => {
    const { config } = this.props
    ;(config as AppConfigMutable).contextMenus.selected.push(id)
    updateConfig(config)
  }

  deleteItem = (id: string) => {
    const { config, t } = this.props
    if (confirm(t('common:delete_confirm'))) {
      delete (config as AppConfigMutable).contextMenus.all[id]
      updateConfig(config)
    }
  }

  renderItem = (id: string) => {
    const { t, config } = this.props
    const item = config.contextMenus.all[id]

    return (
      <List.Item>
        <div className="sortable-list-item">
          {typeof item === 'string' ? t(`menus:${id}`) : item.name}
          <div>
            <Button
              title={t('common:add')}
              className="sortable-list-item-btn"
              shape="circle"
              size="small"
              icon="check"
              onClick={() => this.addItem(id)}
            />
            <Button
              title={t('common:delete')}
              disabled={item === 'x' /** internal options */}
              className="sortable-list-item-btn"
              shape="circle"
              size="small"
              icon="close"
              onClick={() => this.deleteItem(id)}
            />
          </div>
        </div>
      </List.Item>
    )
  }

  render() {
    const { onClose, show, t, config } = this.props
    const selectedSet = new Set(config.contextMenus.selected as string[])
    const unselected = Object.keys(config.contextMenus.all).filter(id => {
      // FF policy
      if (isFirefox && id === 'youdao_page_translate') {
        return false
      }
      return !selectedSet.has(id)
    })

    return (
      <Modal
        visible={show}
        title={t('common:add')}
        destroyOnClose
        onOk={onClose}
        onCancel={onClose}
        footer={null}
      >
        <Card>
          <List
            size="large"
            dataSource={unselected}
            renderItem={this.renderItem}
          />
        </Card>
        <AddNewItem t={t} config={config} />
      </Modal>
    )
  }
}

export default AddModal
