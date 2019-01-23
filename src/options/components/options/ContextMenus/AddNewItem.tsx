import React from 'react'
import { TranslationFunction } from 'i18next'
import { AppConfig, AppConfigMutable } from '@/app-config'
import { CustomContextItem } from '@/app-config/context-menus'
import { updateConfig } from '@/_helpers/config-manager'
import { genUniqueKey } from '@/_helpers/uniqueKey'

import { FormComponentProps } from 'antd/lib/form'
import { Form, Input, Button, Icon, Row, Col } from 'antd'

export interface AddNewItemProps extends FormComponentProps {
  t: TranslationFunction
  config: AppConfig
}

export class AddNewItem extends React.Component<AddNewItemProps> {
  addNewItem = () => {
    const { config, form } = this.props

    form.validateFields()
    if (Object.values(form.getFieldsError()).some(errs => errs && errs.length > 0)) {
      return
    }

    let { name, url } = form.getFieldsValue() as CustomContextItem
    if (name && url) {
      const { contextMenus } = (config as AppConfigMutable)
      const id = `c_${genUniqueKey()}`
      contextMenus.all[id] = { name, url }
      updateConfig(config)
    }
  }

  render () {
    const { t } = this.props
    const { getFieldDecorator } = this.props.form

    return (
      <Form>
        <p style={{ marginTop: '1em' }}>{t('opt_context_menus_add_rules')}</p>
        <Row gutter={5}>
          <Col span={12}>
            <Form.Item help='' style={{ marginBottom: 0 }}>{
              getFieldDecorator('name', {
                rules: [{ whitespace: true, required: true }],
              })(
                <Input placeholder={t('common:name')} />
              )
            }</Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item help='' style={{ marginBottom: 0 }}>{
              getFieldDecorator('url', {
                rules: [{ type: 'url', whitespace: true, required: true }],
              })(
                <Input placeholder='URL' />
              )
            }</Form.Item>
          </Col>
        </Row>
        <Button
          type='dashed'
          style={{ width: '100%' }}
          onClick={this.addNewItem}
        >
          <Icon type='plus' /> {t('common:add')}
        </Button>
      </Form>
    )
  }
}

export default Form.create()(AddNewItem)
