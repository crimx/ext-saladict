import React from 'react'
import { MsgSyncServiceInit, MsgType, MsgSyncServiceDownload, MsgSyncServiceUpload } from '@/typings/message'
import { message } from '@/_helpers/browser-api'
import { getSyncConfig, setSyncConfig , removeSyncConfig } from '@/background/sync-manager/helpers'
import { getDefaultConfig, serviceID, SyncConfig } from '@/background/sync-manager/services/webdav'
import { Props } from '../typings'
import { updateConfig as updateConfigWrap } from '../helpers'
import SyncServiceModal from './SyncServiceModal'

import { FormComponentProps } from 'antd/lib/form'
import { Form, Switch, Modal, Button } from 'antd'

export type NotebookProps = Props & FormComponentProps

export class Notebook extends React.Component<NotebookProps> {
  isSyncServiceTainted = false

  state = {
    isSyncServiceLoading: false,
    syncServiceConfig: null as null | SyncConfig,
  }

  openSyncService = async () => {
    this.setState({
      syncServiceConfig: (
        (await getSyncConfig<SyncConfig>(serviceID)) || getDefaultConfig()
      )
    })
  }

  closeSyncService = () => {
    if (!this.isSyncServiceTainted ||
      confirm(this.props.t('sync_close_confirm'))
    ) {
      this.setState({ syncServiceConfig: null })
      this.isSyncServiceTainted = false
    }
  }

  saveSyncService = async () => {
    const { t } = this.props
    const { syncServiceConfig } = this.state
    if (!syncServiceConfig) { return }

    this.setState({ isSyncServiceLoading: true })

    const { error } = await message.send<MsgSyncServiceInit>({
      type: MsgType.SyncServiceInit,
      config: syncServiceConfig,
    })
    if (error && error !== 'exist') {
      if (/^(network|unauthorized|mkcol|parse)$/.test(error)) {
        alert(t('sync_webdav_err_' + error))
      }
      this.setState({ isSyncServiceLoading: false })
      return
    }

    await setSyncConfig(serviceID, syncServiceConfig)

    if (error === 'exist') {
      if (confirm(t('sync_webdav_err_exist'))) {
        await message.send<MsgSyncServiceDownload>({
          type: MsgType.SyncServiceDownload,
          force: true,
        }).catch(() => {
          alert(t('sync_webdav_err_network'))
        })
      }
    }

    await message.send<MsgSyncServiceUpload>({
      type: MsgType.SyncServiceUpload,
      force: true,
    }).catch(() => {
      alert(t('sync_webdav_err_network'))
    })

    this.setState({
      isSyncServiceLoading: false,
      syncServiceConfig: null,
    })
    this.isSyncServiceTainted = false
  }

  clearSyncService = async () => {
    if (confirm(this.props.t('sync_delete_confirm'))) {
      await removeSyncConfig()
      this.setState({ syncServiceConfig: null })
      this.isSyncServiceTainted = false
    }
  }

  onSyncServiceChange = (newSyncConfig: SyncConfig) => {
    this.isSyncServiceTainted = true
    this.setState({ syncServiceConfig: newSyncConfig })
    console.log(newSyncConfig)
  }

  render () {
    const { t, config } = this.props
    const { syncServiceConfig } = this.state

    const updateConfig = updateConfigWrap(config)

    const formItemLayout = {
      labelCol: { span: 5 },
      wrapperCol: { span: 8 },
    }

    return (
      <Form>
        <Button onClick={this.openSyncService}>{t('opt_sync_btn')}</Button>
        <Form.Item
          {...formItemLayout}
          label={t('opt_edit_on_fav')}
          help={t('opt_edit_on_fav_help')}
        >{
          this.props.form.getFieldDecorator('editOnFav', {
            initialValue: config.editOnFav,
            getValueFromEvent: updateConfig('editOnFav'),
            valuePropName: 'checked',
          })(
            <Switch />
          )
        }</Form.Item>
        <Form.Item
          {...formItemLayout}
          label={t('opt_history')}
          help={t('opt_history_help')}
        >{
          this.props.form.getFieldDecorator('searhHistory', {
            initialValue: config.searhHistory,
            getValueFromEvent: updateConfig('searhHistory'),
            valuePropName: 'checked',
          })(
            <Switch />
          )
        }</Form.Item>
        {config.searhHistory &&
          <Form.Item
            {...formItemLayout}
            label={t('opt_history_inco')}
          >{
            this.props.form.getFieldDecorator('searhHistoryInco', {
              initialValue: config.searhHistoryInco,
              getValueFromEvent: updateConfig('searhHistoryInco'),
              valuePropName: 'checked',
            })(
              <Switch />
            )
          }</Form.Item>
        }
        <Modal
          visible={!!syncServiceConfig}
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
              loading={this.state.isSyncServiceLoading}
              onClick={this.saveSyncService}
            >{t('common:save')}</Button>,
            <Button
              key='cancel'
              onClick={this.closeSyncService}
            >{t('common:cancel')}</Button>,
          ]}
        >{
          React.createElement(SyncServiceModal, {
            t, config,
            onChange: this.onSyncServiceChange,
            syncConfig: syncServiceConfig as SyncConfig,
          })
        }</Modal>
      </Form>
    )
  }
}

export default Form.create()(Notebook)
