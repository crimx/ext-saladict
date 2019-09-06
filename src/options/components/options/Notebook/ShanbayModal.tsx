import React from 'react'
import { Service, SyncConfig } from '@/background/sync-manager/services/shanbay'
import { setSyncConfig } from '@/background/sync-manager/helpers'
import { formItemModalLayout } from '../helpers'
import { message } from '@/_helpers/browser-api'
import { TFunction } from 'i18next'
import { getWords } from '@/_helpers/record-manager'

import { Form, Modal, Button, Switch, message as AntdMessage } from 'antd'

export interface WebdavModalProps {
  syncConfig?: SyncConfig
  t: TFunction
  show: boolean
  onClose: () => void
}

export interface ShanbayModalState {
  syncConfig: SyncConfig
}

export default class ShanbayModal extends React.Component<
  WebdavModalProps,
  ShanbayModalState
> {
  state: ShanbayModalState = {
    syncConfig: this.props.syncConfig || Service.getDefaultConfig()
  }

  closeSyncService = () => {
    this.props.onClose()
  }

  handleEnableChanged = async (checked: boolean) => {
    if (checked) {
      const response = await message
        .send<'SYNC_SERVICE_INIT', SyncConfig>({
          type: 'SYNC_SERVICE_INIT',
          payload: {
            serviceID: Service.id,
            config: this.state.syncConfig
          }
        })
        .catch(e => ({ error: e }))

      if (response && response['error']) {
        alert(this.props.t('sync.shanbay.login'))
        Service.openLogin()
        return
      }
    } else {
      setSyncConfig('shanbay', {
        ...this.state.syncConfig,
        enable: false
      })
    }

    this.setState(prevState => ({
      syncConfig: {
        ...prevState.syncConfig,
        enable: checked
      }
    }))
  }

  handleSyncAll = async () => {
    const { t } = this.props
    const { total } = await getWords('notebook', {
      itemsPerPage: 1,
      filters: {}
    })
    if (total > 50 && !confirm(t('sync.shanbay.sync_all_confirm'))) {
      return
    }

    AntdMessage.success(t('sync.start'))

    await message
      .send<'SYNC_SERVICE_UPLOAD'>({
        type: 'SYNC_SERVICE_UPLOAD',
        payload: {
          op: 'ADD',
          serviceID: Service.id,
          force: true
        }
      })
      .catch(() => ({ error: 'unknown' }))
      .then(e => {
        if (e && e.error) {
          AntdMessage.success(t('sync.failed'))
        }
      })

    AntdMessage.success(t('sync.success'))
  }

  handleSyncLast = async () => {
    const { t } = this.props
    const { words } = await getWords('notebook', {
      itemsPerPage: 1,
      filters: {}
    })
    if (!words || words.length <= 0) {
      return
    }

    AntdMessage.success(t('sync.start'))

    await message
      .send({
        type: 'SYNC_SERVICE_UPLOAD',
        payload: {
          op: 'ADD',
          serviceID: Service.id,
          force: true,
          words
        }
      })
      .catch(() => ({ error: 'unknown' }))
      .then(e => {
        if (e && e.error) {
          AntdMessage.success(t('sync.failed'))
        }
      })

    AntdMessage.success(t('sync.success'))
  }

  render() {
    const { t, show } = this.props

    return (
      <Modal
        visible={show}
        title={t('sync.shanbay.title')}
        destroyOnClose
        onCancel={this.closeSyncService}
        footer={[]}
      >
        <Form>
          <p>{t('sync.shanbay.description')}</p>
          <Form.Item {...formItemModalLayout} label={t('common:enable')}>
            <Switch
              checked={this.state.syncConfig.enable}
              onChange={this.handleEnableChanged}
            />
          </Form.Item>
          {this.state.syncConfig.enable && (
            <div style={{ textAlign: 'center' }}>
              <Button onClick={this.handleSyncAll} style={{ marginRight: 10 }}>
                {t('sync.shanbay.sync_all')}
              </Button>
              <Button onClick={this.handleSyncLast}>
                {t('sync.shanbay.sync_last')}
              </Button>
            </div>
          )}
        </Form>
      </Modal>
    )
  }
}
