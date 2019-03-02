import React from 'react'
import { Props } from '../typings'
import { updateConfigOrProfile, formItemLayout, formSubItemLayout } from '../helpers'
import SearchMode from '../SearchModes/SearchMode'
import { InputNumberGroup } from '../../InputNumberGroup'

import { FormComponentProps } from 'antd/lib/form'
import { Form, Select, Switch, Card, Row, Col } from 'antd'

const locLocale = [...Array(9)].map((_, i) => `quick_search_loc_${i}`)

export class QuickSearch extends React.Component<Props & FormComponentProps> {

  render () {
    const { t, config } = this.props
    const { getFieldDecorator } = this.props.form

    return (
      <Form>
        <Form.Item
          {...formItemLayout}
          label={t('opt_quick_search')}
          help={<span dangerouslySetInnerHTML={{
            __html: t('opt_quick_search_help')
          }} />}
        >{
          getFieldDecorator('config#tripleCtrl', {
            initialValue: config.tripleCtrl,
            valuePropName: 'checked',
          })(
            <Switch />
          )
        }</Form.Item>
        <Form.Item
          {...formItemLayout}
          label={t('opt_quick_search_loc')}
        >{
          getFieldDecorator('config#tripleCtrlLocation', {
            initialValue: config.tripleCtrlLocation,
          })(
            <Select>{
              locLocale.map((locale, i) => (
                <Select.Option key={i} value={i}>{t(locale)}</Select.Option>
              ))
            }</Select>
          )
        }</Form.Item>
        <Form.Item
          {...formItemLayout}
          label={t('preload')}
          help={t('preload_help')}
        >{
          getFieldDecorator('config#tripleCtrlPreload', {
            initialValue: config.tripleCtrlPreload,
          })(
            <Select>
              <Select.Option value=''>{t('common:none')}</Select.Option>
              <Select.Option value='clipboard'>{t('preload_clipboard')}</Select.Option>
              <Select.Option value='selection'>{t('preload_selection')}</Select.Option>
            </Select>
          )
        }</Form.Item>
        {config.tripleCtrlPreload !== '' &&
          <Form.Item
            {...formItemLayout}
            label={t('preload_auto')}
            help={t('preload_auto_help')}
          >{
            getFieldDecorator('config#tripleCtrlAuto', {
              initialValue: config.tripleCtrlAuto,
              valuePropName: 'checked',
            })(
              <Switch />
            )
          }</Form.Item>
        }
        <Form.Item
          {...formItemLayout}
          label={t('opt_quick_search_standalone')}
          help={<span dangerouslySetInnerHTML={{ __html: t('opt_quick_search_standalone_help') }} />}
        >{
          getFieldDecorator('config#tripleCtrlStandalone', {
            initialValue: config.tripleCtrlStandalone,
            valuePropName: 'checked',
          })(
            <Switch />
          )
        }</Form.Item>
        {config.tripleCtrlStandalone && (
          <Row>
            <Col span={11} offset={2}>
              <Card title={t('opt_quick_search_standalone')}>
                <Form.Item
                  {...formSubItemLayout}
                  label={t('opt_quick_search_page_sel')}
                  help={t('opt_quick_search_page_sel_help')}
                >{
                  getFieldDecorator('config#tripleCtrlPageSel', {
                    initialValue: config.tripleCtrlPageSel,
                    valuePropName: 'checked',
                  })(
                    <Switch />
                  )
                }</Form.Item>
                <Form.Item
                  {...formSubItemLayout}
                  label={t('opt_quick_search_height')}
                >{
                  getFieldDecorator('config#tripleCtrlHeight', {
                    initialValue: config.tripleCtrlHeight,
                    rules: [{ type: 'number', whitespace: true }],
                  })(
                    <InputNumberGroup suffix='px' />
                  )
                }</Form.Item>
                <SearchMode {...this.props} mode='qsPanelMode' sub={true} />
              </Card>
            </Col>
          </Row>
        )}
      </Form>
    )
  }
}

export default Form.create({
  onFieldsChange: updateConfigOrProfile as any
})(QuickSearch)
