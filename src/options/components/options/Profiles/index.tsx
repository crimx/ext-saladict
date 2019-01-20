import React from 'react'
import { Props } from '../typings'
import {
  ProfileID,
  getDefaultProfileID,
} from '@/app-config/profiles'
import {
  SortableContainer,
  SortableElement,
  SortableHandle,
  arrayMove,
  SortEnd,
} from 'react-sortable-hoc'
import {
  getProfileName,
  addProfile,
  getProfileIDList,
  getActiveProfileID,
  updateActiveProfileID,
  removeProfile,
  updateProfileIDList,
} from '@/_helpers/profile-manager'
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
  list: ProfileID[]
  editingProfileID: ProfileID | null
  showEditNameModal: boolean
  showAddProfileModal: boolean
}

export class Profiles extends React.Component<ProfilesProps, ProfilesState> {
  state: ProfilesState = {
    selected: '',
    list: [],
    editingProfileID: null,
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

  ProfileListItem = SortableElement<{ profileID: ProfileID }>(({ profileID }) => (
    <List.Item>
      <div style={itemStyle}>
        <Radio value={profileID.id}>{getProfileName(profileID.name, this.props.t)}</Radio>
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
              editingProfileID: profileID,
            })}
          />
          <Button
            title={this.props.t('common:delete')}
            style={btnSylte}
            shape='circle'
            size='small'
            icon='close'
            disabled={profileID.id === this.state.selected}
            onClick={() => this.deleteItem(profileID)}
          />
        </div>
      </div>
    </List.Item>
  ))

  ProfileList = SortableContainer<{ list: ProfileID[] }>(({ list }) => (
    <List
      size='large'
      dataSource={list}
      renderItem={(profileID: ProfileID, index: number) => React.createElement(
        this.ProfileListItem, { profileID, index }
      )}
    />
  ))

  constructor (props: ProfilesProps) {
    super(props)
    getProfileIDList().then(async idList => {
      this.setState({
        list: idList.filter(Boolean)
      })
    })
    getActiveProfileID().then(selected => {
      this.setState({ selected })
    })
  }

  handleProfileSelect = async ({ target: { value } }: RadioChangeEvent) => {
    this.setState({ selected: value })
    await updateActiveProfileID(value)
    message.destroy()
    message.success(this.props.t('msg_updated'))
  }

  deleteItem = async ({ name, id }: ProfileID) => {
    const { t } = this.props
    if (confirm(t('profiles_delete_confirm', { name: getProfileName(name, t) }))) {
      await removeProfile(id)
      this.setState(({ list }) => ({
        list: list.filter(profileID => profileID.id !== id),
      }))
      message.destroy()
      message.success(t('msg_updated'))
    }
  }

  handleAddProfileClose = async (name?: string) => {
    if (name) {
      const profileID = getDefaultProfileID()
      profileID.name = name
      await addProfile(profileID)
      this.setState(({ list }) => ({
        list: [...list, profileID],
        showAddProfileModal: false,
      }))
      message.destroy()
      message.success(this.props.t('msg_updated'))
    } else {
      this.setState({ showAddProfileModal: false })
    }
  }

  handleEditNameClose = async (name?: string) => {
    const { editingProfileID, list, selected } = this.state
    if (name && editingProfileID) {
      const newProfileID = {
        ...editingProfileID,
        name,
      }
      const newList = list.map(profile =>
        profile.id === newProfileID.id ? newProfileID : profile
      )
      await updateProfileIDList(newList)
      this.setState({
        list: newList,
        editingProfileID: null,
      })
      if (newProfileID.id !== selected) {
        // active config alert is handled by global
        message.destroy()
        message.success(this.props.t('msg_updated'))
      }
    } else {
      this.setState({
        editingProfileID: null,
        showEditNameModal: false,
      })
    }
  }

  handleSortEnd = ({ oldIndex, newIndex }: SortEnd) => {
    this.setState(({ list }) => {
      const newList = arrayMove(list, oldIndex, newIndex)
      updateProfileIDList(newList)
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
      editingProfileID,
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
          name={editingProfileID ? getProfileName(editingProfileID.name, t) : ''}
          onClose={this.handleEditNameClose}
        />
      </Col>
    )
  }
}

export default Profiles
