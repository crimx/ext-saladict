import React from 'react'
import { Props } from '../typings'
import {
  updateConfigOrProfile,
  formItemLayout,
  formSubItemLayout
} from '../helpers'
import SearchMode from '../SearchModes/SearchMode'
import { InputNumberGroup } from '../../InputNumberGroup'

import { FormComponentProps } from 'antd/lib/form'
import { Form, Select, Switch, Card, Row, Col } from 'antd'

const locLocale = [...Array(9)].map((_, i) => `quickSearch.locations.${i}`)

type QuickSearchProps = Props & FormComponentProps

export class QuickSearch extends React.Component<QuickSearchProps> {
  render() {
    const { t, config } = this.props
    const { getFieldDecorator } = this.props.form

    return (
      <Form>
        <Form.Item
          {...formItemLayout}
          label={t('opt.quick_search')}
          help={
            <span
              dangerouslySetInnerHTML={{
                __html: t('quickSearch.help')
              }}
            />
          }
        >
          {getFieldDecorator('config#tripleCtrl', {
            initialValue: config.tripleCtrl,
            valuePropName: 'checked'
          })(<Switch />)}
        </Form.Item>
        <Form.Item {...formItemLayout} label={t('quickSearch.loc')}>
          {getFieldDecorator('config#tripleCtrlLocation', {
            initialValue: config.tripleCtrlLocation
          })(
            <Select>
              {locLocale.map((locale, i) => (
                <Select.Option key={i} value={i}>
                  {t(locale)}
                </Select.Option>
              ))}
            </Select>
          )}
        </Form.Item>
        <Form.Item
          {...formItemLayout}
          label={t('preload.title')}
          help={t('preload.help')}
        >
          {getFieldDecorator('config#tripleCtrlPreload', {
            initialValue: config.tripleCtrlPreload
          })(
            <Select>
              <Select.Option value="">{t('common:none')}</Select.Option>
              <Select.Option value="clipboard">
                {t('preload.clipboard')}
              </Select.Option>
              <Select.Option value="selection">
                {t('preload.selection')}
              </Select.Option>
            </Select>
          )}
        </Form.Item>
        {config.tripleCtrlPreload !== '' && (
          <Form.Item
            {...formItemLayout}
            label={t('preload.auto')}
            help={t('preload.auto_help')}
          >
            {getFieldDecorator('config#tripleCtrlAuto', {
              initialValue: config.tripleCtrlAuto,
              valuePropName: 'checked'
            })(<Switch />)}
          </Form.Item>
        )}
        <Form.Item
          {...formItemLayout}
          label={t('quickSearch.standalone')}
          help={
            <span
              dangerouslySetInnerHTML={{
                __html: t('quickSearch.standalone_help')
              }}
            />
          }
        >
          {getFieldDecorator('config#tripleCtrlStandalone', {
            initialValue: config.tripleCtrlStandalone,
            valuePropName: 'checked'
          })(<Switch />)}
        </Form.Item>
        {config.tripleCtrlStandalone && (
          <Row>
            <Col span={11} offset={2}>
              <Card title={t('quickSearch.standalone')}>
                <Form.Item
                  {...formSubItemLayout}
                  label={t('quickSearch.sidebar')}
                  help={t('quickSearch.sidebar_help')}
                >
                  {getFieldDecorator('config#tripleCtrlSidebar', {
                    initialValue: config.tripleCtrlSidebar
                  })(
                    <Select>
                      <Select.Option value="">{t('common:none')}</Select.Option>
                      <Select.Option value="left">
                        {t('quickSearch.locations.4')}
                      </Select.Option>
                      <Select.Option value="right">
                        {t('quickSearch.locations.2')}
                      </Select.Option>
                    </Select>
                  )}
                </Form.Item>
                {!config.tripleCtrlSidebar && (
                  <Form.Item
                    {...formSubItemLayout}
                    label={t('quickSearch.height')}
                  >
                    {getFieldDecorator('config#tripleCtrlHeight', {
                      initialValue: config.tripleCtrlHeight,
                      rules: [{ type: 'number', whitespace: true }]
                    })(<InputNumberGroup suffix="px" />)}
                  </Form.Item>
                )}
                <Form.Item
                  {...formSubItemLayout}
                  label={t('quickSearch.page_sel')}
                  help={t('quickSearch.page_sel_help')}
                >
                  {getFieldDecorator('config#tripleCtrlPageSel', {
                    initialValue: config.tripleCtrlPageSel,
                    valuePropName: 'checked'
                  })(<Switch />)}
                </Form.Item>
                {config.tripleCtrlPageSel && (
                  <SearchMode {...this.props} mode="qsPanelMode" sub={true} />
                )}
              </Card>
            </Col>
          </Row>
        )}
      </Form>
    )
  }
}

export default Form.create<QuickSearchProps>({
  onFieldsChange: updateConfigOrProfile as any
})(QuickSearch)
