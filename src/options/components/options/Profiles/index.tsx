import React from 'react'
import { Props } from '../typings'
import { AppConfig, appConfigFactory, AppConfigMutable } from '@/app-config'
import {
  SortableContainer,
  SortableElement,
  SortableHandle,
  arrayMove,
  SortEnd,
} from 'react-sortable-hoc'
import {
  getProfileName,
  addConfig,
  getConfig,
  updateConfig,
  removeConfig,
  getConfigIDList,
  updateConfigIDList,
  getActiveConfigID,
  updateActiveConfigID,
} from '@/_helpers/config-manager'
import EditNameModal from './EditNameModal'

import { Card, List, Button, Radio, Col, message, Icon } from 'antd'
import { RadioChangeEvent } from 'antd/lib/radio'

const btnSylte: React.CSSProperties = {
  marginLeft: 10,
  padding: 0,
  lineHeight: 1,
  border: 'none',
}

const itemStyle: React.CSSProperties = {
  width: '100%',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
}

export type ProfilesProps = Props

interface ProfilesState {
  selected: string,
  list: AppConfig[]
  editingConfig: AppConfig | null
  showEditNameModal: boolean
  showAddProfileModal: boolean
}

export class Profiles extends React.Component<ProfilesProps, ProfilesState> {
  state: ProfilesState = {
    selected: '',
    list: [],
    editingConfig: null,
    showEditNameModal: false,
    showAddProfileModal: false,
  }

  DragHandle = SortableHandle(() => (
    <Icon
      title={this.props.t('common:sort')}
      style={{ cursor: 'move' }}
      type='bars'
    />
  ))

  ProfileListItem = SortableElement<{ config: AppConfig }>(({ config }) => (
    <List.Item>
      <div style={itemStyle}>
        <Radio value={config.id}>{getProfileName(config.name, this.props.t)}</Radio>
        <div>
          {React.createElement(this.DragHandle)}
          <Button
            title={this.props.t('common:edit')}
            style={btnSylte}
            shape='circle'
            size='small'
            icon='edit'
            onClick={() => this.setState({
              showEditNameModal: true,
              editingConfig: config,
            })}
          />
          <Button
            title={this.props.t('common:delete')}
            style={btnSylte}
            shape='circle'
            size='small'
            icon='close'
            disabled={config.id === this.state.selected}
            onClick={() => this.deleteItem(config)}
          />
        </div>
      </div>
    </List.Item>
  ))

  ProfileList = SortableContainer<{ list: AppConfig[] }>(({ list }) => (
    <List
      size='large'
      dataSource={list}
      renderItem={(config: AppConfig, index: number) => React.createElement(
        this.ProfileListItem, { config, index }
      )}
    />
  ))

  constructor (props: ProfilesProps) {
    super(props)
    getConfigIDList().then(async idList => {
      if (!idList) { return }
      this.setState({
        list: (await Promise.all(idList.map(getConfig))).filter(Boolean) as AppConfig[]
      })
    })
    getActiveConfigID().then(selected => {
      this.setState({ selected })
    })
  }

  handleProfileSelect = ({ target: { value } }: RadioChangeEvent) => {
    this.setState({ selected: value })
    updateActiveConfigID(value)
  }

  deleteItem = async ({ name, id }: AppConfig) => {
    const { t } = this.props
    if (confirm(t('profiles_delete_confirm', { name: getProfileName(name, t) }))) {
      await removeConfig(id)
      this.setState(({ list }) => ({
        list: list.filter(config => config.id !== id),
      }))
      message.destroy()
      message.success(t('msg_updated'))
    }
  }

  handleAddProfileClose = async (name?: string) => {
    if (name) {
      const config = appConfigFactory() as AppConfigMutable
      config.name = name
      await addConfig(config)
      this.setState(({ list }) => ({
        list: [...list, config],
        showAddProfileModal: false,
      }))
      message.destroy()
      message.success(this.props.t('msg_updated'))
    } else {
      this.setState({ showAddProfileModal: false })
    }
  }

  handleEditNameClose = async (name?: string) => {
    const { editingConfig, list, selected } = this.state
    if (name && editingConfig) {
      const newConfig = {
        ...editingConfig,
        name,
      }
      await updateConfig(newConfig)
      this.setState({
        list: list.map(config => config === editingConfig ? newConfig : config),
        editingConfig: null,
      })
      if (newConfig.id !== selected) {
        // active config alert is handled by global
        message.destroy()
        message.success(this.props.t('msg_updated'))
      }
    } else {
      this.setState({
        editingConfig: null,
        showEditNameModal: false,
      })
    }
  }

  handleSortEnd = ({ oldIndex, newIndex }: SortEnd) => {
    this.setState(({ list }) => {
      const newList = arrayMove(list, oldIndex, newIndex)
      updateConfigIDList(newList.map(config => config.id))
        .then(() => {
          message.destroy()
          message.success(this.props.t('msg_updated'))
        })
      return { list: newList }
    })
  }

  render () {
    const { t } = this.props
    const {
      selected,
      list,
      editingConfig,
      showEditNameModal,
      showAddProfileModal,
    } = this.state

    return (
      <Col span={12}>
        <Card title={t('nav_Profiles')}>
          <p dangerouslySetInnerHTML={{ __html: t('profiles_help') }} />
          <Radio.Group
            value={selected}
            onChange={this.handleProfileSelect}
            style={{ display: 'block', marginBottom: 10 }}
          >
          {React.createElement(this.ProfileList, {
            useDragHandle: true,
            onSortEnd: this.handleSortEnd,
            list,
          })}
          </Radio.Group>
          {list.length <= 10 &&
            <Button
              type='dashed'
              style={{ width: '100%' }}
              onClick={() => this.setState({ showAddProfileModal: true })}
            >
              <Icon type='plus' /> {t('common:add')}
            </Button>
          }
        </Card>
        <EditNameModal
          title={t('profiles_add_name')}
          show={showAddProfileModal}
          name=''
          onClose={this.handleAddProfileClose}
        />
        <EditNameModal
          title={t('profiles_edit_name')}
          show={showEditNameModal}
          name={editingConfig ? getProfileName(editingConfig.name, t) : ''}
          onClose={this.handleEditNameClose}
        />
      </Col>
    )
  }
}

export default Profiles
