import React from 'react'
import { Props } from '../typings'
import { updateConfigOrProfile, formItemLayout } from '../helpers'

import { FormComponentProps } from 'antd/lib/form'
import { Form, Switch } from 'antd'

export class Privacy extends React.Component<Props & FormComponentProps> {
  render() {
    const { t, config } = this.props
    const { getFieldDecorator } = this.props.form

    return (
      <Form>
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
        <Form.Item
          {...formItemLayout}
          label={t('opt.history')}
          help={t('opt.history_help')}
        >
          {getFieldDecorator('config#searhHistory', {
            initialValue: config.searhHistory,
            valuePropName: 'checked'
          })(<Switch />)}
        </Form.Item>
        {config.searhHistory && (
          <Form.Item {...formItemLayout} label={t('opt.history_inco')}>
            {getFieldDecorator('config#searhHistoryInco', {
              initialValue: config.searhHistoryInco,
              valuePropName: 'checked'
            })(<Switch />)}
          </Form.Item>
        )}
        <Form.Item
          {...formItemLayout}
          label={t('opt.third_party_privacy')}
          help={t('opt.third_party_privacy_help')}
          extra={t('opt.third_party_privacy_extra')}
        >
          <Switch checked disabled />
        </Form.Item>
      </Form>
    )
  }
}

export default Form.create({
  onFieldsChange: updateConfigOrProfile as any
})(Privacy)
