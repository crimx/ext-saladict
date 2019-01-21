import React from 'react'
import { Props } from '../typings'
import { updateConfigOrProfile, formItemLayout } from '../helpers'
import SearchMode from './SearchMode'

import { FormComponentProps } from 'antd/lib/form'
import { Form, Switch, InputNumber, Checkbox } from 'antd'

export type SearchModesProps = Props & FormComponentProps

export class SearchModes extends React.Component<SearchModesProps> {
  render () {
    const { t, config } = this.props

    return (
      <Form>
        <Form.Item
          {...formItemLayout}
          label={t('opt_no_type_field')}
          help={t('opt_no_type_field_help')}
        >{
          this.props.form.getFieldDecorator('config#noTypeField', {
            initialValue: config.noTypeField,
            valuePropName: 'checked',
          })(
            <Switch />
          )
        }</Form.Item>
        <Form.Item
          {...formItemLayout}
          label={t('opt_sel_lang')}
          help={t('opt_sel_lang_help')}
        >{
          ['chinese', 'english', 'minor'].map(lang => (
            <Form.Item key={lang} className='form-item-inline'>{
              this.props.form.getFieldDecorator(`config#language#${lang}`, {
                initialValue: config.language[lang],
                valuePropName: 'checked',
              })(
                <Checkbox>{t(`common:lang_${lang}`)}</Checkbox>
              )
            }</Form.Item>
          ))
        }</Form.Item>
        <Form.Item
          {...formItemLayout}
          label={t('opt_double_click_delay')}
        >{
          this.props.form.getFieldDecorator('config#doubleClickDelay', {
            initialValue: config.doubleClickDelay,
            rules: [{ type: 'number' }],
          })(
            <InputNumber formatter={v => `${v}  ${t('common:unit_ms')}`} />
          )
        }</Form.Item>
        <SearchMode {...this.props} mode='mode' />
        <SearchMode {...this.props} mode='pinMode' />
        <SearchMode {...this.props} mode='panelMode' />
      </Form>
    )
  }
}

export default Form.create<SearchModesProps>({
  onValuesChange: updateConfigOrProfile
})(SearchModes)
