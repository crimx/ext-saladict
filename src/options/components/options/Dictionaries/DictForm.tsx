import React from 'react'
import { Props } from '../typings'
import { updateConfigOrProfile, formItemLayout } from '../helpers'

import { FormComponentProps } from 'antd/lib/form'
import { Form, Select, Switch } from 'antd'

export type DictFormProps = Props & FormComponentProps

export class DictForm extends React.Component<DictFormProps> {
  render() {
    const { t, config, profile } = this.props
    const { getFieldDecorator } = this.props.form

    const autopronCnList = profile.dicts.all.zdic.options.audio
      ? config.autopron.cn.list
      : config.autopron.cn.list.filter(id => id !== 'zdic')

    return (
      <Form>
        <Form.Item {...formItemLayout} label={t('opt.autopron.cn')}>
          {getFieldDecorator('config#autopron#cn#dict', {
            initialValue: config.autopron.cn.dict
          })(
            <Select>
              <Select.Option value="">{t('common:none')}</Select.Option>
              {autopronCnList.map(id => (
                <Select.Option key={id} value={id}>
                  {t(`dicts:${id}.name`)}
                </Select.Option>
              ))}
            </Select>
          )}
        </Form.Item>
        <Form.Item {...formItemLayout} label={t('opt.autopron.en')}>
          {getFieldDecorator('config#autopron#en#dict', {
            initialValue: config.autopron.en.dict
          })(
            <Select>
              <Select.Option value="">{t('common:none')}</Select.Option>
              {config.autopron.en.list.map(id => (
                <Select.Option key={id} value={id}>
                  {t(`dicts:${id}.name`)}
                </Select.Option>
              ))}
            </Select>
          )}
        </Form.Item>
        {config.autopron.en.dict && (
          <Form.Item {...formItemLayout} label={t('opt.autopron.accent')}>
            {getFieldDecorator('config#autopron#en#accent', {
              initialValue: config.autopron.en.accent
            })(
              <Select>
                <Select.Option value="uk">
                  {t('opt.autopron.accent_uk')}
                </Select.Option>
                <Select.Option value="us">
                  {t('opt.autopron.accent_us')}
                </Select.Option>
              </Select>
            )}
          </Form.Item>
        )}
        <Form.Item {...formItemLayout} label={t('opt.autopron.machine')}>
          {getFieldDecorator('config#autopron#machine#dict', {
            initialValue: config.autopron.machine.dict
          })(
            <Select>
              <Select.Option value="">{t('common:none')}</Select.Option>
              {config.autopron.machine.list.map(id => (
                <Select.Option key={id} value={id}>
                  {t(`dicts:${id}.name`)}
                </Select.Option>
              ))}
            </Select>
          )}
        </Form.Item>
        {config.autopron.machine.dict && (
          <Form.Item {...formItemLayout} label={t('opt.autopron.machine_src')}>
            {getFieldDecorator('config#autopron#machine#src', {
              initialValue: config.autopron.machine.src
            })(
              <Select>
                <Select.Option value="trans">
                  {t('opt.autopron.machine_src_trans')}
                </Select.Option>
                <Select.Option value="searchText">
                  {t('opt.autopron.machine_src_search')}
                </Select.Option>
              </Select>
            )}
          </Form.Item>
        )}
        <Form.Item
          {...formItemLayout}
          label={t('opt.waveform')}
          help={t('opt.waveform_help')}
          extra={t('opt.profile_change')}
          required
        >
          {getFieldDecorator('profile#waveform', {
            initialValue: profile.waveform,
            valuePropName: 'checked'
          })(<Switch />)}
        </Form.Item>
      </Form>
    )
  }
}

export default Form.create<DictFormProps>({
  onFieldsChange: updateConfigOrProfile as any
})(DictForm)
