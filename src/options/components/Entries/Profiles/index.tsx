import React, { FC, useState, useLayoutEffect } from 'react'
import { Row, Col, Modal, notification, message as antdMsg } from 'antd'
import { BlockOutlined } from '@ant-design/icons'
import { useTranslate, Trans } from '@/_helpers/i18n'
import {
  ProfileID,
  ProfileIDList,
  getDefaultProfileID
} from '@/app-config/profiles'
import {
  getProfileName,
  updateActiveProfileID,
  removeProfile,
  updateProfileIDList,
  addProfile
} from '@/_helpers/profile-manager'
import { useSelector } from '@/content/redux'
import { SortableList, reorder } from '@/options/components/SortableList'
import { useListLayout } from '@/options/helpers/layout'
import { useCheckDictAuth } from '@/options/helpers/use-check-dict-auth'
import { EditNameModal } from './EditNameModal'

export const Profiles: FC = () => {
  const { t } = useTranslate('options')
  const checkDictAuth = useCheckDictAuth()
  const activeProfileID = useSelector(state => state.activeProfile.id)
  const [showAddProfileModal, setShowAddProfileModal] = useState(false)
  const [showEditNameModal, setShowEditNameModal] = useState(false)
  const [editingProfileID, setEditingProfileID] = useState<ProfileID | null>(
    null
  )
  const listLayout = useListLayout()

  const storeProfileIDList = useSelector(state => state.profiles)
  // make a local copy to avoid flickering on drag end
  const [profileIDList, setProfileIDList] = useState<ProfileIDList>(
    storeProfileIDList
  )
  useLayoutEffect(() => {
    setProfileIDList(storeProfileIDList)
  }, [storeProfileIDList])

  const tryTo = async (action: () => any): Promise<void> => {
    try {
      await action()
      antdMsg.destroy()
      antdMsg.success(t('msg_updated'))
    } catch (error) {
      notification.error({
        message: 'Error',
        description: error.message
      })
    }
  }

  const onEditNameModalClose = (profileID?: ProfileID) => {
    setShowAddProfileModal(false)
    setShowEditNameModal(false)

    if (profileID) {
      tryTo(async () => {
        if (profileIDList.find(({ id }) => id === profileID.id)) {
          const newList = profileIDList.map(p =>
            p.id === profileID.id ? profileID : p
          )
          await updateProfileIDList(newList)
        } else {
          await addProfile(profileID)
        }
      })
    }
  }

  return (
    <Row>
      <Col {...listLayout}>
        <SortableList
          title={t('nav.Profiles')}
          description={
            <Trans message={t('profiles.opt.help')}>
              <BlockOutlined style={{ color: '#f5222d' }} />
              <kbd>↓</kbd>
            </Trans>
          }
          selected={activeProfileID}
          list={profileIDList.map(({ id, name }) => ({
            value: id,
            title: getProfileName(name, t)
          }))}
          onSelect={async ({ target: { value } }) => {
            if (await checkDictAuth()) {
              tryTo(() => updateActiveProfileID(value))
            }
          }}
          onAdd={() => {
            setEditingProfileID({
              ...getDefaultProfileID(),
              name: ''
            })
            setShowAddProfileModal(true)
          }}
          onEdit={index => {
            setEditingProfileID(
              profileIDList[index]
                ? {
                    ...profileIDList[index],
                    name: getProfileName(profileIDList[index].name, t)
                  }
                : getDefaultProfileID()
            )
            setShowEditNameModal(true)
          }}
          onDelete={index => {
            const { id, name } = profileIDList[index]
            Modal.confirm({
              title: t('profiles.opt.delete_confirm', {
                name: getProfileName(name, t)
              }),
              onOk: () => tryTo(() => removeProfile(id))
            })
          }}
          onOrderChanged={(oldIndex, newIndex) => {
            const newList = reorder(profileIDList, oldIndex, newIndex)
            setProfileIDList(newList)
            tryTo(() => updateProfileIDList(newList))
          }}
        />
        <EditNameModal
          title={t('profiles.opt.add_name')}
          show={showAddProfileModal}
          profileID={editingProfileID}
          onClose={onEditNameModalClose}
        />
        <EditNameModal
          title={t('profiles.opt.edit_name')}
          show={showEditNameModal}
          profileID={editingProfileID}
          onClose={onEditNameModalClose}
        />
      </Col>
    </Row>
  )
}
