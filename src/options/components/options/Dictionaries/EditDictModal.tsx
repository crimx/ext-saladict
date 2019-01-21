import React from 'react'
import { DictID } from '@/app-config'
import { Props } from '../typings'
import { updateConfigOrProfile, formItemModalLayout } from '../helpers'

import { FormComponentProps } from 'antd/lib/form'
import { Form, Modal, InputNumber, Select, Switch, Checkbox } from 'antd'

const { Option } = Select

export type EditDictModalProps = Props & FormComponentProps & {
  dictID: DictID | ''
  onClose?: () => void
}

export class EditDictModal extends React.Component<EditDictModalProps> {
  render () {
    const { onClose, dictID, t, profile } = this.props
    const { getFieldDecorator } = this.props.form
    const dictPath = `profile#dicts#all#${dictID}`
    const allDict = profile.dicts.all

    return (
      <Modal
        visible={!!dictID}
        title={dictID && t(`dict:${dictID}`)}
        destroyOnClose
        onOk={onClose}
        onCancel={onClose}
        footer={null}
      >
        {dictID &&
          <Form>
            <Form.Item
              {...formItemModalLayout}
              label={t('dict_default_unfold')}
              help={t('dict_default_unfold_help')}
            >{
              getFieldDecorator(`${dictPath}#defaultUnfold`, {
                initialValue: allDict[dictID].defaultUnfold,
                valuePropName: 'checked',
              })(
                <Switch />
              )
            }</Form.Item>
            <Form.Item
              {...formItemModalLayout}
              label={t('dict_sel_lang')}
              help={t('dict_sel_lang_help')}
            >{
              ['eng', 'chs', 'minor'].map(lang => (
                <Form.Item key={lang} className='form-item-inline'>{
                  getFieldDecorator(`${dictPath}#selectionLang#${lang}`, {
                    initialValue: allDict[dictID].selectionLang[lang],
                    valuePropName: 'checked',
                  })(
                    <Checkbox>{t(`common:lang_${lang}`)}</Checkbox>
                  )
                }</Form.Item>
              ))
            }</Form.Item>
            <Form.Item
              {...formItemModalLayout}
              label={t('dict_sel_word_count')}
              help={t('dict_sel_word_count_help')}
            >
              <Form.Item className='form-item-inline' help=''>{
                getFieldDecorator(`${dictPath}#selectionWC#min`, {
                  initialValue: allDict[dictID].selectionWC.min,
                  rules: [{ type: 'number' }],
                })(
                  <InputNumber formatter={v => `${t('common:min')} ${v}`} />
                )
              }</Form.Item>
              <Form.Item className='form-item-inline' help=''>{
                getFieldDecorator(`${dictPath}#selectionWC#max`, {
                  initialValue: allDict[dictID].selectionWC.max,
                  rules: [{ type: 'number' }],
                })(
                  <InputNumber formatter={v => `${t('common:max')} ${v}`} />
                )
              }</Form.Item>
            </Form.Item>
            <Form.Item
              {...formItemModalLayout}
              label={t('dict_default_height')}
              help={t('dict_default_height_help')}
            >{
              getFieldDecorator(`${dictPath}#preferredHeight`, {
                initialValue: allDict[dictID].preferredHeight,
                rules: [{ type: 'number' }],
              })(
                <InputNumber formatter={v => `${v}  px`} />
              )
            }</Form.Item>
            {allDict[dictID].options &&
              <>
                <p>{t('dict_more_options')}</p>
                {Object.keys(allDict[dictID].options!).map(optKey => {
                  // can be number | boolean | string(select)
                  const value = allDict[dictID].options![optKey]
                  switch (typeof value) {
                    case 'number':
                      return (
                        <Form.Item
                          {...formItemModalLayout}
                          key={optKey}
                          label={t(`dict:${dictID}_${optKey}`)}
                        >{
                          getFieldDecorator(`${dictPath}#options#${optKey}`, {
                            initialValue: value,
                            rules: [{ type: 'number' }],
                          })(
                            <InputNumber formatter={v => `${v}  ${t(`dict:${dictID}_${optKey}_unit`)}`} />
                          )
                        }</Form.Item>
                      )
                    case 'boolean':
                      return (
                        <Form.Item
                          {...formItemModalLayout}
                          key={optKey}
                          label={t(`dict:${dictID}_${optKey}`)}
                        >{
                          getFieldDecorator(`${dictPath}#options#${optKey}`, {
                            initialValue: value,
                            valuePropName: 'checked',
                          })(
                            <Switch />
                          )
                        }</Form.Item>
                      )
                    case 'string':
                      return (
                        <Form.Item
                          {...formItemModalLayout}
                          key={optKey}
                          label={t(`dict:${dictID}_${optKey}`)}
                        >{
                          getFieldDecorator(`${dictPath}#options#${optKey}`, {
                            initialValue: value,
                          })(
                            <Select>
                              {allDict[dictID].options_sel![optKey].map(option => (
                                <Option value={option} key={option}>{
                                  t(`dict:${dictID}_${optKey}-${option}`)
                                }</Option>
                              ))}
                            </Select>
                          )
                        }</Form.Item>
                      )
                  }
                })}
              </>
            }
          </Form>
        }
      </Modal>
    )
  }
}

export default Form.create<EditDictModalProps>({
  onValuesChange: updateConfigOrProfile
})(EditDictModal)
