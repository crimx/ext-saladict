/* eslint-disable no-throw-literal */
import React, { FC, useState, useRef } from 'react'
import {
  Form,
  Input,
  Modal,
  Button,
  message as antdMsg,
  notification,
  Switch
} from 'antd'
import { FormInstance } from 'antd/lib/form'
import { ExclamationCircleOutlined } from '@ant-design/icons'
import { Service, SyncConfig } from '@/background/sync-manager/services/webdav'
import {
  removeSyncConfig,
  setSyncConfig
} from '@/background/sync-manager/helpers'
import { useTranslate } from '@/_helpers/i18n'
import { InputNumberGroup } from '@/options/components/InputNumberGroup'

export interface WebdavModalProps {
  syncConfig?: SyncConfig
  show: boolean
  onClose: () => void
}

export const WebdavModal: FC<WebdavModalProps> = props => {
  const { t, i18n } = useTranslate(['options', 'common', 'sync'])
  const [serviceChecking, setServiceChecking] = useState(false)
  const formRef = useRef<FormInstance>(null)

  return (
    <Modal
      visible={props.show}
      title={t('sync:webdav.title')}
      onOk={submitForm}
      onCancel={closeModal}
      destroyOnClose
      footer={[
        <Button key="delete" type="primary" danger onClick={deleteService}>
          {t('common:delete')}
        </Button>,
        <Button
          key="verify"
          disabled={serviceChecking}
          loading={serviceChecking}
          onClick={verifyService}
        >
          {t('syncService.webdav.verify')}
        </Button>,
        <Button
          key="save"
          type="primary"
          disabled={serviceChecking}
          onClick={submitForm}
        >
          {t('common:save')}
        </Button>,
        <Button key="cancel" onClick={closeModal}>
          {t('common:cancel')}
        </Button>
      ]}
    >
      <Form
        ref={formRef}
        initialValues={props.syncConfig || Service.getDefaultConfig()}
        labelCol={{ span: 5 }}
        wrapperCol={{ span: 18 }}
        onFinish={saveService}
      >
        <p>
          {t('syncService.webdav.description')}
          <a
            href="http://help.jianguoyun.com/?p=2064"
            target="_blank"
            rel="noopener noreferrer"
          >
            {t('syncService.webdav.jianguo')}
          </a>
        </p>
        <Form.Item
          name="enable"
          label={t('common:enable')}
          valuePropName="checked"
        >
          <Switch />
        </Form.Item>
        <Form.Item
          name="url"
          label={t('syncService.webdav.url')}
          hasFeedback
          rules={[
            { type: 'url', message: t('form.url_error'), required: true }
          ]}
        >
          <Input />
        </Form.Item>
        <Form.Item name="user" label={t('syncService.webdav.user')}>
          <Input />
        </Form.Item>
        <Form.Item name="passwd" label={t('syncService.webdav.passwd')}>
          <Input type="password" />
        </Form.Item>
        <Form.Item
          name="duration"
          label={t('syncService.webdav.duration')}
          extra={t('syncService.webdav.duration_help')}
          rules={[
            { type: 'number', message: t('form.number_error'), required: true }
          ]}
        >
          <InputNumberGroup suffix={t('common:unit.mins')} />
        </Form.Item>
      </Form>
    </Modal>
  )

  function submitForm() {
    if (formRef.current) {
      formRef.current.submit()
    }
  }

  function closeModal() {
    if (formRef.current && formRef.current.isFieldsTouched()) {
      Modal.confirm({
        title: t('syncService.close_confirm'),
        icon: <ExclamationCircleOutlined />,
        okType: 'danger',
        onOk: props.onClose
      })
    } else {
      props.onClose()
    }
  }

  function deleteService() {
    Modal.confirm({
      title: t('syncService.delete_confirm'),
      onOk: () =>
        tryTo(async () => {
          await removeSyncConfig(Service.id)
          props.onClose()
        })
    })
  }

  async function verifyService() {
    const config = extractConfigFromForm()
    if (!config) return

    setServiceChecking(true)

    const service = new Service(config)

    try {
      if (!config.url) {
        throw new Error('network')
      }
      try {
        await service.init()
      } catch (error) {
        const errorText = typeof error === 'string' ? error : error.message
        if (errorText !== 'exist') {
          throw error
        }
        if (confirm(t('syncService.webdav.exist_confirm'))) {
          await service.download({ noCache: true })
        }
      }
      if (confirm(t('syncService.webdav.upload_confirm'))) {
        await service.add({ force: true })
      }
      notification.success({ message: t('syncService.webdav.verified') })
    } catch (error) {
      notifyError(error)
    }

    setServiceChecking(false)
  }

  async function saveService() {
    const config = extractConfigFromForm()
    if (!config) return

    if (config.enable) {
      if (!config.url) {
        return notifyError('network')
      }

      setServiceChecking(true)

      const service = new Service(config)

      try {
        const dir = await service.checkDir()
        if (!dir) {
          throw new Error('missing')
        }
      } catch (e) {
        setServiceChecking(false)
        return notifyError(e)
      }

      service.setMeta({})
      setServiceChecking(false)
    }

    try {
      await setSyncConfig(Service.id, config)
      props.onClose()
    } catch (error) {
      notifyError(error)
    }
  }

  function extractConfigFromForm(): SyncConfig | undefined {
    if (!formRef.current) {
      if (process.env.DEBUG) {
        console.error(new Error('Missing form ref when saving service'))
      }
      notification.error({
        message: 'Error',
        description: t('sync:webdav.error.internal')
      })
      return
    }

    const values = formRef.current.getFieldsValue()

    return {
      ...values,
      url:
        values.url && !values.url.endsWith('/')
          ? (values.url += '/')
          : values.url
    } as SyncConfig
  }

  async function tryTo(action: () => any): Promise<void> {
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

  function notifyError(error: Error | string) {
    const errorText = typeof error === 'string' ? error : error.message
    const msgPath = 'sync:webdav.error.' + errorText
    const description = i18n.exists(msgPath) ? t(msgPath) : errorText
    notification.error({ message: 'Error', description })
  }
}

export default WebdavModal
