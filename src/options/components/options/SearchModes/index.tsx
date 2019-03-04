import React from 'react'
import { Props } from '../typings'
import { updateConfigOrProfile, formItemLayout } from '../helpers'
import SearchMode from './SearchMode'
import { InputNumberGroup } from '../../InputNumberGroup'

import { FormComponentProps } from 'antd/lib/form'
import { CheckboxChangeEvent } from 'antd/lib/checkbox'
import { Form, Switch, Checkbox } from 'antd'

export type SearchModesProps = Props & FormComponentProps

export class SearchModes extends React.Component<SearchModesProps> {
  langs = {
    'chinese': {
      on: [],
      off: ['japanese', 'korean'],
    },
    'english': {
      on: [],
      off: ['french', 'spanish', 'deutsch'],
    },
    'japanese': {
      on: ['chinese'],
      off: [],
    },
    'korean': {
      on: ['chinese'],
      off: [],
    },
    'french': {
      on: ['english'],
      off: [],
    },
    'spanish': {
      on: ['english'],
      off: [],
    },
    'deutsch': {
      on: ['english'],
      off: [],
    },
    'others': {
      on: [],
      off: [],
    },
  }

  handleLangSelChanged = (e: CheckboxChangeEvent) => {
    const { checked } = e.target
    const arr = this.langs[e.target.name!][checked ? 'on' : 'off']
    if (arr.length > 0) {
      this.props.form.setFieldsValue(
        arr.reduce((o: object, lang: string) => {
          o[`config#language#${lang}`] = checked
          return o
        }, {})
      )
    }
  }

  render () {
    const { t, config } = this.props
    const { getFieldDecorator } = this.props.form

    return (
      <Form>
        <Form.Item
          {...formItemLayout}
          label={t('opt_no_type_field')}
          help={t('opt_no_type_field_help')}
        >{
          getFieldDecorator('config#noTypeField', {
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
          Object.keys(this.langs).map(lang => (
            <Form.Item key={lang} className='form-item-inline'>{
              getFieldDecorator(`config#language#${lang}`, {
                initialValue: config.language[lang],
                valuePropName: 'checked',
              })(
                <Checkbox
                  name={lang}
                  onChange={this.handleLangSelChanged}
                >{t(`common:lang_${lang}`)}</Checkbox>
              )
            }</Form.Item>
          ))
        }</Form.Item>
        <Form.Item
          {...formItemLayout}
          label={t('opt_double_click_delay')}
        >{
          getFieldDecorator('config#doubleClickDelay', {
            initialValue: config.doubleClickDelay,
            rules: [{ type: 'number', whitespace: true }],
          })(
            <InputNumberGroup suffix={t('common:unit_ms')} />
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
  onFieldsChange: updateConfigOrProfile as any
})(SearchModes)
