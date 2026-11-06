import React, { FC, useRef, useState } from 'react'
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
import { Service, SyncConfig } from '@/background/sync-manager/services/maimemo'
import { setSyncConfig } from '@/background/sync-manager/helpers'
import { getWords } from '@/_helpers/record-manager'
import { useTranslate } from '@/_helpers/i18n'

export interface MaimemoModalProps {
  syncConfig?: SyncConfig
  show: boolean
  onClose: () => void
}

export const MaimemoModal: FC<MaimemoModalProps> = props => {
  const { t, i18n } = useTranslate(['options', 'common', 'sync'])
  const [serviceChecking, setServiceChecking] = useState(false)
  const formRef = useRef<FormInstance>(null)

  return (
    <Modal
      visible={props.show}
      title={t('sync:maimemo.title')}
      destroyOnClose
      onCancel={closeModal}
      footer={[
        <Button
          key="verify"
          disabled={serviceChecking}
          loading={serviceChecking}
          onClick={verifyService}
        >
          {t('syncService.maimemo.verify')}
        </Button>,
        props.syncConfig?.enable ? (
          <Button key="sync-all" disabled={serviceChecking} onClick={syncAll}>
            {t('syncService.maimemo.sync_all')}
          </Button>
        ) : null,
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
        {t('syncService.maimemo.description')}
        <a
          href="https://open.maimemo.com/open/api/v1/tokens/openapi"
          target="_blank"
          rel="nofollow noopener noreferrer"
        >
          {t('syncService.maimemo.getToken')}
        </a>
      </p>
      <Form
        ref={formRef}
        initialValues={{
          ...Service.getDefaultConfig(),
          ...props.syncConfig
        }}
        labelCol={{ span: 5 }}
        wrapperCol={{ span: 18 }}
        onFinish={saveService}
      >
        <Form.Item
          name="enable"
          label={t('common:enable')}
          help={t('syncService.maimemo.enable_help')}
          valuePropName="checked"
        >
          <Switch />
        </Form.Item>
        <Form.Item
          name="advance"
          label={t('syncService.maimemo.advance')}
          help={t('syncService.maimemo.advance_help')}
          valuePropName="checked"
        >
          <Switch />
        </Form.Item>
        <Form.Item
          name="token"
          label={t('syncService.maimemo.token')}
          hasFeedback
          rules={[{ required: true }]}
        >
          <Input.Password />
        </Form.Item>
      </Form>
    </Modal>
  )

  function submitForm() {
    formRef.current?.submit()
  }

  function closeModal() {
    if (formRef.current?.isFieldsTouched()) {
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

  async function verifyService() {
    const config = extractConfigFromForm()
    if (!config) return

    setServiceChecking(true)
    try {
      await new Service(config).init()
      notification.success({ message: t('syncService.maimemo.verified') })
    } catch (error) {
      notifyError(error)
    }
    setServiceChecking(false)
  }

  async function saveService() {
    const config = extractConfigFromForm()
    if (!config) return

    if (config.enable) {
      setServiceChecking(true)
      try {
        await new Service(config).init()
      } catch (error) {
        notifyError(error)
        setServiceChecking(false)
        return
      }
      setServiceChecking(false)
    }

    try {
      await setSyncConfig(Service.id, config)
      props.onClose()
    } catch (error) {
      notifyError(error)
    }
  }

  async function syncAll() {
    const config = extractConfigFromForm()
    if (!config || !config.enable) return

    const { total } = await getWords('notebook', {
      itemsPerPage: 1,
      filters: {}
    })
    if (total > 1000 && !confirm(t('syncService.maimemo.sync_all_confirm'))) {
      return
    }

    AntdMsg.destroy()
    AntdMsg.success(t('syncService.start'), 0)
    try {
      const result = await new Service(config).add({ force: true })

      AntdMsg.destroy()

      if (result.rateLimited) {
        AntdMsg.warning(
          t('syncService.maimemo.sync_result_partial', {
            added: result.added,
            matched: result.matched,
            remaining: result.remaining || 0
          }),
          0
        )
        return
      }

      const resultMsg = t('syncService.maimemo.sync_result', {
        added: result.added,
        matched: result.matched
      })
      AntdMsg.success(
        result.added < result.matched
          ? `${resultMsg} ${t('syncService.maimemo.sync_result_help')}`
          : resultMsg
      )
    } catch (error) {
      AntdMsg.destroy()
      notifyError(error, t('syncService.failed'))
    }
  }

  function extractConfigFromForm(): SyncConfig | undefined {
    if (!formRef.current) {
      notification.error({
        message: 'Error',
        description: t('sync:maimemo.error.internal')
      })
      return
    }
    return formRef.current.getFieldsValue() as SyncConfig
  }

  function notifyError(error: Error | string, message = 'Error') {
    const errorText = typeof error === 'string' ? error : error.message
    const msgPath = `sync:maimemo.error.${errorText}`
    notification.error({
      message,
      description: i18n.exists(msgPath) ? t(msgPath) : errorText
    })
  }
}

export default MaimemoModal
