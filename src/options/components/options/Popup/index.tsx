import React from 'react'
import { Props } from '../typings'
import { updateConfigOrProfile, formItemLayout } from '../helpers'

import { FormComponentProps } from 'antd/lib/form'
import { Form, Select, Switch } from 'antd'

export class Popup extends React.Component<Props & FormComponentProps> {
  render() {
    const { t, config } = this.props
    const { getFieldDecorator } = this.props.form

    return (
      <Form>
        <Form.Item
          {...formItemLayout}
          label={t('opt.browserAction.open')}
          help={t('opt.browserAction.openHelp')}
        >
          {getFieldDecorator('config#baOpen', {
            initialValue: config.baOpen
          })(
            <Select>
              <Select.Option value="popup_panel">
                {t('opt.browserAction.openDictPanel')}
              </Select.Option>
              <Select.Option value="popup_fav">
                {t('opt.browserAction.openFav')}
              </Select.Option>
              <Select.Option value="popup_options">
                {t('opt.browserAction.openOptions')}
              </Select.Option>
              {Object.keys(config.contextMenus.all).map(id => (
                <Select.Option key={id} value={id}>
                  {t(`menus:${id}`)}
                </Select.Option>
              ))}
            </Select>
          )}
        </Form.Item>
        {config.baOpen === 'popup_panel' && (
          <Form.Item
            {...formItemLayout}
            label={t('preload.title')}
            help={t('preload.help')}
          >
            {getFieldDecorator('config#baPreload', {
              initialValue: config.baPreload
            })(
              <Select>
                <Select.Option value="">{t('common:none')}</Select.Option>
                <Select.Option value="clipboard">
                  {t('preload.clipboard')}
                </Select.Option>
                <Select.Option value="selection">
                  {t('preload.selection')}
                </Select.Option>
              </Select>
            )}
          </Form.Item>
        )}
        {config.baOpen === 'popup_panel' && config.baPreload !== '' && (
          <Form.Item
            {...formItemLayout}
            label={t('preload.auto')}
            help={t('preload.auto_help')}
          >
            {getFieldDecorator('config#baAuto', {
              initialValue: config.baAuto,
              valuePropName: 'checked'
            })(<Switch />)}
          </Form.Item>
        )}
      </Form>
    )
  }
}

export default Form.create({
  onFieldsChange: updateConfigOrProfile as any
})(Popup)
