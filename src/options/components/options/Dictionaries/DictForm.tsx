import React from 'react'
import { Props } from '../typings'
import { updateConfigOrProfile, formItemLayout } from '../helpers'

import { FormComponentProps } from 'antd/lib/form'
import { Form, Select } from 'antd'

export type DictFormProps = Props & FormComponentProps

export class DictForm extends React.Component<DictFormProps> {
  render () {
    const { t, config, profile } = this.props
    const { getFieldDecorator } = this.props.form

    const autopronCnList = profile.dicts.all.zdic.options.audio
      ? config.autopron.cn.list
      : config.autopron.cn.list.filter(id => id !== 'zdic')

    return (
      <Form>
        <Form.Item
          {...formItemLayout}
          label={t('opt_autopron_cn')}
        >{
          getFieldDecorator('config#autopron#cn#dict', {
            initialValue: config.autopron.cn.dict,
          })(
            <Select>
              <Select.Option value=''>{t('common:none')}</Select.Option>
              {autopronCnList.map(id => (
                <Select.Option key={id} value={id}>{
                  t(`dict:${id}`)
                }</Select.Option>
              ))}
            </Select>
          )
        }</Form.Item>
        <Form.Item
          {...formItemLayout}
          label={t('opt_autopron_en')}
        >{
          getFieldDecorator('config#autopron#en#dict', {
            initialValue: config.autopron.en.dict,
          })(
            <Select>
              <Select.Option value=''>{t('common:none')}</Select.Option>
              {config.autopron.en.list.map(id => (
                <Select.Option key={id} value={id}>{
                  t(`dict:${id}`)
                }</Select.Option>
              ))}
            </Select>
          )
        }</Form.Item>
        {config.autopron.en.dict && (
          <Form.Item
            {...formItemLayout}
            label={t('opt_autopron_accent')}
          >{
            getFieldDecorator('config#autopron#en#accent', {
              initialValue: config.autopron.en.accent,
            })(
              <Select>
                <Select.Option value='uk'>{t('opt_autopron_accent_uk')}</Select.Option>
                <Select.Option value='us'>{t('opt_autopron_accent_us')}</Select.Option>
              </Select>
            )
          }</Form.Item>
        )}
      </Form>
    )
  }
}

export default Form.create<DictFormProps>({
  onFieldsChange: updateConfigOrProfile as any
})(DictForm)
