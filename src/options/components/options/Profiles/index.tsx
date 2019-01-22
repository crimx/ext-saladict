import React from 'react'
import { Props } from '../typings'
import {
  ProfileID,
  getDefaultProfileID,
} from '@/app-config/profiles'
import {
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
import SortableList from '../../SortableList'

import { Row, Col, message } from 'antd'
import { RadioChangeEvent } from 'antd/lib/radio'

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

  openAddProfileModal = () => {
    this.setState({ showAddProfileModal: true })
  }

  editProfileName = (index: number) => {
    this.setState({
      showEditNameModal: true,
      editingProfileID: this.state.list[index],
    })
  }

  handleProfileSelect = async ({ target: { value } }: RadioChangeEvent) => {
    this.setState({ selected: value })
    await updateActiveProfileID(value)
    message.destroy()
    message.success(this.props.t('msg_updated'))
  }

  deleteItem = async (index: number) => {
    const { t } = this.props
    const { name, id } = this.state.list[index]
    if (confirm(t('profiles_delete_confirm', { name: getProfileName(name, t) }))) {
      await removeProfile(id)
      this.setState(({ list }) => ({
        list: list.filter(profileID => profileID.id !== id),
      }))
      message.destroy()
      message.success(t('msg_updated'))
    }
  }

  handleAddProfileClose = async (name = '') => {
    name = name.trim()
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
        showEditNameModal: false,
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
    if (oldIndex === newIndex) { return }
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
      <Row>
        <Col span={12}>
          <SortableList
            t={t}
            title={t('nav_Profiles')}
            description={
              <p dangerouslySetInnerHTML={{ __html: t('profiles_help') }} />
            }
            list={list.map(profileID => ({
              value: profileID.id,
              title: getProfileName(profileID.name, t)
            }))}
            selected={selected}
            onSelect={this.handleProfileSelect}
            onAdd={this.openAddProfileModal}
            onEdit={this.editProfileName}
            onDelete={this.deleteItem}
            onSortEnd={this.handleSortEnd}
          />
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
      </Row>
    )
  }
}

export default Profiles
