/* eslint-disable no-throw-literal */
import React, { FC, useState, useRef } from 'react'
import {
  Form,
  Input,
  Modal,
  Button,
  notification,
  Switch,
  Checkbox
} from 'antd'
import { FormInstance } from 'antd/lib/form'
import { ExclamationCircleOutlined } from '@ant-design/icons'
import {
  Service,
  SyncConfig
} from '@/background/sync-manager/services/ankiconnect'
import { setSyncConfig } from '@/background/sync-manager/helpers'
import { useTranslate } from '@/_helpers/i18n'

export interface AnkiConnectModalProps {
  syncConfig?: SyncConfig
  show: boolean
  onClose: () => void
}

export const AnkiConnectModal: FC<AnkiConnectModalProps> = props => {
  const { t, i18n } = useTranslate(['options', 'common', 'sync'])
  const [serviceChecking, setServiceChecking] = useState(false)
  const formRef = useRef<FormInstance>(null)

  return (
    <Modal
      visible={props.show}
      title={t('sync:ankiconnect.title')}
      onOk={submitForm}
      onCancel={closeModal}
      destroyOnClose
      footer={[
        <Button
          key="verify"
          disabled={serviceChecking}
          loading={serviceChecking}
          onClick={verifyService}
        >
          {t('syncService.ankiconnect.verify')}
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
          {t('syncService.ankiconnect.description')}
          <a
            href="https://saladict.crimx.com/anki.html"
            target="_blank"
            rel="nofollow noopener noreferrer"
          >
            {t('tutorial')}
          </a>
        </p>
        <Form.Item
          name="enable"
          label={t('common:enable')}
          help={t('syncService.ankiconnect.enable_help')}
          valuePropName="checked"
        >
          <Switch />
        </Form.Item>
        <Form.Item
          name="host"
          label={t('syncService.ankiconnect.host')}
          hasFeedback
          rules={[{ required: true }]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          name="port"
          label={t('syncService.ankiconnect.port')}
          hasFeedback
          rules={[{ required: true }]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          name="key"
          label={t('syncService.ankiconnect.key')}
          help={t('syncService.ankiconnect.key_help')}
        >
          <Input />
        </Form.Item>
        <Form.Item
          name="deckName"
          label={t('syncService.ankiconnect.deckName')}
          help={t('syncService.ankiconnect.deckName_help')}
          hasFeedback
          rules={[{ required: true }]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          name="noteType"
          label={t('syncService.ankiconnect.noteType')}
          help={t('syncService.ankiconnect.noteType_help')}
          hasFeedback
          rules={[{ required: true }]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          name="tags"
          label={t('syncService.ankiconnect.tags')}
          help={t('syncService.ankiconnect.tags_help')}
        >
          <Input />
        </Form.Item>
        <Form.Item
          label={t('syncService.ankiconnect.escapeHTML')}
          help={t('syncService.ankiconnect.escapeHTML_help')}
        >
          <Form.Item
            name="escapeContext"
            className="form-item-inline"
            valuePropName="checked"
          >
            <Checkbox>{t('common:note.context')}</Checkbox>
          </Form.Item>
          <Form.Item
            name="escapeTrans"
            className="form-item-inline"
            valuePropName="checked"
          >
            <Checkbox>{t('common:note.trans')}</Checkbox>
          </Form.Item>
          <Form.Item
            name="escapeNote"
            className="form-item-inline"
            valuePropName="checked"
          >
            <Checkbox>{t('common:note.note')}</Checkbox>
          </Form.Item>
        </Form.Item>
        <Form.Item
          name="syncServer"
          label={t('syncService.ankiconnect.syncServer')}
          help={t('syncService.ankiconnect.syncServer_help')}
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

  async function verify(service: Service) {
    try {
      await service.init()
      notification.success({ message: t('syncService.ankiconnect.verified') })
    } catch (error) {
      const errorText = typeof error === 'string' ? error : error.message
      switch (errorText) {
        case 'deck':
          if (
            confirm(
              t('syncService.ankiconnect.deck_confirm', {
                deck: service.config.deckName
              })
            )
          ) {
            try {
              await service.addDeck()
              return verify(service)
            } catch (e) {
              notification.error({
                message: 'Error',
                description: t('syncService.ankiconnect.deck_error', {
                  deck: service.config.deckName
                })
              })
              return
            }
          } else {
            confirm(t('syncService.ankiconnect.add_yourself'))
          }
          break
        case 'notetype':
          if (
            confirm(
              t('syncService.ankiconnect.notetype_confirm', {
                noteType: service.config.noteType
              })
            )
          ) {
            try {
              await service.addNoteType()
              return verify(service)
            } catch (e) {
              notification.error({
                message: 'Error',
                description: t('syncService.ankiconnect.notetype_error', {
                  noteType: service.config.noteType
                })
              })
              return
            }
          } else {
            confirm(t('syncService.ankiconnect.add_yourself'))
          }
          break
        default:
          throw error
      }
    }
  }

  async function verifyService() {
    const config = extractConfigFromForm()
    if (!config) return

    setServiceChecking(true)

    const service = new Service(config)
    try {
      await verify(service)
      if (confirm(t('syncService.ankiconnect.upload_confirm'))) {
        await service.add({ force: true })
      }
    } catch (e) {
      notifyError(e)
    }

    setServiceChecking(false)
  }

  async function saveService() {
    const config = extractConfigFromForm()
    if (!config) return

    if (config.enable) {
      setServiceChecking(true)

      const service = new Service(config)

      try {
        await verify(service)
      } catch (e) {
        setServiceChecking(false)
        return notifyError(e)
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

  function extractConfigFromForm(): SyncConfig | undefined {
    if (!formRef.current) {
      if (process.env.DEBUG) {
        console.error(new Error('Missing form ref when saving service'))
      }
      notification.error({
        message: 'Error',
        description: t('sync:ankiconnect.error.internal')
      })
      return
    }

    return formRef.current.getFieldsValue() as SyncConfig
  }

  function notifyError(error: Error | string) {
    const errorText = typeof error === 'string' ? error : error.message
    const msgPath = 'sync:ankiconnect.error.' + errorText
    const description = i18n.exists(msgPath) ? t(msgPath) : errorText
    notification.error({ message: 'Error', description })
  }
}

export default AnkiConnectModal
