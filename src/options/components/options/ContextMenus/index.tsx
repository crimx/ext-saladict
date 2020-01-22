import React from 'react'
import { AppConfigMutable } from '@/app-config'
import { updateConfig } from '@/_helpers/config-manager'
import { Props } from '../typings'
import { arrayMove } from '../helpers'
import SortableList, { SortableListItem, SortEnd } from '../../SortableList'
import EditModal, { EditModalItem } from './EditModal'
import AddModal from './AddModal'

import { Row, Col, message } from 'antd'

const isFirefox = navigator.userAgent.includes('Firefox')

export type ContextMenusProps = Props

interface ContextMenusState {
  showAddModal: boolean
  editingItem: EditModalItem | null
}

export class ContextMenus extends React.Component<
  ContextMenusProps,
  ContextMenusState
> {
  state: ContextMenusState = {
    showAddModal: false,
    editingItem: null
  }

  openAddModal = () => {
    this.setState({ showAddModal: true })
  }

  closeAddModal = () => {
    this.setState({ showAddModal: false })
  }

  openEditModal = (index: number) => {
    const { contextMenus } = this.props.config
    const id = contextMenus.selected[index]
    const item = contextMenus.all[id]
    if (!item) {
      if (process.env.DEV_BUILD) {
        console.error('menu not found', index, id)
      }
      return
    }
    this.setState({
      editingItem:
        typeof item === 'string'
          ? {
              name: this.props.t(`menus:${id}`),
              url: item,
              id
            }
          : {
              ...item,
              id
            }
    })
  }

  deleteItem = async (index: number) => {
    const { t, config } = this.props
    ;(config as AppConfigMutable).contextMenus.selected.splice(index, 1)
    await updateConfig(config)
    message.destroy()
    message.success(t('msg_updated'))
  }

  disableEdit = (index: number, item: SortableListItem) => {
    return this.props.config.contextMenus.all[item.value] === 'x'
  }

  handleEditModalClose = async (item?: EditModalItem) => {
    if (item) {
      const config = this.props.config as AppConfigMutable
      config.contextMenus.all[item.id] = {
        name: item.name,
        url: item.url
      }
      await updateConfig(config)
    }
    this.setState({ editingItem: null })
  }

  handleSortEnd = async ({ oldIndex, newIndex }: SortEnd) => {
    if (oldIndex === newIndex) {
      return
    }
    const { t, config } = this.props
    const contextMenus = (config as AppConfigMutable).contextMenus
    contextMenus.selected = arrayMove(contextMenus.selected, oldIndex, newIndex)
    await updateConfig(config)
    message.destroy()
    message.success(t('msg_updated'))
  }

  render() {
    const { t, config } = this.props
    const { editingItem, showAddModal } = this.state
    const allMenus = config.contextMenus.all

    return (
      <Row>
        <Col span={12}>
          <SortableList
            t={t}
            title={t('nav.ContextMenus')}
            description={<p>{t('opt.context_description')}</p>}
            list={config.contextMenus.selected
              .filter(id => {
                // FF policy
                if (isFirefox && id === 'youdao_page_translate') {
                  return false
                }
                return true
              })
              .map(id => {
                const item = allMenus[id]
                return {
                  value: id,
                  title: typeof item === 'string' ? t(`menus:${id}`) : item.name
                }
              })}
            disableEdit={this.disableEdit}
            onAdd={this.openAddModal}
            onEdit={this.openEditModal}
            onDelete={this.deleteItem}
            onSortEnd={this.handleSortEnd}
          />
          <AddModal
            t={t}
            config={config}
            show={showAddModal}
            onClose={this.closeAddModal}
          />
          <EditModal
            t={t}
            title={t('opt.context_menus_title')}
            item={editingItem}
            onClose={this.handleEditModalClose}
          />
        </Col>
      </Row>
    )
  }
}

export default ContextMenus
