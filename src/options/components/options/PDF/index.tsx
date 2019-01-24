import React from 'react'
import { Props } from '../typings'
import { updateConfigOrProfile, formItemLayout } from '../helpers'
import MatchPatternModal from '../../MatchPatternModal'

import { FormComponentProps } from 'antd/lib/form'
import { Form, Switch, Button } from 'antd'

export type PDFProps = Props & FormComponentProps

interface PDFState {
  editingArea: '' | 'pdfWhitelist' | 'pdfBlacklist'
}

export class PDF extends React.Component<PDFProps, PDFState> {
  constructor (props: PDFProps) {
    super(props)

    this.state = {
      editingArea: ''
    }
  }

  closeModal = () => {
    this.setState({ editingArea: '' })
  }

  render () {
    const { t, config } = this.props
    const { getFieldDecorator } = this.props.form

    return (
      <Form>
        <Form.Item
          {...formItemLayout}
          label={t('opt_pdf_sniff')}
          help={t('opt_pdf_sniff_help')}
        >{
          getFieldDecorator('config#pdfSniff', {
            initialValue: config.pdfSniff,
            valuePropName: 'checked',
          })(
            <Switch />
          )
        }</Form.Item>
        <Form.Item
          {...formItemLayout}
          label={t('nav_BlackWhiteList')}
          help={t('opt_pdf_blackwhitelist_help')}
        >
          <Button
            style={{ marginRight: 10 }}
            onClick={() => this.setState({ editingArea: 'pdfBlacklist' })}
          >PDF {t('common:blacklist')}</Button>
          <Button
            onClick={() => this.setState({ editingArea: 'pdfWhitelist' })}
          >PDF {t('common:whitelist')}</Button>
        </Form.Item>
        <MatchPatternModal
          t={t}
          config={config}
          area={this.state.editingArea}
          onClose={this.closeModal}
        />
      </Form>
    )
  }
}

export default Form.create<PDFProps>({
  onFieldsChange: updateConfigOrProfile as any
})(PDF)
