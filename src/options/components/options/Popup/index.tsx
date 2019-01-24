import React from 'react'
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
          label={t('opt_ba_open')}
          help={t('opt_ba_open_help')}
        >{
          getFieldDecorator('config#baOpen', {
            initialValue: config.baOpen,
          })(
            <Select>
              <Select.Option value='popup_panel'>{t('opt_ba_open_dict_panel')}</Select.Option>
              <Select.Option value='popup_fav'>{t('opt_ba_open_fav')}</Select.Option>
              <Select.Option value='popup_options'>{t('opt_ba_open_options')}</Select.Option>
              {Object.keys(config.contextMenus.all).map(id => (
                <Select.Option key={id} value={id}>{t(`ctx:${id}`)}</Select.Option>
              ))}
            </Select>
          )
        }</Form.Item>
        {config.baOpen === '' &&
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
        }
        {config.baOpen === '' && config.baPreload !== '' &&
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
  onFieldsChange: updateConfigOrProfile as any
})(Popup)
