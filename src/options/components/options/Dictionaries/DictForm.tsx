import React from 'react'
import { Props } from '../typings'
import { updateConfigOrProfile, formItemLayout } from '../helpers'

import { FormComponentProps } from 'antd/lib/form'
import { Form, Select } from 'antd'

export type DictFormProps = Props & FormComponentProps

export class DictForm extends React.Component<DictFormProps> {
  render () {
    const { t, config } = this.props

    return (
      <Form>
        <Form.Item
          {...formItemLayout}
          label={t('opt_autopron_cn')}
        >{
          this.props.form.getFieldDecorator('config#autopron#cn#dict', {
            initialValue: config.autopron.cn.dict,
          })(
            <Select>
              <Select.Option value=''>{t('common:none')}</Select.Option>
              {config.autopron.cn.list.map(id => (
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
          this.props.form.getFieldDecorator('config#autopron#en#dict', {
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
            this.props.form.getFieldDecorator('config#autopron#en#accent', {
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
  onValuesChange: updateConfigOrProfile
})(DictForm)
