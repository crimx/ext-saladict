import React from 'react'
import { TranslationFunction } from 'i18next'
import { AppConfig } from '@/app-config'
import { updateConfig } from '@/_helpers/config-manager'
import { matchPatternToRegExpStr } from '@/_helpers/matchPatternToRegExpStr'

import { FormComponentProps } from 'antd/lib/form'
import { Form, Input, Modal, Button, Icon } from 'antd'

export type MatchPatternModalProps = FormComponentProps & {
  t: TranslationFunction
  config: AppConfig
  area: '' | 'pdfWhitelist' | 'pdfBlacklist' | 'whitelist' | 'blacklist'
  onClose: () => void
}

interface MatchPatternModalState {
  additionalItems: [string, string][]
}

const itemStyle: React.CSSProperties = {
  marginBottom: 0
}

export class MatchPatternModal extends React.Component<MatchPatternModalProps, MatchPatternModalState> {
  tainted = false

  state = {
    additionalItems: []
  }

  colsePanel = () => {
    this.tainted = false
    this.setState({ additionalItems: [] })
    this.props.onClose()
  }

  addItem = () => {
    this.setState(({ additionalItems }) => ({
      additionalItems: [...additionalItems, ['', '']]
    }))
  }

  handleOk = () => {
    const { area, config, form } = this.props
    if (area && this.tainted) {
      const values = form.getFieldsValue()
      const length = Object.keys(values).length
      const list = [] as [string, string][]
      for (let i = 0; i < length; i++) {
        const pattern = values[i]
        if (pattern) {
          list.push([matchPatternToRegExpStr(pattern), pattern])
        }
      }
      (config[area] as [string, string][]) = list
      updateConfig(config)
    }
    this.colsePanel()
  }

  handleCancel = () => {
    if (!this.tainted || confirm(this.props.t('common:changes_confirm'))) {
      this.colsePanel()
    }
  }

  validator = (rule: any, pattern: string, callback: Function) => {
    this.tainted = true
    if (matchPatternToRegExpStr(pattern)) {
      return callback()
    }
    callback('incorrect pattern')
  }

  render () {
    const { area, t, config } = this.props
    if (!area) { return null }

    const { getFieldDecorator, getFieldsError } = this.props.form
    const title = (area.startsWith('pdf') ? 'PDF ' : '') +
      t(area.endsWith('hitelist') ? 'common:whitelist' : 'common:blacklist')

    const hasErrors = Object.values(getFieldsError())
      .some(errs => errs && errs.length > 0)

    const length = config[area].length

    return (
      <Modal
        visible={!!area}
        title={title}
        destroyOnClose
        okButtonProps={{ disabled: hasErrors }}
        onOk={this.handleOk}
        onCancel={this.handleCancel}
      >
        <p dangerouslySetInnerHTML={{ __html: t('match_pattern_description') }} />
        <Form>
          {config[area].map(([reg, src], index) => (
            <Form.Item key={index} help='' style={itemStyle}>{
              getFieldDecorator(`${index}`, {
                initialValue: src,
                rules: [{ validator: this.validator }],
              })(
                <Input />
              )
            }</Form.Item>
          ))}
          {this.state.additionalItems.map(([reg, src], index) => (
            <Form.Item key={index + length} help='' style={itemStyle}>{
              getFieldDecorator(`${index + length}`, {
                initialValue: src,
                rules: [{ validator: this.validator }],
              })(
                <Input />
              )
            }</Form.Item>
          ))}
        </Form>
        <Button
          type='dashed'
          style={{ width: '100%', marginTop: 10 }}
          onClick={this.addItem}
        >
          <Icon type='plus' /> {t('common:add')}
        </Button>
      </Modal>
    )
  }
}

export default Form.create()(MatchPatternModal)
