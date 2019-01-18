import React from 'react'
import { Props } from '../typings'
import { updateConfig, formItemLayout } from '../helpers'

import { FormComponentProps } from 'antd/lib/form'
import { Form, Switch, Row, Col, Radio, InputNumber } from 'antd'

export type DictPanelProps = Props & FormComponentProps

export class DictPanel extends React.Component<DictPanelProps> {
  render () {
    const { t, config } = this.props

    return (
      <Form>
        <Form.Item
          {...formItemLayout}
          label={t('opt_mta')}
          extra={t('opt_profile_change')}
          required
        >{
          this.props.form.getFieldDecorator('mtaAutoUnfold', {
            initialValue: config.mtaAutoUnfold,
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
          this.props.form.getFieldDecorator('searchSuggests', {
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
          this.props.form.getFieldDecorator('animation', {
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
          this.props.form.getFieldDecorator('panelMaxHeightRatio', {
            initialValue: config.panelMaxHeightRatio,
            rules: [{ type: 'number' }],
          })(
            <InputNumber formatter={v => `${v}  %`} />
          )
        }</Form.Item>
        <Form.Item
          {...formItemLayout}
          label={t('opt_dict_panel_width')}
        >{
          this.props.form.getFieldDecorator('panelWidth', {
            initialValue: config.panelWidth,
          })(
            <InputNumber formatter={v => `${v}  px`} />
          )
        }</Form.Item>
        <Form.Item
          {...formItemLayout}
          label={t('opt_dict_panel_font_size')}
        >{
          this.props.form.getFieldDecorator('fontSize', {
            initialValue: config.fontSize,
          })(
            <InputNumber formatter={v => `${v}  px`} />
          )
        }</Form.Item>
      </Form>
    )
  }
}

export default Form.create<DictPanelProps>({
  onValuesChange: updateConfig
})(DictPanel)
