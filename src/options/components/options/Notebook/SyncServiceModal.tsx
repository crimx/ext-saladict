import React from 'react'
import { SyncConfig } from '@/background/sync-manager/services/webdav'
import { Props } from '../typings'
import { InputNumberGroup } from '../../InputNumberGroup'

import { FormComponentProps } from 'antd/lib/form'
import { Form, Input } from 'antd'

export type SyncServiceModalProps = Props & FormComponentProps & {
  onChange: (syncConfig: SyncConfig) => void
  syncConfig: SyncConfig
}

export class SyncServiceModal extends React.Component<SyncServiceModalProps> {
  render () {
    const { t, syncConfig } = this.props
    const { getFieldDecorator } = this.props.form

    const formItemLayout = {
      labelCol: { span: 5 },
      wrapperCol: { span: 18 },
    }

    return (
      <Form>
        <p dangerouslySetInnerHTML={{ __html: t('sync_webdav_explain') }} />
        <Form.Item
          {...formItemLayout}
          label={t('sync_webdav_url')}
          hasFeedback
          >{
          getFieldDecorator('url', {
            initialValue: syncConfig.url,
            rules: [{ type: 'url', message: t('sync_error_url') }]
          })(
            <Input />
          )
        }</Form.Item>
        <Form.Item
          {...formItemLayout}
          label={t('sync_webdav_user')}
        >{
          getFieldDecorator('user', {
            initialValue: syncConfig.user,
          })(
            <Input />
          )
        }</Form.Item>
        <Form.Item
          {...formItemLayout}
          label={t('sync_webdav_passwd')}
        >{
          getFieldDecorator('passwd', {
            initialValue: syncConfig.passwd,
          })(
            <Input type='password' />
          )
        }</Form.Item>
        <Form.Item
          {...formItemLayout}
          label={t('sync_webdav_duration')}
          extra={t('sync_webdav_duration_help')}
          hasFeedback
        >{
          getFieldDecorator('duration', {
            initialValue: syncConfig.duration,
            rules: [{ type: 'number', whitespace: true }],
          })(
            <InputNumberGroup suffix={t('common:unit_mins')} />
          )
        }</Form.Item>
      </Form>
    )
  }
}

export default Form.create<SyncServiceModalProps>({
  onValuesChange (props, changedFields, allValues) {
    props.onChange(allValues)
  },
})(SyncServiceModal)
