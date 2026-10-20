/* eslint-disable no-throw-literal */
import React, { FC, useState, useRef } from 'react'
import {
  Form,
  Input,
  Modal,
  Button,
  notification,
  Switch,
  Checkbox,
  Alert
} from 'antd'
import { FormInstance } from 'antd/lib/form'
import { ExclamationCircleOutlined } from '@ant-design/icons'
import {
  Service,
  SyncConfig
} from '@/background/sync-manager/services/ankiconnect'
import { setSyncConfig } from '@/background/sync-manager/helpers'
import { useTranslate } from '@/_helpers/i18n'
import { ClozeMigrationPlan } from '@/background/sync-manager/services/ankiconnect/migration'

export interface AnkiConnectModalProps {
  syncConfig?: SyncConfig
  show: boolean
  onClose: () => void
}

export const AnkiConnectModal: FC<AnkiConnectModalProps> = props => {
  const { t, i18n } = useTranslate(['options', 'common', 'sync'])
  const [serviceChecking, setServiceChecking] = useState(false)
  const formRef = useRef<FormInstance>(null)
  const [migration, setMigration] = useState<{
    service: Service
    plan: ClozeMigrationPlan
  }>()
  const [migrationRunning, setMigrationRunning] = useState(false)
  const [migrationBackups, setMigrationBackups] = useState<string[]>([])
  const [migrationError, setMigrationError] = useState('')

  return (
    <>
      <Modal
        visible={props.show}
        title={t('sync:ankiconnect.title')}
        onOk={submitForm}
        onCancel={closeModal}
        destroyOnClose
        closable={!migration && !serviceChecking}
        keyboard={!migration && !serviceChecking}
        footer={[
          <Button
            key="verify"
            disabled={serviceChecking || !!migration}
            loading={serviceChecking}
            onClick={verifyService}
          >
            {t('syncService.ankiconnect.verify')}
          </Button>,
          <Button
            key="save"
            type="primary"
            disabled={serviceChecking || !!migration}
            onClick={submitForm}
          >
            {t('common:save')}
          </Button>,
          <Button
            key="cancel"
            disabled={serviceChecking || !!migration}
            onClick={closeModal}
          >
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
      <Modal
        visible={!!migration}
        title={t('sync:ankiconnect.migration.title')}
        okText={t('sync:ankiconnect.migration.action')}
        cancelText={t('common:cancel')}
        onOk={runMigration}
        onCancel={() => {
          if (!migrationRunning) setMigration(undefined)
        }}
        confirmLoading={migrationRunning}
        cancelButtonProps={{ disabled: migrationRunning }}
        closable={!migrationRunning}
        keyboard={!migrationRunning}
        maskClosable={false}
        destroyOnClose
      >
        <p>
          {t('sync:ankiconnect.migration.confirm', {
            noteType: migration?.plan.source.name,
            count: migration?.plan.notes.length,
            decks: migration?.plan.decks.length,
            target: migration?.plan.targetName
          })}
        </p>
        <p>{t('sync:ankiconnect.migration.backup_location')}</p>
        {migrationRunning && (
          <p role="status">{t('sync:ankiconnect.migration.running')}</p>
        )}
        {migrationBackups.length > 0 && (
          <>
            <p>{t('sync:ankiconnect.migration.backups')}</p>
            <ul>
              {migrationBackups.map(path => (
                <li key={path} style={{ overflowWrap: 'anywhere' }}>
                  {path}
                </li>
              ))}
            </ul>
          </>
        )}
        {migrationError && (
          <Alert
            type="error"
            message={migrationError}
            description={t('sync:ankiconnect.migration.failure_help')}
          />
        )}
      </Modal>
    </>
  )

  function submitForm() {
    if (formRef.current) {
      formRef.current.submit()
    }
  }

  function closeModal() {
    if (migration || serviceChecking) return
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

  async function verify(service: Service): Promise<boolean> {
    try {
      await service.init()
      notification.success({ message: t('syncService.ankiconnect.verified') })
      return true
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
              return false
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
              return false
            }
          } else {
            confirm(t('syncService.ankiconnect.add_yourself'))
          }
          break
        case 'notetype_cloze':
          setMigration({ service, plan: await service.prepareClozeMigration() })
          setMigrationBackups([])
          setMigrationError('')
          return false
        default:
          throw error
      }
      return false
    }
  }

  async function runMigration() {
    if (!migration || migrationRunning) return
    setMigrationRunning(true)
    setMigrationError('')
    try {
      const result = await migration.service.migrateCloze(
        migration.plan,
        setMigrationBackups
      )
      const config = { ...migration.service.config, noteType: result.noteType }
      formRef.current?.setFieldsValue({ noteType: result.noteType })
      await setSyncConfig(Service.id, config)
      notification.success({
        message: t('sync:ankiconnect.migration.success'),
        description: t('sync:ankiconnect.migration.success_help', {
          target: result.noteType,
          paths:
            result.backupPaths.join('\n') ||
            t('sync:ankiconnect.migration.no_backup')
        }),
        duration: 0
      })
      setMigration(undefined)
      props.onClose()
    } catch (error) {
      setMigrationError(describeError(error))
    } finally {
      setMigrationRunning(false)
    }
  }

  async function verifyService() {
    const config = extractConfigFromForm()
    if (!config) return

    setServiceChecking(true)

    const service = new Service(config)
    try {
      if (!(await verify(service))) return
      if (confirm(t('syncService.ankiconnect.upload_confirm'))) {
        await service.add({ force: true })
      }
    } catch (e) {
      notifyError(e)
    } finally {
      setServiceChecking(false)
    }
  }

  async function saveService() {
    const config = extractConfigFromForm()
    if (!config) return

    if (config.enable) {
      setServiceChecking(true)

      const service = new Service(config)

      try {
        if (!(await verify(service))) return
      } catch (e) {
        return notifyError(e)
      } finally {
        setServiceChecking(false)
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
        description: t('sync:ankiconnect.error.internal')
      })
      return
    }

    return formRef.current.getFieldsValue() as SyncConfig
  }

  function describeError(error: Error | string): string {
    const errorText = typeof error === 'string' ? error : error.message
    const msgPath = 'sync:ankiconnect.error.' + errorText
    return i18n.exists(msgPath) ? t(msgPath) : errorText
  }

  function notifyError(error: Error | string) {
    notification.error({ message: 'Error', description: describeError(error) })
  }
}

export default AnkiConnectModal
