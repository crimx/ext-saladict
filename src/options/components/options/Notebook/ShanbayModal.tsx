import React from 'react'
import { Service, SyncConfig } from '@/background/sync-manager/services/shanbay'
import { setSyncConfig } from '@/background/sync-manager/helpers'
import { formItemModalLayout } from '../helpers'
import { MsgSyncServiceInit, MsgType, MsgSyncServiceUpload, SyncServiceUploadOp } from '@/typings/message'
import { message } from '@/_helpers/browser-api'
import { TranslationFunction } from 'i18next'
import { getWords } from '@/_helpers/record-manager'

import { Form, Modal, Button, Switch, message as AntdMessage } from 'antd'

export interface WebdavModalProps {
  syncConfig?: SyncConfig
  t: TranslationFunction
  show: boolean
  onClose: () => void
}

export interface ShanbayModalState {
  syncConfig: SyncConfig
}

export default class ShanbayModal extends React.Component<WebdavModalProps, ShanbayModalState> {
  state: ShanbayModalState = {
    syncConfig: this.props.syncConfig || Service.getDefaultConfig(),
  }

  closeSyncService = () => {
    this.props.onClose()
  }

  handleEnableChanged = async (checked: boolean) => {
    if (checked) {
      const response = await message.send<MsgSyncServiceInit<SyncConfig>>({
        type: MsgType.SyncServiceInit,
        serviceID: Service.id,
        config: this.state.syncConfig,
      }).catch((e) => ({ error: e }))

      if (response && response.error) {
        alert(this.props.t('sync_shanbay_login'))
        Service.openLogin()
        return
      }
    } else {
      setSyncConfig('shanbay', {
        ...this.state.syncConfig,
        enable: false,
      })
    }

    this.setState(prevState => ({
      syncConfig: {
        ...prevState.syncConfig,
        enable: checked,
      }
    }))
  }

  handleSyncAll = async () => {
    const { t } = this.props
    const { total } = await getWords('notebook', {
      itemsPerPage: 1,
      filters: {},
    })
    if (total > 50 && !confirm(t('sync_shanbay_sync_all_confirm'))) {
      return
    }

    AntdMessage.success(t('sync_start'))

    await message.send<MsgSyncServiceUpload>({
      type: MsgType.SyncServiceUpload,
      op: SyncServiceUploadOp.Add,
      serviceID: Service.id,
      force: true,
    })
    .catch(() => ({ error: 'unknown' }))
    .then(e => {
      if (e && e.error) {
        AntdMessage.success(t('sync_failed'))
      }
    })

    AntdMessage.success(t('sync_success'))
  }

  handleSyncLast = async () => {
    const { t } = this.props
    const { words } = await getWords('notebook', {
      itemsPerPage: 1,
      filters: {},
    })
    if (!words || words.length <= 0) {
      return
    }

    AntdMessage.success(t('sync_start'))

    await message.send<MsgSyncServiceUpload>({
      type: MsgType.SyncServiceUpload,
      op: SyncServiceUploadOp.Add,
      serviceID: Service.id,
      force: true,
      words,
    })
    .catch(() => ({ error: 'unknown' }))
    .then(e => {
      if (e && e.error) {
        AntdMessage.success(t('sync_failed'))
      }
    })

    AntdMessage.success(t('sync_success'))
  }

  render () {
    const { t, show } = this.props

    return (
      <Modal
        visible={show}
        title={t('sync_shanbay_title')}
        destroyOnClose
        onCancel={this.closeSyncService}
        footer={[]}
      >
        <Form>
          <p>{t('sync_shanbay_description')}</p>
          <Form.Item
            {...formItemModalLayout}
            label={t('common:enable')}
          >
            <Switch checked={this.state.syncConfig.enable} onChange={this.handleEnableChanged} />
          </Form.Item>
          {this.state.syncConfig.enable && (
            <div style={{ textAlign: 'center' }}>
              <Button
                onClick={this.handleSyncAll}
                style={{ marginRight: 10 }}
              >{t('sync_shanbay_sync_all')}</Button>
              <Button onClick={this.handleSyncLast}>{t('sync_shanbay_sync_last')}</Button>
            </div>
          )}
        </Form>
      </Modal>
    )
  }
}
