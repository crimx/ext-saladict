import React, { FC, useState, useRef } from 'react'
import {
  Modal,
  Button,
  Form,
  Input,
  Switch,
  message as AntdMsg,
  notification
} from 'antd'
import { FormInstance } from 'antd/lib/form'
import { ExclamationCircleOutlined } from '@ant-design/icons'
import { Service, SyncConfig } from '@/background/sync-manager/services/eudic'
import { setSyncConfig } from '@/background/sync-manager/helpers'
import { getWords } from '@/_helpers/record-manager'
import { useTranslate } from '@/_helpers/i18n'

export interface EudicModalProps {
  syncConfig?: SyncConfig
  show: boolean
  onClose: () => void
}

export const EuDicModal: FC<EudicModalProps> = props => {
  const { t, i18n } = useTranslate(['options', 'common', 'sync'])
  const [serviceChecking, setServiceChecking] = useState(false)
  const formRef = useRef<FormInstance>(null)

  return (
    <Modal
      visible={props.show}
      title={t('sync:eudic.title')}
      destroyOnClose
      onOk={submitForm}
      onCancel={closeModal}
      footer={[
        <Button
          key="verify"
          disabled={serviceChecking}
          loading={serviceChecking}
          onClick={verifyService}
        >
          {t('syncService.eudic.verify')}
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
      <p>
        {t('syncService.eudic.description')}
        {t('syncService.eudic.token_help')}
        <a
          href="https://my.eudic.net/OpenAPI/Authorization"
          target="_blank"
          rel="nofollow noopener noreferrer"
        >
          {t('syncService.eudic.getToken')}
        </a>
      </p>
      <Form
        ref={formRef}
        initialValues={props.syncConfig || Service.getDefaultConfig()}
        labelCol={{ span: 5 }}
        wrapperCol={{ span: 18 }}
        onFinish={saveService}
      >
        <Form.Item
          name="enable"
          label={t('common:enable')}
          help={t('syncService.eudic.enable_help')}
          valuePropName="checked"
        >
          <Switch />
        </Form.Item>
        <Form.Item
          name="token"
          label={t('syncService.eudic.token')}
          hasFeedback
          rules={[{ required: true }]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          name="syncAll"
          label={t('syncService.eudic.sync_all')}
          help={t('syncService.eudic.sync_help')}
          valuePropName="checked"
        >
          <Switch />
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

  async function verify(service: Service): Promise<Boolean> {
    let isError = false
    try {
      await service.init()
      notification.success({ message: t('syncService.eudic.verified') })
      isError = false
    } catch (error) {
      isError = true
      notifyError(error)
    }
    return isError
  }

  async function verifyService() {
    const config = extractConfigFromForm()
    if (!config) return

    setServiceChecking(true)

    const service = new Service(config)

    await verify(service)

    setServiceChecking(false)
  }

  async function saveService() {
    const config = extractConfigFromForm()
    if (!config) return

    if (config.enable) {
      setServiceChecking(true)

      const service = new Service(config)

      const isError = await verify(service)

      setServiceChecking(false)

      if (isError) {
        return
      }

      if (config.syncAll) {
        await onSyncAll(service)
      }
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
        description: t('sync:eudic.error.internal')
      })
      return
    }

    return formRef.current.getFieldsValue() as SyncConfig
  }

  async function onSyncAll(service: Service) {
    const { total } = await getWords('notebook', {
      itemsPerPage: 1,
      filters: {}
    })
    if (total > 50 && !confirm(t('syncService.eudic.sync_all_confirm'))) {
      return
    }

    await syncWords(service)
  }

  async function syncWords(service: Service) {
    AntdMsg.destroy()
    AntdMsg.success(t('syncService.start'), 0)

    try {
      await service.addWordOrPatch({
        words: [],
        force: true
      })
      AntdMsg.destroy()
      AntdMsg.success(t('syncService.success'))
    } catch (error) {
      notifyError(error, t('syncService.failed'))
    }
  }

  function notifyError(error: Error | string, message: string = 'Error') {
    const errorText = typeof error === 'string' ? error : error.message
    const msgPath = 'sync:eudic.error.' + errorText
    const description = i18n.exists(msgPath) ? t(msgPath) : errorText
    notification.error({ message, description })
  }
}

export default EuDicModal
