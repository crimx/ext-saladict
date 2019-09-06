import React from 'react'
import { DictID } from '@/app-config'
import { updateProfile } from '@/_helpers/profile-manager'
import { Props } from '../typings'
import DictTitle from './DictTitle'

import { Modal, List, Card, Button } from 'antd'

export type AddDictModalProps = Props & {
  show: boolean
  onClose?: () => void
}

export class AddDictModal extends React.Component<AddDictModalProps> {
  addDict = (dictID: DictID) => {
    const { profile } = this.props
    ;(profile.dicts.selected as DictID[]).push(dictID)
    updateProfile(profile)
  }

  renderItem = (dictID: DictID) => {
    const { t, profile } = this.props

    return (
      <List.Item>
        <div className="sortable-list-item">
          <DictTitle
            t={t}
            dictID={dictID}
            lang={profile.dicts.all[dictID].lang}
          />
          <div>
            <Button
              title={t('common:add')}
              className="sortable-list-item-btn"
              shape="circle"
              size="small"
              icon="check"
              onClick={() => this.addDict(dictID)}
            />
          </div>
        </div>
      </List.Item>
    )
  }

  render() {
    const { onClose, show, t, profile } = this.props
    const selectedSet = new Set(profile.dicts.selected as string[])
    const unselected = Object.keys(profile.dicts.all).filter(
      (id): id is DictID => !selectedSet.has(id)
    )

    return (
      <Modal
        visible={show}
        title={t('dict.add')}
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
      </Modal>
    )
  }
}

export default AddDictModal
