import React from 'react'
import { openURL } from '@/_helpers/browser-api'
import { Props } from '../typings'
import { updateConfigOrProfile, formItemLayout } from '../helpers'

import { FormComponentProps } from 'antd/lib/form'
import { Form, Select, Switch } from 'antd'

export class Popup extends React.Component<Props & FormComponentProps> {
  render () {
    const { t, config } = this.props
    const { getFieldDecorator } = this.props.form

    return (
      <Form>
        <Form.Item
          {...formItemLayout}
          label={t('preload')}
          help={t('preload_help')}
        >{
          getFieldDecorator('config#baPreload', {
            initialValue: config.baPreload,
          })(
            <Select>
              <Select.Option value=''>{t('common:none')}</Select.Option>
              <Select.Option value='clipboard'>{t('preload_clipboard')}</Select.Option>
              <Select.Option value='selection'>{t('preload_selection')}</Select.Option>
            </Select>
          )
        }</Form.Item>
        {config.baPreload !== '' &&
          <Form.Item
            {...formItemLayout}
            label={t('preload_auto')}
            help={t('preload_auto_help')}
          >{
            getFieldDecorator('config#baAuto', {
              initialValue: config.baAuto,
              valuePropName: 'checked',
            })(
              <Switch />
            )
          }</Form.Item>
        }
      </Form>
    )
  }
}

export default Form.create({
  onValuesChange: updateConfigOrProfile
})(Popup)
