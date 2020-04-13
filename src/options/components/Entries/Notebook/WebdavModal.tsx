/* eslint-disable no-throw-literal */
import React, { FC, useState } from 'react'
import {
  Form,
  Input,
  Modal,
  Button,
  message as antdMsg,
  notification
} from 'antd'
import { Service, SyncConfig } from '@/background/sync-manager/services/webdav'
import { removeSyncConfig } from '@/background/sync-manager/helpers'
import { message } from '@/_helpers/browser-api'
import { useTranslate } from '@/_helpers/i18n'
import { InputNumberGroup } from '@/options/components/InputNumberGroup'

export interface WebdavModalProps {
  syncConfig?: SyncConfig
  show: boolean
  onClose: () => void
}

type ServiceResponse = undefined | { error: string }

export const WebdavModal: FC<WebdavModalProps> = props => {
  const { t } = useTranslate(['options', 'common'])
  const [serviceChecking, setServiceChecking] = useState(false)
  const [form] = Form.useForm()

  // useEffect(() => {
  //   if (props.show) {
  //     setTimeout(() => {
  //       form.setFieldsValue(props.syncConfig || { duration: 15 })
  //     }, 0)
  //     setServiceChecking(false)
  //   }
  // }, [props.show])

  return (
    <Modal
      visible={props.show}
      title={t('syncService.webdav.title')}
      onOk={submitForm}
      onCancel={closeModal}
      destroyOnClose
      footer={[
        <Button key="delete" type="danger" onClick={deleteService}>
          {t('common:delete')}
        </Button>,
        <Button
          key="save"
          type="primary"
          disabled={false}
          loading={serviceChecking}
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
        form={form}
        initialValues={props.syncConfig || { duration: 15 }}
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
          name="url"
          label={t('syncService.webdav.url')}
          hasFeedback
          rules={[
            { type: 'url', message: t('syncService.error_url'), required: true }
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
          rules={[{ type: 'number', required: true }]}
        >
          <InputNumberGroup suffix={t('common:unit.mins')} />
        </Form.Item>
      </Form>
    </Modal>
  )

  function submitForm() {
    form.submit()
  }

  function closeModal() {
    if (!form.isFieldsTouched() || confirm(t('syncService.close_confirm'))) {
      form.resetFields()
      props.onClose()
    }
  }

  function deleteService() {
    Modal.confirm({
      title: t('syncService.delete_confirm'),
      onOk: () =>
        tryTo(async () => {
          await removeSyncConfig(Service.id)
          form.resetFields()
          props.onClose()
        })
    })
  }

  async function saveService() {
    setServiceChecking(true)

    const values = form.getFieldsValue()
    if (values.url && !values.url.endsWith('/')) {
      values.url += '/'
    }

    try {
      const initRes = await message.send<'SYNC_SERVICE_INIT', ServiceResponse>({
        type: 'SYNC_SERVICE_INIT',
        payload: {
          serviceID: Service.id,
          config: values
        }
      })

      const initError = initRes?.error
      if (initError) {
        if (initError !== 'exist') {
          throw initError
        } else if (confirm(t('syncService.webdav.err_exist'))) {
          const downloadRes = await message.send<
            'SYNC_SERVICE_DOWNLOAD',
            ServiceResponse
          >({
            type: 'SYNC_SERVICE_DOWNLOAD',
            payload: {
              serviceID: Service.id,
              noCache: true
            }
          })
          if (downloadRes?.error) {
            throw downloadRes?.error
          }
        }
      }

      const uploadRes = await message.send<
        'SYNC_SERVICE_UPLOAD',
        ServiceResponse
      >({
        type: 'SYNC_SERVICE_UPLOAD',
        payload: {
          op: 'ADD',
          serviceID: Service.id,
          force: true
        }
      })

      if (uploadRes?.error) {
        throw uploadRes?.error
      }

      form.resetFields()
      props.onClose()
    } catch (error) {
      const text = typeof error === 'string' ? error : String(error)
      const description = /^(network|unauthorized|mkcol|parse)$/.test(text)
        ? t('syncService.webdav.err_' + text)
        : t('syncService.webdav.err_unknown', { error: text })
      notification.error({ message: 'Error', description })
    }

    setServiceChecking(false)
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
}
