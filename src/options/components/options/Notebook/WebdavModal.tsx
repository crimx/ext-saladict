import React from 'react'
import { Service, SyncConfig } from '@/background/sync-manager/services/webdav'
import { MsgSyncServiceInit, MsgType, MsgSyncServiceDownload, MsgSyncServiceUpload, SyncServiceUploadOp } from '@/typings/message'
import { message } from '@/_helpers/browser-api'
import { removeSyncConfig } from '@/background/sync-manager/helpers'
import { InputNumberGroup } from '../../InputNumberGroup'
import { TranslationFunction } from 'i18next'

import { FormComponentProps } from 'antd/lib/form'
import { Form, Input, Modal, Button } from 'antd'

type SyncConfigFormItem = {
  [index in keyof SyncConfig]: {
    name: string
    value: any
    errors?: any[]
    dirty: boolean
    touched: boolean
    validating: boolean
  }
}

export type WebDAVFormProps = FormComponentProps & {
  t: TranslationFunction
  configFormItems: SyncConfigFormItem
  onChange: (config: SyncConfigFormItem) => void
}

class WebDAVFormBase extends React.Component<WebDAVFormProps> {
  formItemLayout = {
    labelCol: { span: 5 },
    wrapperCol: { span: 18 },
  }

  render () {
    const { t, form } = this.props
    const { getFieldDecorator } = form

    return (
      <Form>
        <p dangerouslySetInnerHTML={{ __html: t('sync_webdav_explain') }} />
        <Form.Item
          {...this.formItemLayout}
          label={t('sync_webdav_url')}
          hasFeedback
          >{
          getFieldDecorator('url', {
            rules: [{ type: 'url', message: t('sync_error_url') }]
          })(
            <Input />
          )
        }</Form.Item>
        <Form.Item
          {...this.formItemLayout}
          label={t('sync_webdav_user')}
        >{
          getFieldDecorator('user', {
          })(
            <Input />
          )
        }</Form.Item>
        <Form.Item
          {...this.formItemLayout}
          label={t('sync_webdav_passwd')}
        >{
          getFieldDecorator('passwd', {
          })(
            <Input type='password' />
          )
        }</Form.Item>
        <Form.Item
          {...this.formItemLayout}
          label={t('sync_webdav_duration')}
          extra={t('sync_webdav_duration_help')}
        >{
          getFieldDecorator('duration', {
            rules: [{ type: 'number', whitespace: true }],
          })(
            <InputNumberGroup suffix={t('common:unit_mins')} />
          )
        }</Form.Item>
      </Form>
    )
  }
}

const WebDAVForm = Form.create<WebDAVFormProps>({
  mapPropsToFields (props) {
    return props.configFormItems
  },
  onFieldsChange (props, field, allFields) {
    props.onChange(allFields)
  },
})(WebDAVFormBase)

export interface WebdavModalProps {
  syncConfig?: SyncConfig
  t: TranslationFunction
  show: boolean
  onClose: () => void
}

export interface WebdavModalState {
  isSyncServiceLoading: boolean
  configFormItems: SyncConfigFormItem
}

export default class WebdavModal extends React.Component<WebdavModalProps, WebdavModalState> {
  isSyncServiceTainted = false

  state: WebdavModalState = {
    isSyncServiceLoading: false,
    configFormItems: wrapFromItems(this.props.syncConfig || Service.getDefaultConfig()),
  }

  closeSyncService = () => {
    if (!this.isSyncServiceTainted ||
      confirm(this.props.t('sync_close_confirm'))
    ) {
      this.props.onClose()
      this.isSyncServiceTainted = false
    }
  }

  saveSyncService = async () => {
    const { t } = this.props
    const { configFormItems } = this.state
    if (!configFormItems) { return }
    let hasError = false

    this.setState({ isSyncServiceLoading: true })

    const response = await message.send<MsgSyncServiceInit<SyncConfig>>({
      type: MsgType.SyncServiceInit,
      serviceID: Service.id,
      config: stripFromItems(configFormItems),
    }).catch(() => ({}))
    const error = response && response.error
    if (error && error !== 'exist') {
      alert(this.getErrorMsg(error))
      this.setState({ isSyncServiceLoading: false })
      return
    }

    if (error === 'exist') {
      if (confirm(t('sync_webdav_err_exist'))) {
        await message.send<MsgSyncServiceDownload>({
          type: MsgType.SyncServiceDownload,
          serviceID: Service.id,
          noCache: true,
        })
        .catch(() => ({ error: 'unknown' }))
        .then(e => {
          if (e && e.error) {
            hasError = true
            alert(this.getErrorMsg(e.error))
          }
        })
      }
    }

    await message.send<MsgSyncServiceUpload>({
      type: MsgType.SyncServiceUpload,
      op: SyncServiceUploadOp.Add,
      serviceID: Service.id,
      force: true,
    })
    .catch(() => ({ error: 'unknown' }))
    .then(e => {
      if (e && e.error) {
        hasError = true
        alert(this.getErrorMsg(e.error))
      }
    })

    this.setState({ isSyncServiceLoading: false })

    if (!hasError) {
      this.isSyncServiceTainted = false
      this.props.onClose()
    }
  }

  clearSyncService = async () => {
    if (confirm(this.props.t('sync_delete_confirm'))) {
      await removeSyncConfig(Service.id)
      this.setState({
        configFormItems: wrapFromItems(Service.getDefaultConfig()),
      })
      this.isSyncServiceTainted = false
      this.props.onClose()
    }
  }

  getErrorMsg = (error: string | Error): string => {
    const text = typeof error === 'string' ? error : String(error)
    if (/^(network|unauthorized|mkcol|parse)$/.test(text)) {
      return this.props.t('sync_webdav_err_' + text)
    } else {
      return this.props.t('sync_webdav_err_unknown', { error: text })
    }
  }

  onSyncConfigChanged = (newConfigFormItems: SyncConfigFormItem) => {
    this.isSyncServiceTainted = true
    this.setState({ configFormItems: newConfigFormItems })
  }

  render () {
    const { t, show } = this.props
    const { configFormItems } = this.state

    const disableSaveBtn = !show || !configFormItems.url.value ||
      Object.values(configFormItems).some(({ errors }) => errors != null && errors.length > 0)

    return (
      <Modal
        visible={show}
        title={t('sync_notebook_title')}
        destroyOnClose
        onOk={this.saveSyncService}
        onCancel={this.closeSyncService}
        footer={[
          <Button
            key='delete'
            type='danger'
            onClick={this.clearSyncService}
          >{t('common:delete')}</Button>,
          <Button
            key='save'
            type='primary'
            disabled={disableSaveBtn}
            loading={this.state.isSyncServiceLoading}
            onClick={this.saveSyncService}
          >{t('common:save')}</Button>,
          <Button
            key='cancel'
            onClick={this.closeSyncService}
          >{t('common:cancel')}</Button>,
        ]}
      >
        <WebDAVForm
          t={t}
          configFormItems={configFormItems}
          onChange={this.onSyncConfigChanged}
        />
      </Modal>
    )
  }
}

function wrapFromItems (config: SyncConfig): SyncConfigFormItem {
  return Object.keys(config).reduce((o, k) => {
    o[k] = Form.createFormField({ value: config[k] })
    return o
  }, {}) as SyncConfigFormItem
}

function stripFromItems (configFormItems: SyncConfigFormItem): SyncConfig {
  return Object.keys(configFormItems).reduce((o, k) => {
    o[k] = configFormItems[k].value
    return o
  }, {}) as SyncConfig
}
