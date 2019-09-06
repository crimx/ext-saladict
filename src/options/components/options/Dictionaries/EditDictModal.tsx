import React from 'react'
import { DictID } from '@/app-config'
import { Props } from '../typings'
import { updateConfigOrProfile, formItemModalLayout } from '../helpers'
import { DictItem } from '@/app-config/dicts'
import { supportedLangs } from '@/_helpers/lang-check'
import { InputNumberGroup } from '../../InputNumberGroup'

import { FormComponentProps } from 'antd/lib/form'
import { Form, Modal, Switch, Checkbox, Radio } from 'antd'

export type EditDictModalProps = Props &
  FormComponentProps & {
    dictID: DictID | ''
    onClose?: () => void
  }

export class EditDictModal extends React.Component<EditDictModalProps> {
  renderMoreOptions = (dictID: DictID) => {
    const { t, i18n, profile } = this.props
    const { getFieldDecorator } = this.props.form
    const dict = profile.dicts.all[dictID] as DictItem
    const options = dict['options']
    if (!options) {
      return
    }

    const optionPath = `profile#dicts#all#${dictID}#options#`

    return (
      <>
        <p>{t('dict.more_options')}</p>
        {Object.keys(options).map(optKey => {
          // can be number | boolean | string(select)
          const value = options[optKey]
          switch (typeof value) {
            case 'number':
              return (
                <Form.Item
                  {...formItemModalLayout}
                  key={optKey}
                  label={t(`dicts:${dictID}.options.${optKey}`)}
                  help={
                    i18n.exists(`dicts:${dictID}.helpers.${optKey}`)
                      ? t(`dicts:${dictID}.helpers.${optKey}`)
                      : null
                  }
                >
                  {getFieldDecorator(optionPath + optKey, {
                    initialValue: value,
                    rules: [{ type: 'number' }]
                  })(
                    <InputNumberGroup
                      suffix={t(`dicts:${dictID}.options.${optKey}_unit`)}
                    />
                  )}
                </Form.Item>
              )
            case 'boolean':
              return (
                <Form.Item
                  {...formItemModalLayout}
                  key={optKey}
                  label={t(`dicts:${dictID}.options.${optKey}`)}
                  help={
                    i18n.exists(`dicts:${dictID}.helpers.${optKey}`)
                      ? t(`dicts:${dictID}.helpers.${optKey}`)
                      : null
                  }
                >
                  {getFieldDecorator(optionPath + optKey, {
                    initialValue: value,
                    valuePropName: 'checked'
                  })(<Switch />)}
                </Form.Item>
              )
            case 'string':
              return (
                <Form.Item
                  {...formItemModalLayout}
                  key={optKey}
                  label={t(`dicts:${dictID}.options.${optKey}`)}
                  help={
                    i18n.exists(`dicts:${dictID}.helpers.${optKey}`)
                      ? t(`dicts:${dictID}.helpers.${optKey}`)
                      : null
                  }
                  style={{ marginBottom: 0 }}
                >
                  {getFieldDecorator(optionPath + optKey, {
                    initialValue: value
                  })(
                    <Radio.Group>
                      {dict['options_sel'][optKey].map(option => (
                        <Radio value={option} key={option}>
                          {t(`dicts:${dictID}.options.${optKey}-${option}`)}
                        </Radio>
                      ))}
                    </Radio.Group>
                  )}
                </Form.Item>
              )
          }
        })}
      </>
    )
  }

  render() {
    const { onClose, dictID, t, profile } = this.props
    const { getFieldDecorator } = this.props.form
    const dictPath = `profile#dicts#all#${dictID}`
    const allDict = profile.dicts.all

    return (
      <Modal
        visible={!!dictID}
        title={dictID && t(`dicts:${dictID}.name`)}
        destroyOnClose
        onOk={onClose}
        onCancel={onClose}
        footer={null}
      >
        {dictID && (
          <Form>
            <Form.Item
              {...formItemModalLayout}
              label={t('dict.sel_lang')}
              help={t('dict.sel_lang_help')}
              extra={
                <span style={{ color: '#c0392b' }}>
                  {t('opt.sel_lang_warning')}
                </span>
              }
            >
              {supportedLangs.map(lang => (
                <Form.Item key={lang} className="form-item-inline">
                  {getFieldDecorator(`${dictPath}#selectionLang#${lang}`, {
                    initialValue: allDict[dictID].selectionLang[lang],
                    valuePropName: 'checked'
                  })(<Checkbox>{t(`common:lang.${lang}`)}</Checkbox>)}
                </Form.Item>
              ))}
            </Form.Item>
            <Form.Item
              {...formItemModalLayout}
              label={t('dict.default_unfold')}
              help={t('dict.default_unfold_help')}
              extra={
                <span style={{ color: '#c0392b' }}>
                  {t('opt.sel_lang_warning')}
                </span>
              }
            >
              {supportedLangs.map(lang => (
                <Form.Item key={lang} className="form-item-inline">
                  {getFieldDecorator(`${dictPath}#defaultUnfold#${lang}`, {
                    initialValue: allDict[dictID].defaultUnfold[lang],
                    valuePropName: 'checked'
                  })(<Checkbox>{t(`common:lang.${lang}`)}</Checkbox>)}
                </Form.Item>
              ))}
            </Form.Item>
            <Form.Item
              {...formItemModalLayout}
              label={t('dict.sel_word_count')}
              help={t('dict.sel_word_count_help')}
            >
              <Form.Item className="form-item-inline" help="">
                {getFieldDecorator(`${dictPath}#selectionWC#min`, {
                  initialValue: allDict[dictID].selectionWC.min,
                  rules: [{ type: 'number', whitespace: true }]
                })(<InputNumberGroup suffix={t('common:min')} />)}
              </Form.Item>
              <Form.Item className="form-item-inline" help="">
                {getFieldDecorator(`${dictPath}#selectionWC#max`, {
                  initialValue: allDict[dictID].selectionWC.max,
                  rules: [{ type: 'number', whitespace: true }]
                })(<InputNumberGroup suffix={t('common:max')} />)}
              </Form.Item>
            </Form.Item>
            <Form.Item
              {...formItemModalLayout}
              label={t('dict.default_height')}
              help={t('dict.default_height_help')}
            >
              {getFieldDecorator(`${dictPath}#preferredHeight`, {
                initialValue: allDict[dictID].preferredHeight,
                rules: [{ type: 'number', whitespace: true }]
              })(<InputNumberGroup suffix="px" />)}
            </Form.Item>
            {this.renderMoreOptions(dictID)}
          </Form>
        )}
      </Modal>
    )
  }
}

export default Form.create<EditDictModalProps>({
  onFieldsChange: updateConfigOrProfile as any
})(EditDictModal)
