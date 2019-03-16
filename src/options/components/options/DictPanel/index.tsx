import React from 'react'
import { Props } from '../typings'
import { updateConfigOrProfile, formItemLayout } from '../helpers'
import { InputNumberGroup } from '../../InputNumberGroup'

import { FormComponentProps } from 'antd/lib/form'
import { Form, Switch, Row, Col, Radio, Input } from 'antd'

export type DictPanelProps = Props & FormComponentProps

export class DictPanel extends React.Component<DictPanelProps> {
  render () {
    const { t, config, profile } = this.props
    const { getFieldDecorator } = this.props.form

    return (
      <Form>
        <Form.Item
          {...formItemLayout}
          label={t('opt_mta')}
          extra={t('opt_profile_change')}
          required
        >{
          getFieldDecorator('profile#mtaAutoUnfold', {
            initialValue: profile.mtaAutoUnfold,
          })(
            <Radio.Group>
              <Row>
                <Col span={12}><Radio value=''>{t('opt_mta_never')}</Radio></Col>
                <Col span={12}><Radio value='once'>{t('opt_mta_once')}</Radio></Col>
              </Row>
              <Row>
                <Col span={12}><Radio value='always'>{t('opt_mta_always')}</Radio></Col>
                <Col span={12}><Radio value='popup'>{t('opt_mta_popup')}</Radio></Col>
              </Row>
            </Radio.Group>
          )
        }</Form.Item>
        <Form.Item
          {...formItemLayout}
          label={t('opt_search_suggests')}
        >{
          getFieldDecorator('config#searchSuggests', {
            initialValue: config.searchSuggests,
            valuePropName: 'checked',
          })(
            <Switch />
          )
        }</Form.Item>
        <Form.Item
          {...formItemLayout}
          label={t('opt_animation')}
          help={t('opt_animation_help')}
        >{
          getFieldDecorator('config#animation', {
            initialValue: config.animation,
            valuePropName: 'checked',
          })(
            <Switch />
          )
        }</Form.Item>
        <Form.Item
          {...formItemLayout}
          label={t('opt_dict_panel_height_ratio')}
        >{
          getFieldDecorator('config#panelMaxHeightRatio', {
            initialValue: config.panelMaxHeightRatio,
            rules: [{ type: 'number', whitespace: true }],
          })(
            <InputNumberGroup suffix='%' />
          )
        }</Form.Item>
        <Form.Item
          {...formItemLayout}
          label={t('opt_dict_panel_width')}
        >{
          getFieldDecorator('config#panelWidth', {
            initialValue: config.panelWidth,
            rules: [{ type: 'number', whitespace: true }],
          })(
            <InputNumberGroup suffix='px' />
          )
        }</Form.Item>
        <Form.Item
          {...formItemLayout}
          label={t('opt_dict_panel_font_size')}
        >{
          getFieldDecorator('config#fontSize', {
            initialValue: config.fontSize,
            rules: [{ type: 'number', whitespace: true }],
          })(
            <InputNumberGroup suffix='px' />
          )
        }</Form.Item>
        <Form.Item
          {...formItemLayout}
          label={t('opt_dict_panel_custom_css')}
          help={t('opt_dict_panel_custom_css_help')}
          extra={
            <a
              href='https://github.com/crimx/ext-saladict/wiki/PanelCSS#wiki-content'
              target='_blank'
              rel='nofollow'
            >Examples</a>
          }
        >{
          getFieldDecorator('config#panelCSS', {
            initialValue: config.panelCSS,
          })(
            <Input.TextArea
              placeholder='.saladict-DictPanel .panel-DictContainer { }'
              autosize={{ minRows: 4, maxRows: 15 }}
            />
          )
        }</Form.Item>
      </Form>
    )
  }
}

export default Form.create<DictPanelProps>({
  onFieldsChange: updateConfigOrProfile as any
})(DictPanel)
