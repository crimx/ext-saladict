import React from 'react'
import { openURL } from '@/_helpers/browser-api'
import { resetConfig } from '@/_helpers/config-manager'
import { resetAllProfiles } from '@/_helpers/profile-manager'
import { Props } from '../typings'
import { updateConfigOrProfile, formItemLayout } from '../helpers'

import { FormComponentProps } from 'antd/lib/form'
import { Form, Select, Switch, Button } from 'antd'

export class General extends React.Component<Props & FormComponentProps> {
  isReseted = false

  openShortcuts = () => {
    if (navigator.userAgent.includes('Chrome')) {
      openURL('chrome://extensions/shortcuts')
    } else {
      openURL('about:addons')
    }
  }

  resetConfigs = async () => {
    if (confirm(this.props.t('opt.config.reset_confirm'))) {
      await resetConfig()
      this.isReseted = true
      await resetAllProfiles()
      this.isReseted = true
    }
  }

  componentDidUpdate() {
    if (this.isReseted) {
      this.isReseted = false
      const { form, config } = this.props
      form.setFieldsValue({
        'config#active': config.active,
        'config#animation': config.animation,
        'config#analytics': config.analytics,
        'config#langCode': config.langCode
      })
    }
  }

  render() {
    const { t, config } = this.props
    const { getFieldDecorator } = this.props.form

    return (
      <Form>
        <Button onClick={this.openShortcuts}>{t('opt.shortcuts')}</Button>
        <Form.Item
          {...formItemLayout}
          label={t('opt.active')}
          help={t('opt.app_active_help')}
        >
          {getFieldDecorator('config#active', {
            initialValue: config.active,
            valuePropName: 'checked'
          })(<Switch />)}
        </Form.Item>
        <Form.Item
          {...formItemLayout}
          label={t('opt.animation')}
          help={t('opt.animation_help')}
        >
          {getFieldDecorator('config#animation', {
            initialValue: config.animation,
            valuePropName: 'checked'
          })(<Switch />)}
        </Form.Item>
        <Form.Item
          {...formItemLayout}
          label={t('opt.analytics')}
          help={t('opt.analytics_help')}
        >
          {getFieldDecorator('config#analytics', {
            initialValue: config.analytics,
            valuePropName: 'checked'
          })(<Switch />)}
        </Form.Item>
        <Form.Item {...formItemLayout} label={t('opt.language')}>
          {getFieldDecorator('config#langCode', {
            initialValue: config.langCode
          })(
            <Select>
              <Select.Option value="zh-CN">简体中文</Select.Option>
              <Select.Option value="zh-TW">繁體中文</Select.Option>
              <Select.Option value="en">English</Select.Option>
            </Select>
          )}
        </Form.Item>
        <Form.Item {...formItemLayout} label={t('opt.config.reset')}>
          <Button type="danger" onClick={this.resetConfigs}>
            {t('opt.config.reset')}
          </Button>
        </Form.Item>
      </Form>
    )
  }
}

export default Form.create({
  onFieldsChange: updateConfigOrProfile as any
})(General)
