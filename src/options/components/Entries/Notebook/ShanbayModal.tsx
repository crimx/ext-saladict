import React, { FC, useState } from 'react'
import { Modal, Button, Switch, message as AntdMsg, notification } from 'antd'
import { Service, SyncConfig } from '@/background/sync-manager/services/shanbay'
import { setSyncConfig as uploadSyncConfig } from '@/background/sync-manager/helpers'
import { message } from '@/_helpers/browser-api'
import { getWords } from '@/_helpers/record-manager'
import { useTranslate } from '@/_helpers/i18n'

export interface WebdavModalProps {
  syncConfig?: SyncConfig
  show: boolean
  onClose: () => void
}

export const ShanbayModal: FC<WebdavModalProps> = props => {
  const { t } = useTranslate(['options', 'common'])
  const [syncConfig, setSyncConfig] = useState<SyncConfig>(
    props.syncConfig || { enable: false }
  )

  return (
    <Modal
      visible={props.show}
      title={t('syncService.shanbay.title')}
      destroyOnClose
      onCancel={props.onClose}
      footer={null}
    >
      <p>{t('syncService.shanbay.description')}</p>
      <div style={{ textAlign: 'center', marginBottom: 20 }}>
        {t('common:enable')}：
        <Switch checked={syncConfig.enable} onChange={onToggleEnable} />
      </div>
      {syncConfig.enable && (
        <div style={{ textAlign: 'center' }}>
          <Button onClick={onSyncAll} style={{ marginRight: 10 }}>
            {t('syncService.shanbay.sync_all')}
          </Button>
          <Button onClick={onSyncLast}>
            {t('syncService.shanbay.sync_last')}
          </Button>
        </div>
      )}
    </Modal>
  )

  async function onToggleEnable(enable: boolean) {
    const newConfig = {
      ...syncConfig,
      enable
    }
    if (enable) {
      try {
        await message.send<'SYNC_SERVICE_INIT', SyncConfig>({
          type: 'SYNC_SERVICE_INIT',
          payload: {
            serviceID: Service.id,
            config: newConfig
          }
        })
      } catch (e) {
        Modal.confirm({
          title: t('syncService.shanbay.login'),
          onOk: () => {
            Service.openLogin()
          }
        })
        return
      }
    }

    try {
      await uploadSyncConfig('shanbay', newConfig)
      setSyncConfig(newConfig)
      AntdMsg.destroy()
      AntdMsg.success(t('msg_updated'))
    } catch (e) {
      notification.error({
        message: t('config.opt.upload_error'),
        description: e?.message
      })
    }
  }

  async function onSyncAll() {
    const { total } = await getWords('notebook', {
      itemsPerPage: 1,
      filters: {}
    })
    if (total > 50 && !confirm(t('syncService.shanbay.sync_all_confirm'))) {
      return
    }

    AntdMsg.destroy()
    AntdMsg.success(t('sync.start'))

    try {
      await message.send<'SYNC_SERVICE_UPLOAD'>({
        type: 'SYNC_SERVICE_UPLOAD',
        payload: {
          op: 'ADD',
          serviceID: Service.id,
          force: true
        }
      })
      AntdMsg.success(t('sync.success'))
    } catch (e) {
      notification.error({
        message: t('sync.failed'),
        description: e?.message
      })
    }
  }

  async function onSyncLast() {
    const { words } = await getWords('notebook', {
      itemsPerPage: 1,
      filters: {}
    })
    if (!words || words.length <= 0) {
      return
    }

    AntdMsg.destroy()
    AntdMsg.success(t('sync.start'))

    try {
      await message.send({
        type: 'SYNC_SERVICE_UPLOAD',
        payload: {
          op: 'ADD',
          serviceID: Service.id,
          force: true,
          words
        }
      })
      AntdMsg.success(t('sync.success'))
    } catch (e) {
      notification.error({
        message: t('sync.failed'),
        description: e?.message
      })
    }
  }
}
